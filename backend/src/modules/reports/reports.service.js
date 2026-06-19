import { FeePayment } from "../../models/FeePayment.js";
import { FeeAssignment } from "../../models/FeeAssignment.js";
import { FeeRefund } from "../../models/FeeRefund.js";
import { Fine } from "../../models/Fine.js";
import { Payroll } from "../../models/Payroll.js";
import { Student } from "../../models/Student.js";
import { User } from "../../models/User.js";
import { Admission } from "../../models/Admission.js";
import { Attendance } from "../../models/Attendance.js";

const dateRange = (from, to) => {
  const range = {};
  if (from) range.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.$lte = end;
  }
  return Object.keys(range).length ? range : null;
};

export const getOverviewReport = async () => {
  const [
    totalStudents,
    totalTeachers,
    feeCollectedAgg,
    pendingAgg,
    refundAgg,
    finePendingAgg,
    finePaidAgg,
    payrollPendingAgg,
    payrollPaidAgg,
  ] = await Promise.all([
    Student.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: "TEACHER", isDeleted: false, isActive: true }),
    FeePayment.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$netAmount" } } },
    ]),
    FeeAssignment.aggregate([
      { $match: { isDeleted: false, status: { $in: ["PENDING", "PARTIAL"] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$amount", "$paidAmount"] } } } },
    ]),
    FeeRefund.aggregate([
      { $match: { isDeleted: false, status: "PROCESSED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Fine.aggregate([
      { $match: { isDeleted: false, status: "PENDING" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Fine.aggregate([
      { $match: { isDeleted: false, status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payroll.aggregate([
      { $match: { isDeleted: false, status: "PENDING" } },
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ]),
    Payroll.aggregate([
      { $match: { isDeleted: false, status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$netSalary" } } },
    ]),
  ]);

  return {
    totalStudents,
    totalTeachers,
    feeCollected: feeCollectedAgg[0]?.total || 0,
    pendingFees: pendingAgg[0]?.total || 0,
    refundsProcessed: refundAgg[0]?.total || 0,
    finesPending: finePendingAgg[0]?.total || 0,
    finesCollected: finePaidAgg[0]?.total || 0,
    payrollPending: payrollPendingAgg[0]?.total || 0,
    payrollPaid: payrollPaidAgg[0]?.total || 0,
  };
};

export const getFeeCollectionReport = async (query) => {
  const filter = { isDeleted: false };
  const range = dateRange(query.from, query.to);
  if (range) filter.paidAt = range;
  if (query.feeType) filter.feeType = query.feeType;

  const [payments, summary] = await Promise.all([
    FeePayment.find(filter)
      .sort({ paidAt: -1 })
      .limit(500)
      .populate("studentId", "firstName lastName className rollNumber")
      .lean(),
    FeePayment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$feeType",
          total: { $sum: "$netAmount" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return { payments, summary, totalCollected: summary.reduce((s, r) => s + r.total, 0) };
};

export const getPendingFeesReport = async () => {
  const items = await FeeAssignment.find({
    isDeleted: false,
    status: { $in: ["PENDING", "PARTIAL"] },
  })
    .populate("studentId", "firstName lastName className section rollNumber admissionNo")
    .sort({ dueDate: 1 })
    .lean();

  return items.map((a) => ({
    student: a.studentId,
    title: a.title,
    feeType: a.feeType,
    totalAmount: a.amount,
    paidAmount: a.paidAmount,
    pendingAmount: a.amount - a.paidAmount,
    status: a.status,
    dueDate: a.dueDate,
    month: a.month,
  }));
};

export const getRefundReport = async (query) => {
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  const range = dateRange(query.from, query.to);
  if (range) filter.createdAt = range;

  const items = await FeeRefund.find(filter)
    .sort({ createdAt: -1 })
    .populate("studentId", "firstName lastName className")
    .lean();

  const total = items.reduce((s, i) => s + (i.status === "PROCESSED" ? i.amount : 0), 0);
  return { items, total };
};

export const getFineReport = async (query) => {
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;
  if (query.fineType) filter.fineType = query.fineType;

  const items = await Fine.find(filter)
    .sort({ createdAt: -1 })
    .populate("studentId", "firstName lastName className")
    .lean();

  const summary = await Fine.aggregate([
    { $match: filter },
    { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);

  return { items, summary };
};

export const getPayrollReport = async (query) => {
  const filter = { isDeleted: false };
  if (query.month) filter.month = query.month;
  if (query.year) filter.year = Number(query.year);
  if (query.status) filter.status = query.status;

  const items = await Payroll.find(filter).sort({ year: -1, month: -1 }).lean();
  const total = items.reduce((s, i) => s + i.netSalary, 0);
  return { items, total };
};

export const getStudentReport = async () => {
  const byClass = await Student.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$className", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const byGender = await Student.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$gender", count: { $sum: 1 } } },
  ]);

  const total = await Student.countDocuments({ isDeleted: false });
  return { total, byClass, byGender };
};

export const getAdmissionReport = async (query) => {
  const filter = { isDeleted: false };
  const range = dateRange(query.from, query.to);
  if (range) filter.createdAt = range;

  const [total, byStatus, recent] = await Promise.all([
    Admission.countDocuments(filter),
    Admission.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Admission.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: "studentId", select: "firstName lastName className" })
      .lean(),
  ]);

  return { total, byStatus, recent };
};

export const getAttendanceReport = async (query) => {
  const filter = { isDeleted: false };
  const range = dateRange(query.from, query.to);
  if (range) filter.date = range;

  const summary = await Attendance.aggregate([
    { $match: filter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const byClass = await Attendance.aggregate([
    { $match: filter },
    { $group: { _id: { className: "$className", status: "$status" }, count: { $sum: 1 } } },
  ]);

  return { summary, byClass };
};

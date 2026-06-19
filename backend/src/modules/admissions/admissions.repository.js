import { Admission } from "../../models/Admission.js";
import { FeeAssignment } from "../../models/FeeAssignment.js";
import { FeePayment } from "../../models/FeePayment.js";
import { Student } from "../../models/Student.js";

const genReceipt = () => `RCP-${Date.now()}`;

const monthLabel = (date) =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

const createFeeRecordsForStudent = async (student, payload, actorId) => {
  const admissionFee = Number(payload.admissionFee || 0);
  const monthlyFee = Number(payload.monthlyFee || 0);
  const admissionFeePaid = Boolean(payload.admissionFeePaid);

  if (admissionFee > 0) {
    const assignment = await FeeAssignment.create({
      studentId: student._id,
      feeType: "ADMISSION",
      title: "Admission Fee",
      amount: admissionFee,
      paidAmount: admissionFeePaid ? admissionFee : 0,
      status: admissionFeePaid ? "PAID" : "PENDING",
      academicYear: new Date().getFullYear().toString(),
      createdBy: actorId,
      updatedBy: actorId,
    });

    if (admissionFeePaid) {
      await FeePayment.create({
        studentId: student._id,
        receiptNo: genReceipt(),
        feeType: "ADMISSION",
        amount: admissionFee,
        discount: 0,
        fineAmount: 0,
        netAmount: admissionFee,
        paymentMethod: "CASH",
        remarks: "Admission fee paid at registration",
        paidAt: new Date(),
        receivedBy: actorId,
        createdBy: actorId,
        updatedBy: actorId,
      });
      assignment.paidAmount = admissionFee;
      assignment.status = "PAID";
      await assignment.save();
    }
  }

  if (monthlyFee > 0) {
    const start = new Date();
    const year = start.getFullYear();
    const startMonth = start.getMonth();

    for (let m = startMonth; m < 12; m += 1) {
      const due = new Date(year, m, 1);
      const label = monthLabel(due);
      await FeeAssignment.create({
        studentId: student._id,
        feeType: "TUITION",
        title: `Monthly Fee - ${label}`,
        amount: monthlyFee,
        month: label,
        academicYear: year.toString(),
        dueDate: new Date(year, m, 10),
        createdBy: actorId,
        updatedBy: actorId,
      });
    }
  }
};

export const createStudentAndAdmissionRepo = async (payload, actorId) => {
  const studentPayload = {
    ...payload,
    fatherName: payload.fatherName || payload.guardianName || "",
    cnicBForm: payload.cnicBForm || "",
    address: payload.address || "",
    academicStream: payload.academicStream || "",
    streamDetail: payload.streamDetail || "",
    monthlyFee: Number(payload.monthlyFee || 0),
    admissionFee: Number(payload.admissionFee || 0),
    admissionFeePaid: Boolean(payload.admissionFeePaid),
    createdBy: actorId,
    updatedBy: actorId,
  };

  const student = await Student.create(studentPayload);

  const admission = await Admission.create({
    studentId: student._id,
    status: "APPROVED",
    createdBy: actorId,
    updatedBy: actorId,
  });

  await createFeeRecordsForStudent(student, payload, actorId);

  return { student, admission };
};

export const listAdmissionsRepo = async ({ page, limit, search, className, from, to }) => {
  const skip = (page - 1) * limit;
  const studentFilter = { isDeleted: false };

  if (search) {
    studentFilter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { fatherName: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { admissionNo: { $regex: search, $options: "i" } },
    ];
  }

  if (className) {
    studentFilter.className = className;
  }

  if (from || to) {
    studentFilter.admissionDate = {};
    if (from) studentFilter.admissionDate.$gte = new Date(from);
    if (to) studentFilter.admissionDate.$lte = new Date(to);
  }

  const students = await Student.find(studentFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Student.countDocuments(studentFilter);

  const studentIds = students.map((item) => item._id);
  const admissions = await Admission.find({ studentId: { $in: studentIds }, isDeleted: false }).lean();
  const admissionByStudentId = new Map(admissions.map((item) => [item.studentId.toString(), item]));

  return {
    items: students.map((student) => ({
      ...student.toObject(),
      admission: admissionByStudentId.get(student._id.toString()) || null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

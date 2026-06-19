import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/User.js";
import { Student } from "../../models/Student.js";
import { Admission } from "../../models/Admission.js";
import { Attendance } from "../../models/Attendance.js";
import { getPendingFeesSummary } from "../fees/fees.service.js";
import { getOverviewReport } from "../reports/reports.service.js";
import { getTeacherAttendanceStats } from "../teacher-attendance/teacherAttendance.service.js";

export const superAdminDashboard = asyncHandler(async (_req, res) => {
  const [totalStudents, totalTeachers, totalStaff, totalOnLeave, monthlyAdmissionsAgg, overview, pendingFeeAlerts] =
    await Promise.all([
      Student.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: "TEACHER", isDeleted: false, isActive: true }),
      User.countDocuments({ role: { $in: ["TEACHER", "ACCOUNTANT"] }, isDeleted: false, isActive: true }),
      User.countDocuments({ isDeleted: false, isActive: false }),
      Admission.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      getOverviewReport(),
      getPendingFeesSummary(),
    ]);

  const [recentAdmissions, classNames, teacherAttendance, todayStudentAttendance] = await Promise.all([
    Student.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName className section admissionDate")
      .lean(),
    Student.distinct("className", { isDeleted: false }),
    getTeacherAttendanceStats(),
    (() => {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date();
      dayEnd.setHours(23, 59, 59, 999);
      return Attendance.find({
        isDeleted: false,
        date: { $gte: dayStart, $lte: dayEnd },
      }).lean();
    })(),
  ]);

  const totalClasses = classNames.filter(Boolean).length;
  const feeCollected = overview.feeCollected;
  const pendingFees = overview.pendingFees;
  const presentTeachers = teacherAttendance.presentTeachers;
  const absentTeachers = teacherAttendance.absentTeachers;
  const presentStudents = todayStudentAttendance.filter(
    (row) => row.status === "PRESENT" || row.status === "LATE"
  ).length;
  const absentStudents = todayStudentAttendance.filter((row) => row.status === "ABSENT").length;
  const attendancePercentage = totalStudents
    ? Math.round((presentStudents / totalStudents) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      cards: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalStaff,
        feeCollected,
        pendingFees,
        attendancePercentage,
        presentTeachers,
        absentTeachers,
        presentStudents,
        absentStudents,
        totalOnLeave: teacherAttendance.onLeave,
      },
      pendingFeeCount: pendingFeeAlerts.length,
      feeStatus: {
        collected: feeCollected,
        pending: pendingFees,
        overdue: pendingFeeAlerts.filter((p) => p.dueDate && new Date(p.dueDate) < new Date()).length,
      },
      recentAdmissions: recentAdmissions.map((item) => ({
        id: item._id,
        name: `${item.firstName} ${item.lastName}`,
        className: item.section ? `${item.className} - ${item.section}` : item.className,
        date: item.admissionDate,
      })),
      charts: {
        monthlyAdmissions: monthlyAdmissionsAgg.map((row) => ({
          label: row._id,
          value: row.count,
        })),
        attendanceTrend: [],
      },
    },
  });
});

export const teacherDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments({ isDeleted: false });
  res.status(200).json({
    success: true,
    data: {
      teacherId: req.user._id,
      cards: {
        assignedClasses: 0,
        todaysAttendance: 0,
        totalStudents,
        pendingTasks: 0,
      },
    },
  });
});

export const getPendingFees = asyncHandler(async (_req, res) => {
  const data = await getPendingFeesSummary();
  res.status(200).json({ success: true, data });
});

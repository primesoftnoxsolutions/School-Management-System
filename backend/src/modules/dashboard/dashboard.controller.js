import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/User.js";
import { Student } from "../../models/Student.js";
import { Admission } from "../../models/Admission.js";

export const superAdminDashboard = asyncHandler(async (_req, res) => {
  const [totalStudents, totalTeachers, totalStaff, totalOnLeave, monthlyAdmissionsAgg] =
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
    ]);

  const [recentAdmissions, classNames] = await Promise.all([
    Student.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName className section admissionDate")
      .lean(),
    Student.distinct("className", { isDeleted: false }),
  ]);

  const totalClasses = classNames.filter(Boolean).length;
  const pendingFees = 0;
  const feeCollected = 0;
  const presentTeachers = totalTeachers;
  const absentTeachers = 0;
  const presentStudents = totalStudents;
  const absentStudents = 0;
  const pendingFeeAlerts = [];

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
        attendancePercentage: totalStudents ? 100 : 0,
        presentTeachers,
        absentTeachers,
        presentStudents,
        absentStudents,
        totalOnLeave,
      },
      pendingFeeCount: pendingFeeAlerts.length,
      feeStatus: {
        collected: feeCollected,
        pending: pendingFees,
        overdue: 0,
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
  res.status(200).json({
    success: true,
    data: [],
  });
});

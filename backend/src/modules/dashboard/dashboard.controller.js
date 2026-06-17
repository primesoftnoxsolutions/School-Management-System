import { asyncHandler } from "../../utils/asyncHandler.js";

export const superAdminDashboard = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      cards: {
        totalStudents: 0,
        totalTeachers: 0,
        totalStaff: 0,
        monthlyRevenue: 0,
        pendingFees: 0,
        feeCollectionToday: 0,
        payrollExpense: 0,
        attendancePercentage: 0,
      },
      charts: {
        monthlyAdmissions: [],
        feeCollectionTrend: [],
        attendanceTrend: [],
        payrollTrend: [],
        studentGrowth: [],
      },
    },
  });
});

export const teacherDashboard = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      teacherId: req.user._id,
      cards: {
        assignedClasses: 0,
        todaysAttendance: 0,
        totalStudents: 0,
        pendingTasks: 0,
      },
    },
  });
});

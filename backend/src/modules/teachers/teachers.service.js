import { User } from "../../models/User.js";
import { TeacherActivity } from "../../models/TeacherActivity.js";
import { TeacherClass } from "../../models/TeacherClass.js";
import { ApiError } from "../../utils/apiError.js";
import { registerUser } from "../auth/auth.service.js";

export const createTeacher = async (payload, actorId) => {
  const { fullName, email, password } = payload;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email, password are required");
  }

  return registerUser({
    fullName,
    email,
    password,
    role: "TEACHER",
    actorId,
  });
};

export const listTeachers = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;
  const filter = { role: "TEACHER", isDeleted: false };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("_id fullName email isActive createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};

export const getTeacherActivities = async ({ page, limit, search, from, to }) => {
  const skip = (page - 1) * limit;
  const teacherFilter = { role: "TEACHER", isDeleted: false };

  if (search) {
    teacherFilter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const teachers = await User.find(teacherFilter).select("_id").lean();
  const teacherIds = teachers.map((item) => item._id);

  const activityFilter = { isDeleted: false, teacherId: { $in: teacherIds } };

  if (from || to) {
    activityFilter.performedAt = {};
    if (from) activityFilter.performedAt.$gte = from;
    if (to) activityFilter.performedAt.$lte = to;
  }

  const [activities, total] = await Promise.all([
    TeacherActivity.find(activityFilter)
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("teacherId", "fullName email")
      .lean(),
    TeacherActivity.countDocuments(activityFilter),
  ]);

  return {
    activities,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getMyTeacherPanel = async (teacherId) => {
  const teacher = await User.findById(teacherId).select("_id fullName email role isActive").lean();
  if (!teacher || teacher.role !== "TEACHER") {
    throw new ApiError(403, "Teacher panel access denied");
  }

  const [activities, totalActivities, assignedClasses, todayActivities] = await Promise.all([
    TeacherActivity.find({ teacherId, isDeleted: false })
      .sort({ performedAt: -1 })
      .limit(20)
      .lean(),
    TeacherActivity.countDocuments({ teacherId, isDeleted: false }),
    TeacherClass.countDocuments({ teacherId, isDeleted: false }),
    (() => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return TeacherActivity.countDocuments({
        teacherId,
        isDeleted: false,
        performedAt: { $gte: startOfToday },
      });
    })(),
  ]);

  return {
    teacher,
    summary: {
      assignedClasses,
      todaysActivities: todayActivities,
      totalActivities,
      status: teacher.isActive ? "Active" : "Inactive",
    },
    recentActivities: activities,
  };
};

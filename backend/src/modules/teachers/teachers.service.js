import { User } from "../../models/User.js";
import { TeacherActivity } from "../../models/TeacherActivity.js";
import { TeacherClass } from "../../models/TeacherClass.js";
import { ApiError } from "../../utils/apiError.js";
import { registerUser } from "../auth/auth.service.js";

const normalizeAssignments = (payload) => {
  if (Array.isArray(payload.assignments) && payload.assignments.length) {
    return payload.assignments
      .map((row) => ({
        className: row.className?.trim(),
        section: (row.section || "").trim(),
        subject: (row.subject || "").trim(),
      }))
      .filter((row) => row.className && row.section && row.subject);
  }

  if (payload.className) {
    const section = (payload.section || "").trim();
    const subject = (payload.subject || "").trim();
    if (!section) return [];
    return [
      {
        className: payload.className.trim(),
        section,
        subject: subject || "Class Teacher",
      },
    ];
  }

  return [];
};

const saveTeacherAssignments = async (teacherId, assignments, actorId) => {
  await TeacherClass.updateMany({ teacherId, isDeleted: false }, { $set: { isDeleted: true, updatedBy: actorId } });

  for (const row of assignments) {
    await TeacherClass.create({
      teacherId,
      className: row.className,
      section: row.section,
      subject: row.subject,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
};

export const createTeacher = async (payload, actorId) => {
  const { fullName, email, password } = payload;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email, password are required");
  }

  const assignments = normalizeAssignments(payload);
  if (!assignments.length) {
    throw new ApiError(400, "At least one class assignment with section and subject is required");
  }

  const teacher = await registerUser({
    fullName,
    email,
    password,
    role: "TEACHER",
    actorId,
  });

  await saveTeacherAssignments(teacher.id, assignments, actorId);

  await TeacherActivity.create({
    teacherId: teacher.id,
    action: "ASSIGN",
    module: "TEACHERS",
    details: `Assigned to ${assignments.map((a) => `${a.className} ${a.section} (${a.subject})`).join(", ")}`,
    status: "SUCCESS",
    performedAt: new Date(),
    createdBy: actorId,
    updatedBy: actorId,
  });

  return {
    ...teacher,
    assignedClasses: assignments,
  };
};

export const updateTeacher = async (id, payload, actorId) => {
  const teacher = await User.findOne({ _id: id, role: "TEACHER", isDeleted: false });
  if (!teacher) throw new ApiError(404, "Teacher not found");

  if (payload.fullName) teacher.fullName = payload.fullName.trim();
  if (payload.email) teacher.email = payload.email.toLowerCase().trim();
  if (payload.password) teacher.password = payload.password;
  if (typeof payload.isActive === "boolean") teacher.isActive = payload.isActive;
  teacher.updatedBy = actorId;
  await teacher.save();

  if (payload.assignments) {
    const assignments = normalizeAssignments(payload);
    if (!assignments.length) {
      throw new ApiError(400, "At least one class assignment with section and subject is required");
    }
    await saveTeacherAssignments(teacher._id, assignments, actorId);
    await TeacherActivity.create({
      teacherId: teacher._id,
      action: "UPDATE",
      module: "TEACHERS",
      details: `Updated assignments: ${assignments.map((a) => `${a.className} ${a.section} (${a.subject})`).join(", ")}`,
      status: "SUCCESS",
      performedAt: new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  const assignedClasses = await TeacherClass.find({ teacherId: teacher._id, isDeleted: false })
    .select("className section subject")
    .lean();

  return {
    id: teacher._id,
    fullName: teacher.fullName,
    email: teacher.email,
    isActive: teacher.isActive,
    assignedClasses,
  };
};

export const getTeachersByClass = async ({ className, section }) => {
  if (!className) throw new ApiError(400, "className is required");

  const filter = { className: className.trim(), isDeleted: false };
  if (section) filter.section = section.trim();

  const rows = await TeacherClass.find(filter)
    .populate({ path: "teacherId", match: { isDeleted: false }, select: "fullName email isActive" })
    .sort({ createdAt: -1 })
    .lean();

  return rows
    .filter((row) => row.teacherId)
    .map((row) => ({
      teacherId: row.teacherId._id,
      fullName: row.teacherId.fullName,
      email: row.teacherId.email,
      isActive: row.teacherId.isActive,
      className: row.className,
      section: row.section,
      subject: row.subject,
    }));
};
export const listTeachers = async ({ page, limit, search, className, section }) => {
  const skip = (page - 1) * limit;
  const filter = { role: "TEACHER", isDeleted: false };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  let teacherIdsFilter = null;
  if (className) {
    const classFilter = { className, isDeleted: false };
    if (section) classFilter.section = section;
    const classRows = await TeacherClass.find(classFilter).select("teacherId").lean();
    teacherIdsFilter = classRows.map((row) => row.teacherId);
    if (!teacherIdsFilter.length) {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }
    filter._id = { $in: teacherIdsFilter };
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

  const teacherIds = items.map((item) => item._id);
  const assignedClasses = await TeacherClass.find({
    teacherId: { $in: teacherIds },
    isDeleted: false,
  })
    .select("teacherId className section subject")
    .lean();

  const classMap = new Map();
  assignedClasses.forEach((row) => {
    const key = row.teacherId.toString();
    if (!classMap.has(key)) classMap.set(key, []);
    classMap.get(key).push(row);
  });

  const enriched = items.map((teacher) => ({
    ...teacher,
    assignedClasses: classMap.get(teacher._id.toString()) || [],
  }));

  return { items: enriched, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
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

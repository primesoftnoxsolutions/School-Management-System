import { User } from "../../models/User.js";
import { TeacherActivity } from "../../models/TeacherActivity.js";
import { TeacherClass } from "../../models/TeacherClass.js";
import { TeacherProfile } from "../../models/TeacherProfile.js";
import { ApiError } from "../../utils/apiError.js";
import { registerUser } from "../auth/auth.service.js";

const normalizeAssignments = (payload) => {
  if (Array.isArray(payload.assignments) && payload.assignments.length) {
    return payload.assignments
      .map((row) => ({
        className: row.className?.trim(),
        branch: row.branch === "Boys" ? "Boys" : "Girls",
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
      branch: row.branch || "Girls",
      section: row.section,
      subject: row.subject,
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
};

const saveTeacherProfile = async (teacherId, payload, actorId) => {
  const profileData = {
    cnic: (payload.cnic || "").trim(),
    address: (payload.address || "").trim(),
    phoneNumber: (payload.phoneNumber || "").trim(),
    designation: (payload.designation || "").trim(),
    qualification: (payload.qualification || "").trim(),
    expertise: (payload.expertise || "").trim(),
    salary: payload.salary === "" || payload.salary == null ? null : Number(payload.salary),
    allowPasswordReset: payload.allowPasswordReset !== false,
    updatedBy: actorId,
  };

  if (payload.password) {
    profileData.loginPassword = payload.password;
  }

  await TeacherProfile.findOneAndUpdate(
    { teacherId, isDeleted: false },
    { $set: profileData, $setOnInsert: { teacherId, createdBy: actorId } },
    { upsert: true, new: true }
  );
};

const getTeacherProfilesMap = async (teacherIds) => {
  if (!teacherIds.length) return new Map();
  const profiles = await TeacherProfile.find({ teacherId: { $in: teacherIds }, isDeleted: false })
    .select("+loginPassword")
    .lean();
  const map = new Map();
  profiles.forEach((profile) => map.set(profile.teacherId.toString(), profile));
  return map;
};

export const createTeacher = async (payload, actorId) => {
  const { fullName, email, password } = payload;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "fullName, email, password are required");
  }

  const assignments = normalizeAssignments(payload);

  const teacher = await registerUser({
    fullName,
    email,
    password,
    role: "TEACHER",
    actorId,
  });

  if (assignments.length) {
    await saveTeacherAssignments(teacher.id, assignments, actorId);
    await TeacherActivity.create({
      teacherId: teacher.id,
      action: "ASSIGN",
      module: "TEACHERS",
      details: `Assigned to ${assignments.map((a) => `${a.branch} ${a.className} ${a.section} (${a.subject})`).join(", ")}`,
      status: "SUCCESS",
      performedAt: new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  } else {
    await TeacherActivity.create({
      teacherId: teacher.id,
      action: "CREATE",
      module: "TEACHERS",
      details: "Teacher created without class assignment",
      status: "SUCCESS",
      performedAt: new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  await saveTeacherProfile(teacher.id, payload, actorId);

  return {
    ...teacher,
    assignedClasses: assignments,
    profile: {
      cnic: (payload.cnic || "").trim(),
      address: (payload.address || "").trim(),
      phoneNumber: (payload.phoneNumber || "").trim(),
      designation: (payload.designation || "").trim(),
      qualification: (payload.qualification || "").trim(),
      expertise: (payload.expertise || "").trim(),
      salary: payload.salary === "" || payload.salary == null ? null : Number(payload.salary),
      allowPasswordReset: payload.allowPasswordReset !== false,
    },
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

  if (
    payload.password ||
    payload.cnic != null ||
    payload.address != null ||
    payload.phoneNumber != null ||
    payload.designation != null ||
    payload.qualification != null ||
    payload.expertise != null ||
    payload.salary != null ||
    payload.allowPasswordReset != null
  ) {
    await saveTeacherProfile(teacher._id, payload, actorId);
  }

  if (Array.isArray(payload.assignments)) {
    const assignments = normalizeAssignments(payload);
    await saveTeacherAssignments(teacher._id, assignments, actorId);
    await TeacherActivity.create({
      teacherId: teacher._id,
      action: "UPDATE",
      module: "TEACHERS",
      details: assignments.length
        ? `Updated assignments: ${assignments.map((a) => `${a.branch} ${a.className} ${a.section} (${a.subject})`).join(", ")}`
        : "Removed all class assignments (NO ASSIGN)",
      status: "SUCCESS",
      performedAt: new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  const assignedClasses = await TeacherClass.find({ teacherId: teacher._id, isDeleted: false })
    .select("className branch section subject")
    .lean();
  const profile = await TeacherProfile.findOne({ teacherId: teacher._id, isDeleted: false }).lean();

  return {
    id: teacher._id,
    fullName: teacher.fullName,
    email: teacher.email,
    isActive: teacher.isActive,
    assignedClasses,
    profile,
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
  const [assignedClasses, profileMap] = await Promise.all([
    TeacherClass.find({
      teacherId: { $in: teacherIds },
      isDeleted: false,
    })
      .select("teacherId className branch section subject")
      .lean(),
    getTeacherProfilesMap(teacherIds),
  ]);

  const classMap = new Map();
  assignedClasses.forEach((row) => {
    const key = row.teacherId.toString();
    if (!classMap.has(key)) classMap.set(key, []);
    classMap.get(key).push(row);
  });

  const enriched = items.map((teacher) => ({
    ...teacher,
    assignedClasses: classMap.get(teacher._id.toString()) || [],
    profile: profileMap.get(teacher._id.toString()) || null,
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

export const removeTeacherFromSchool = async (id, actorId) => {
  const teacher = await User.findOne({ _id: id, role: "TEACHER", isDeleted: false });
  if (!teacher) throw new ApiError(404, "Teacher not found");

  teacher.isDeleted = true;
  teacher.isActive = false;
  teacher.updatedBy = actorId;
  await teacher.save();

  await TeacherClass.updateMany(
    { teacherId: teacher._id, isDeleted: false },
    { $set: { isDeleted: true, updatedBy: actorId } }
  );

  await TeacherProfile.updateMany(
    { teacherId: teacher._id, isDeleted: false },
    { $set: { isDeleted: true, updatedBy: actorId } }
  );

  await TeacherActivity.create({
    teacherId: teacher._id,
    action: "DELETE",
    module: "TEACHERS",
    details: `Removed from school: ${teacher.fullName}`,
    status: "SUCCESS",
    performedAt: new Date(),
    createdBy: actorId,
    updatedBy: actorId,
  });

  return { id: teacher._id, fullName: teacher.fullName };
};

const parseHistoryDate = (value, endOfDay = false) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(
    year,
    month,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const getTeacherAssignmentHistory = async ({ from, to, className, section, page, limit }) => {
  const fromDate = parseHistoryDate(from, false);
  const toDate = parseHistoryDate(to, true);

  if (!fromDate || !toDate) {
    throw new ApiError(400, "Valid from and to dates are required");
  }
  if (fromDate > toDate) {
    throw new ApiError(400, "From date cannot be after To date");
  }

  const normalizedClass = (className || "").trim();
  const normalizedSection = (section || "").trim();

  const skip = (page - 1) * limit;
  const filter = {
    createdAt: { $gte: fromDate, $lte: toDate },
  };

  if (normalizedClass && normalizedClass !== "ALL_CLASSES") {
    filter.className = normalizedClass;
  }
  if (normalizedSection && normalizedSection !== "ALL_SECTIONS") {
    filter.section = normalizedSection;
  }

  const [rows, total] = await Promise.all([
    TeacherClass.find(filter)
      .populate({ path: "teacherId", select: "fullName email isActive isDeleted" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TeacherClass.countDocuments(filter),
  ]);

  const items = rows
    .filter((row) => row.teacherId)
    .map((row) => ({
      id: row._id.toString(),
      teacherId: row.teacherId._id.toString(),
      teacherName: row.teacherId.fullName,
      email: row.teacherId.email,
      className: row.className,
      section: row.section || "A",
      subject: row.subject,
      assignedAt: row.createdAt,
      assignmentStatus: row.isDeleted ? "Removed" : "Active",
      teacherStatus: row.teacherId.isDeleted ? "Removed" : row.teacherId.isActive ? "Active" : "Inactive",
    }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

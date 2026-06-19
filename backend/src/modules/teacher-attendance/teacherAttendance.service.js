import { User } from "../../models/User.js";
import { TeacherDailyAttendance } from "../../models/TeacherDailyAttendance.js";
import { ApiError } from "../../utils/apiError.js";

const startOfDay = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (dateInput) => {
  const d = startOfDay(dateInput);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getTeacherAttendanceStats = async (dateInput) => {
  const dayStart = startOfDay(dateInput);
  const dayEnd = endOfDay(dateInput);

  const teachers = await User.find({
    role: "TEACHER",
    isDeleted: false,
    isActive: true,
  })
    .select("_id")
    .lean();

  const totalTeachers = teachers.length;
  const teacherIds = teachers.map((t) => t._id);

  const records = await TeacherDailyAttendance.find({
    teacherId: { $in: teacherIds },
    isDeleted: false,
    date: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  const presentTeachers = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const absentTeachers = records.filter((r) => r.status === "ABSENT").length;
  const onLeave = records.filter((r) => r.status === "LEAVE").length;
  const unmarked = totalTeachers - records.length;

  return {
    totalTeachers,
    presentTeachers,
    absentTeachers,
    onLeave,
    unmarked,
    marked: records.length,
  };
};

export const listTeacherAttendance = async (dateInput) => {
  const dayStart = startOfDay(dateInput);
  const dayEnd = endOfDay(dateInput);

  const teachers = await User.find({
    role: "TEACHER",
    isDeleted: false,
    isActive: true,
  })
    .select("_id fullName email")
    .sort({ fullName: 1 })
    .lean();

  const teacherIds = teachers.map((t) => t._id);

  const records = await TeacherDailyAttendance.find({
    teacherId: { $in: teacherIds },
    isDeleted: false,
    date: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  const recordMap = new Map(records.map((r) => [r.teacherId.toString(), r]));

  const items = teachers.map((teacher) => {
    const record = recordMap.get(teacher._id.toString());
    return {
      teacherId: teacher._id,
      fullName: teacher.fullName,
      email: teacher.email,
      status: record?.status || "UNMARKED",
      recordId: record?._id || null,
      remarks: record?.remarks || "",
      markedAt: record?.updatedAt || null,
    };
  });

  const stats = await getTeacherAttendanceStats(dateInput);

  return { date: dayStart, items, stats };
};

export const markTeacherAttendance = async (payload, actorId) => {
  const { teacherId, status, date, remarks } = payload;

  if (!teacherId || !status) {
    throw new ApiError(400, "teacherId and status are required");
  }

  if (!["PRESENT", "ABSENT", "LATE", "LEAVE"].includes(status)) {
    throw new ApiError(400, "Invalid attendance status");
  }

  const teacher = await User.findOne({
    _id: teacherId,
    role: "TEACHER",
    isDeleted: false,
    isActive: true,
  });

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  const day = startOfDay(date);

  const record = await TeacherDailyAttendance.findOneAndUpdate(
    { teacherId, date: day, isDeleted: false },
    {
      $set: {
        status,
        remarks: remarks?.trim() || "",
        markedBy: actorId,
        updatedBy: actorId.toString(),
      },
      $setOnInsert: {
        teacherId,
        date: day,
        createdBy: actorId.toString(),
      },
    },
    { upsert: true, new: true }
  );

  const stats = await getTeacherAttendanceStats(day);

  return { record, stats };
};

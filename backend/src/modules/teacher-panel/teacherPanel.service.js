import { TeacherClass } from "../../models/TeacherClass.js";
import { Attendance } from "../../models/Attendance.js";
import { AcademicRecord } from "../../models/AcademicRecord.js";
import { TeacherReport } from "../../models/TeacherReport.js";
import { Student } from "../../models/Student.js";
import { ApiError } from "../../utils/apiError.js";
import { logTeacherActivity } from "./activityLogger.js";

const parsePage = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const search = (query.search || "").trim();
  return { page, limit, search, skip: (page - 1) * limit };
};

const paginate = (items, total, page, limit) => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

const ensureTeacherOwnership = (doc, teacherId, label = "Record") => {
  if (!doc || doc.isDeleted) throw new ApiError(404, `${label} not found`);
  if (doc.teacherId.toString() !== teacherId.toString()) {
    throw new ApiError(403, "You can only manage your own records");
  }
};

// --- Classes ---

export const listMyClasses = async (teacherId, query) => {
  const { page, limit, search, skip } = parsePage(query);
  const filter = { teacherId, isDeleted: false };
  if (search) {
    filter.$or = [
      { className: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { section: { $regex: search, $options: "i" } },
    ];
  }
  const [items, total] = await Promise.all([
    TeacherClass.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    TeacherClass.countDocuments(filter),
  ]);
  return paginate(items, total, page, limit);
};

export const createMyClass = async (teacherId, payload) => {
  const { className, section, subject, roomNo, schedule } = payload;
  if (!className || !subject) throw new ApiError(400, "className and subject are required");

  const item = await TeacherClass.create({
    teacherId,
    className: className.trim(),
    section: (section || "A").trim(),
    subject: subject.trim(),
    roomNo: roomNo?.trim() || "",
    schedule: schedule?.trim() || "",
    createdBy: teacherId.toString(),
  });

  await logTeacherActivity(teacherId, "CREATE", "MY_CLASSES", `Added class ${className} - ${subject}`);
  return item;
};

export const updateMyClass = async (teacherId, id, payload) => {
  const item = await TeacherClass.findById(id);
  ensureTeacherOwnership(item, teacherId, "Class");

  const fields = ["className", "section", "subject", "roomNo", "schedule"];
  fields.forEach((key) => {
    if (payload[key] !== undefined) item[key] = payload[key];
  });
  item.updatedBy = teacherId.toString();
  await item.save();

  await logTeacherActivity(teacherId, "UPDATE", "MY_CLASSES", `Updated class ${item.className}`);
  return item;
};

export const deleteMyClass = async (teacherId, id) => {
  const item = await TeacherClass.findById(id);
  ensureTeacherOwnership(item, teacherId, "Class");
  item.isDeleted = true;
  item.updatedBy = teacherId.toString();
  await item.save();
  await logTeacherActivity(teacherId, "DELETE", "MY_CLASSES", `Removed class ${item.className}`);
  return { id };
};

// --- Students for dropdown ---

export const listStudentsForClass = async (teacherId, className, section) => {
  if (!className) throw new ApiError(400, "className is required");

  const owned = await TeacherClass.findOne({
    teacherId,
    className,
    section: section || "A",
    isDeleted: false,
  }).lean();

  if (!owned) {
    throw new ApiError(403, "You can only access students from your assigned classes");
  }

  const students = await Student.find({
    className,
    section: section || "A",
    isDeleted: false,
  })
    .select("_id admissionNo firstName lastName className section")
    .sort({ firstName: 1 })
    .lean();

  return students;
};

// --- Attendance ---

export const listAttendance = async (teacherId, query) => {
  const { page, limit, search, skip } = parsePage(query);
  const filter = { teacherId, isDeleted: false };

  if (query.date) {
    const day = new Date(query.date);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    filter.date = { $gte: day, $lt: next };
  }

  if (search) {
    filter.$or = [
      { className: { $regex: search, $options: "i" } },
      { remarks: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "firstName lastName admissionNo")
      .lean(),
    Attendance.countDocuments(filter),
  ]);

  return paginate(items, total, page, limit);
};

export const createAttendance = async (teacherId, payload) => {
  const { studentId, className, section, date, status, remarks } = payload;
  if (!studentId || !className || !date) {
    throw new ApiError(400, "studentId, className and date are required");
  }

  await listStudentsForClass(teacherId, className, section);

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  try {
    const item = await Attendance.create({
      teacherId,
      studentId,
      className: className.trim(),
      section: (section || "A").trim(),
      date: attendanceDate,
      status: status || "PRESENT",
      remarks: remarks?.trim() || "",
      createdBy: teacherId.toString(),
    });

    await logTeacherActivity(teacherId, "CREATE", "ATTENDANCE", `Marked ${status} for ${className}`);
    return item;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, "Attendance already marked for this student on this date");
    }
    throw err;
  }
};

export const updateAttendance = async (teacherId, id, payload) => {
  const item = await Attendance.findById(id);
  ensureTeacherOwnership(item, teacherId, "Attendance");

  if (payload.status !== undefined) item.status = payload.status;
  if (payload.remarks !== undefined) item.remarks = payload.remarks;
  if (payload.date !== undefined) {
    const d = new Date(payload.date);
    d.setHours(0, 0, 0, 0);
    item.date = d;
  }
  item.updatedBy = teacherId.toString();
  await item.save();

  await logTeacherActivity(teacherId, "UPDATE", "ATTENDANCE", `Updated attendance record`);
  return item;
};

export const deleteAttendance = async (teacherId, id) => {
  const item = await Attendance.findById(id);
  ensureTeacherOwnership(item, teacherId, "Attendance");
  item.isDeleted = true;
  item.updatedBy = teacherId.toString();
  await item.save();
  await logTeacherActivity(teacherId, "DELETE", "ATTENDANCE", `Deleted attendance record`);
  return { id };
};

// --- Academic Records ---

export const listAcademicRecords = async (teacherId, query) => {
  const { page, limit, search, skip } = parsePage(query);
  const filter = { teacherId, isDeleted: false };
  if (search) {
    filter.$or = [
      { subject: { $regex: search, $options: "i" } },
      { examType: { $regex: search, $options: "i" } },
      { className: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    AcademicRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "firstName lastName admissionNo")
      .lean(),
    AcademicRecord.countDocuments(filter),
  ]);

  return paginate(items, total, page, limit);
};

export const createAcademicRecord = async (teacherId, payload) => {
  const { studentId, className, section, subject, examType, marks, maxMarks, grade, remarks } = payload;
  if (!studentId || !className || !subject || !examType || marks === undefined || !maxMarks) {
    throw new ApiError(400, "studentId, className, subject, examType, marks and maxMarks are required");
  }

  await listStudentsForClass(teacherId, className, section);

  const item = await AcademicRecord.create({
    teacherId,
    studentId,
    className: className.trim(),
    section: (section || "A").trim(),
    subject: subject.trim(),
    examType: examType.trim(),
    marks: Number(marks),
    maxMarks: Number(maxMarks),
    grade: grade?.trim() || "",
    remarks: remarks?.trim() || "",
    createdBy: teacherId.toString(),
  });

  await logTeacherActivity(teacherId, "CREATE", "ACADEMIC_RECORDS", `Added ${examType} record for ${subject}`);
  return item;
};

export const updateAcademicRecord = async (teacherId, id, payload) => {
  const item = await AcademicRecord.findById(id);
  ensureTeacherOwnership(item, teacherId, "Academic record");

  const fields = ["subject", "examType", "marks", "maxMarks", "grade", "remarks", "className", "section"];
  fields.forEach((key) => {
    if (payload[key] !== undefined) item[key] = payload[key];
  });
  item.updatedBy = teacherId.toString();
  await item.save();

  await logTeacherActivity(teacherId, "UPDATE", "ACADEMIC_RECORDS", `Updated academic record`);
  return item;
};

export const deleteAcademicRecord = async (teacherId, id) => {
  const item = await AcademicRecord.findById(id);
  ensureTeacherOwnership(item, teacherId, "Academic record");
  item.isDeleted = true;
  item.updatedBy = teacherId.toString();
  await item.save();
  await logTeacherActivity(teacherId, "DELETE", "ACADEMIC_RECORDS", `Deleted academic record`);
  return { id };
};

// --- Reports ---

export const listReports = async (teacherId, query) => {
  const { page, limit, search, skip } = parsePage(query);
  const filter = { teacherId, isDeleted: false };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { summary: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    TeacherReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    TeacherReport.countDocuments(filter),
  ]);

  return paginate(items, total, page, limit);
};

export const createReport = async (teacherId, payload) => {
  const { title, reportType, summary, periodFrom, periodTo } = payload;
  if (!title || !summary) throw new ApiError(400, "title and summary are required");

  const item = await TeacherReport.create({
    teacherId,
    title: title.trim(),
    reportType: reportType || "GENERAL",
    summary: summary.trim(),
    periodFrom: periodFrom ? new Date(periodFrom) : null,
    periodTo: periodTo ? new Date(periodTo) : null,
    createdBy: teacherId.toString(),
  });

  await logTeacherActivity(teacherId, "CREATE", "REPORTS", `Created report: ${title}`);
  return item;
};

export const updateReport = async (teacherId, id, payload) => {
  const item = await TeacherReport.findById(id);
  ensureTeacherOwnership(item, teacherId, "Report");

  const fields = ["title", "reportType", "summary", "periodFrom", "periodTo"];
  fields.forEach((key) => {
    if (payload[key] !== undefined) {
      item[key] = ["periodFrom", "periodTo"].includes(key) && payload[key]
        ? new Date(payload[key])
        : payload[key];
    }
  });
  item.updatedBy = teacherId.toString();
  await item.save();

  await logTeacherActivity(teacherId, "UPDATE", "REPORTS", `Updated report: ${item.title}`);
  return item;
};

export const deleteReport = async (teacherId, id) => {
  const item = await TeacherReport.findById(id);
  ensureTeacherOwnership(item, teacherId, "Report");
  item.isDeleted = true;
  item.updatedBy = teacherId.toString();
  await item.save();
  await logTeacherActivity(teacherId, "DELETE", "REPORTS", `Deleted report: ${item.title}`);
  return { id };
};

export const getClassOptions = async (teacherId) => {
  return TeacherClass.find({ teacherId, isDeleted: false })
    .select("_id className section subject")
    .sort({ className: 1 })
    .lean();
};

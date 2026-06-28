import { Student } from "../../models/Student.js";
import { Attendance } from "../../models/Attendance.js";
import { FeeAssignment } from "../../models/FeeAssignment.js";
import { FeePayment } from "../../models/FeePayment.js";
import { ApiError } from "../../utils/apiError.js";
import mongoose from "mongoose";

const CLASS_ORDER = [
  "Play Group",
  "Nursery",
  "Prep",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
];

const generateAdmissionNo = () => {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-6);
  return `REG-${year}-${suffix}`;
};

const generateStudentLoginId = (data) => {
  const fullName = `${String(data.firstName || "")}${String(data.lastName || "")}`
    .replace(/[^a-z]/gi, "")
    .toLowerCase();
  if (!fullName) return "student@gmail.com";
  return `${fullName}@gmail.com`;
};

const generateStudentLoginPassword = (data) => {
  const lettersPool = `${String(data.firstName || "")}${String(data.lastName || "")}`
    .replace(/[^a-z]/gi, "")
    .toUpperCase() || "STUDENT";
  const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  const dobDigits = dob && !Number.isNaN(dob.getTime())
    ? `${dob.getFullYear()}${String(dob.getMonth() + 1).padStart(2, "0")}${String(dob.getDate()).padStart(2, "0")}`
    : "";
  const digitsPool =
    `${String(data.admissionNo || "")}${String(data.rollNumber || "")}${String(data.cnicBForm || "")}${dobDigits}`
      .replace(/\D/g, "") || `${Date.now()}`;
  const byPool = "BY";
  const glPool = "GL";

  let hash = 0;
  const seed = `${lettersPool}|${digitsPool}|${String(data.admissionNo || "")}|BY|GL`;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }

  const pick = (pool, offset = 0) => pool[(hash + offset) % pool.length];
  const passwordParts = [
    pick(lettersPool, 0),
    pick(lettersPool, 3),
    pick(digitsPool, 1),
    pick(digitsPool, 5),
    pick(lettersPool, 7),
    pick(lettersPool, 11),
    pick(digitsPool, 13),
    pick(digitsPool, 17),
    pick(byPool, hash % byPool.length),
    pick(glPool, (hash + 1) % glPool.length),
  ];

  return passwordParts.join("").slice(0, 10);
};

export const getNextRollNumber = async (className, section = "A") => {
  if (!className) throw new ApiError(400, "className is required");

  const rows = await Student.find({
    className,
    section: section || "A",
    isDeleted: false,
  })
    .select("rollNumber")
    .lean();

  const numbers = rows
    .map((row) => parseInt(String(row.rollNumber || "").replace(/\D/g, ""), 10))
    .filter((value) => !Number.isNaN(value));

  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return String(next).padStart(2, "0");
};

export const getNextClass = (current) => {
  if (!current) return null;
  const normalized = current.trim();
  const idx = CLASS_ORDER.findIndex((c) => c.toLowerCase() === normalized.toLowerCase());
  if (idx >= 0) return CLASS_ORDER[idx + 1] || null;

  const match = normalized.match(/grade\s*(\d+)/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n < 10) return `Grade ${n + 1}`;
    return null;
  }
  return null;
};

const parsePage = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const search = (query.search || "").trim();
  const className = (query.className || "").trim();
  const section = (query.section || "").trim();
  const status = (query.status || "").trim();
  return { page, limit, search, className, section, status, skip: (page - 1) * limit };
};

const buildSearchFilter = (search) => {
  if (!search) return null;
  return {
    $or: [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { fatherName: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { admissionNo: { $regex: search, $options: "i" } },
      { guardianPhone: { $regex: search, $options: "i" } },
      { cnicBForm: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ],
  };
};

const normalizePreviousResults = (payload) => {
  if (Array.isArray(payload.previousResults) && payload.previousResults.length) {
    return payload.previousResults
      .map((row) => ({
        previousClass: (row.previousClass || "").trim(),
        resultGrade: (row.resultGrade || row.previousResultGrade || "").trim(),
        percentage: (row.percentage || row.previousResultPercentage || "").trim(),
        documentUrl: row.documentUrl || "",
      }))
      .filter((row) => row.previousClass || row.resultGrade || row.percentage || row.documentUrl);
  }

  const legacy = {
    previousClass: (payload.previousClass || "").trim(),
    resultGrade: (payload.previousResultGrade || "").trim(),
    percentage: (payload.previousResultPercentage || "").trim(),
    documentUrl: "",
  };

  return legacy.previousClass || legacy.resultGrade || legacy.percentage ? [legacy] : [];
};

const monthLabel = (date) => date.toLocaleString("en-US", { month: "long", year: "numeric" });

const createFeeRecordsForStudent = async (student, payload, actorId) => {
  const admissionFee = Number(payload.admissionFee || 0);
  const annualFee = Number(payload.annualFee || 0);
  const monthlyFee = Number(payload.monthlyFee || 0);
  const installmentCount = Math.max(0, Number(payload.installmentCount || 0));
  const useInstallments = Boolean(payload.useInstallments) && installmentCount > 0 && monthlyFee > 0;

  if (admissionFee > 0) {
    await FeeAssignment.create({
      studentId: student._id,
      feeType: "ADMISSION",
      title: "Admission Fee",
      amount: admissionFee,
      academicYear: new Date().getFullYear().toString(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  }

  if (useInstallments) {
    const start = new Date();
    for (let i = 0; i < installmentCount; i += 1) {
      const due = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const label = monthLabel(due);
      await FeeAssignment.create({
        studentId: student._id,
        feeType: "TUITION",
        title: `Installment ${i + 1} of ${installmentCount} - ${label}`,
        amount: monthlyFee,
        month: label,
        academicYear: due.getFullYear().toString(),
        dueDate: new Date(due.getFullYear(), due.getMonth(), 10),
        createdBy: actorId,
        updatedBy: actorId,
      });
    }
  } else if (annualFee > 0) {
    await FeeAssignment.create({
      studentId: student._id,
      feeType: "ANNUAL",
      title: "Annual Fee",
      amount: annualFee,
      academicYear: new Date().getFullYear().toString(),
      createdBy: actorId,
      updatedBy: actorId,
    });
  }
};

const normalizePayload = (payload) => {
  const fatherName = (payload.fatherName || payload.guardianName || "").trim();
  const previousResults = normalizePreviousResults(payload);
  const firstPrevious = previousResults[0] || {};

  return {
    firstName: payload.firstName?.trim(),
    lastName: payload.lastName?.trim(),
    rollNumber: payload.rollNumber?.trim() || "",
    fatherName,
    cnicBForm: payload.cnicBForm?.trim() || "",
    guardianName: fatherName || payload.guardianName?.trim(),
    guardianPhone: payload.guardianPhone?.trim(),
    gender: payload.gender,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : new Date("2010-01-01"),
    className: payload.className?.trim(),
    section: (payload.section || "A").trim(),
    address: payload.address?.trim() || "",
    admissionNo: payload.admissionNo?.trim() || generateAdmissionNo(),
    loginId: payload.loginId?.trim() || "",
    admissionDate: payload.admissionDate ? new Date(payload.admissionDate) : new Date(),
    studentPhotoUrl: payload.studentPhotoUrl || null,
    phoneNumber: payload.phoneNumber?.trim() || "",
    maritalStatus: payload.maritalStatus || "SINGLE",
    fatherCnic: payload.fatherCnic?.trim() || "",
    fatherOccupation: payload.fatherOccupation?.trim() || "",
    alternativePhone: payload.alternativePhone?.trim() || "",
    previousClass: firstPrevious.previousClass || payload.previousClass?.trim() || "",
    previousResultGrade: firstPrevious.resultGrade || payload.previousResultGrade?.trim() || "",
    previousResultPercentage: firstPrevious.percentage || payload.previousResultPercentage?.trim() || "",
    previousResults,
    subjects: Array.isArray(payload.subjects)
      ? payload.subjects.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    schoolLeavingCertificate: payload.schoolLeavingCertificate || "",
    characterCertificate: payload.characterCertificate || "",
    status: payload.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    admissionFee: Math.max(0, Number(payload.admissionFee || 0)),
    annualFee: Math.max(0, Number(payload.annualFee || 0)),
    monthlyFee: Math.max(0, Number(payload.monthlyFee || 0)),
    installmentCount: Math.max(0, Number(payload.installmentCount || 0)),
    useInstallments: Boolean(payload.useInstallments),
    loginPassword: payload.loginPassword?.trim() || "",
  };
};

const validateStudentPayload = (data, isUpdate = false) => {
  const required = isUpdate
    ? []
    : ["firstName", "lastName", "fatherName", "guardianPhone", "gender", "className"];

  const missing = required.filter((field) => !data[field]);
  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }
};

const ensureUniqueRoll = async (className, section, rollNumber, excludeId = null) => {
  if (!rollNumber) return;

  const filter = {
    className,
    section: section || "A",
    rollNumber,
    isDeleted: false,
  };

  if (excludeId) filter._id = { $ne: excludeId };

  const exists = await Student.findOne(filter).lean();
  if (exists) {
    throw new ApiError(409, "Roll number already exists in this class and section");
  }
};

export const listStudents = async (query) => {
  const { page, limit, search, className, section, status, skip } = parsePage(query);
  const filter = { isDeleted: false };

  if (className) filter.className = className;
  if (section) filter.section = section;
  if (status) filter.status = status;

  const searchFilter = buildSearchFilter(search);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [items, total] = await Promise.all([
    Student.find(filter)
      .select("-loginPassword")
      .sort({ className: 1, rollNumber: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getStudentById = async (id) => {
  const student = await Student.findOne({ _id: id, isDeleted: false }).lean();
  if (!student) throw new ApiError(404, "Student not found");
  return student;
};

export const createStudent = async (payload, actorId) => {
  const data = normalizePayload(payload);
  validateStudentPayload(data);

  if (data.rollNumber) {
    await ensureUniqueRoll(data.className, data.section, data.rollNumber);
  } else {
    data.rollNumber = await getNextRollNumber(data.className, data.section);
  }

  const { useInstallments, ...studentData } = data;
  const loginId = studentData.loginId || generateStudentLoginId(studentData);
  const loginPassword = studentData.loginPassword || generateStudentLoginPassword(studentData);

  const student = await Student.create({
    ...studentData,
    loginId,
    loginPassword,
    createdBy: actorId,
    updatedBy: actorId,
  });

  await createFeeRecordsForStudent(
    student,
    {
      admissionFee: studentData.admissionFee,
      annualFee: studentData.annualFee,
      monthlyFee: studentData.monthlyFee,
      installmentCount: studentData.installmentCount,
      useInstallments,
    },
    actorId
  );

  return student;
};

export const updateStudent = async (id, payload, actorId) => {
  const student = await Student.findById(id);
  if (!student || student.isDeleted) {
    throw new ApiError(404, "Student not found");
  }

  const fields = [
    "firstName",
    "lastName",
    "rollNumber",
    "fatherName",
    "cnicBForm",
    "guardianName",
    "guardianPhone",
    "gender",
    "className",
    "section",
    "address",
    "admissionNo",
    "status",
    "studentPhotoUrl",
    "phoneNumber",
    "maritalStatus",
    "fatherCnic",
    "fatherOccupation",
    "alternativePhone",
    "previousClass",
    "previousResultGrade",
    "previousResultPercentage",
    "previousResults",
    "subjects",
    "schoolLeavingCertificate",
    "characterCertificate",
  ];

  fields.forEach((key) => {
    if (payload[key] !== undefined) {
      student[key] = typeof payload[key] === "string" ? payload[key].trim() : payload[key];
    }
  });

  if (payload.fatherName !== undefined) {
    student.fatherName = payload.fatherName.trim();
    student.guardianName = student.fatherName;
  }

  if (payload.dateOfBirth !== undefined) {
    student.dateOfBirth = new Date(payload.dateOfBirth);
  }

  if (payload.admissionDate !== undefined) {
    student.admissionDate = new Date(payload.admissionDate);
  }

  if (
    payload.firstName !== undefined ||
    payload.lastName !== undefined ||
    payload.fatherName !== undefined ||
    payload.guardianName !== undefined ||
    payload.admissionNo !== undefined ||
    payload.rollNumber !== undefined
  ) {
    student.loginId = generateStudentLoginId(student);
  }

  if (student.rollNumber) {
    await ensureUniqueRoll(student.className, student.section, student.rollNumber, student._id);
  }

  student.updatedBy = actorId;
  await student.save();

  return student;
};

export const deleteStudent = async (id, actorId) => {
  const student = await Student.findById(id);
  if (!student || student.isDeleted) {
    throw new ApiError(404, "Student not found");
  }

  student.isDeleted = true;
  student.updatedBy = actorId;
  await student.save();

  return { id };
};

export const promoteStudent = async (id, payload, actorId) => {
  const student = await Student.findById(id);
  if (!student || student.isDeleted) {
    throw new ApiError(404, "Student not found");
  }

  const previousClass = student.className;
  const nextClass = payload.className?.trim() || getNextClass(student.className);
  if (!nextClass) {
    throw new ApiError(400, "Student is already in the highest class or class cannot be promoted automatically");
  }

  student.className = nextClass;
  if (payload.section !== undefined) student.section = payload.section.trim() || student.section;
  student.updatedBy = actorId;
  await student.save();

  return { student, promotedFrom: previousClass, promotedTo: nextClass };
};

export const promoteClass = async (payload, actorId) => {
  const { fromClass, toClass, section } = payload;
  if (!fromClass) throw new ApiError(400, "fromClass is required");

  const targetClass = toClass?.trim() || getNextClass(fromClass);
  if (!targetClass) {
    throw new ApiError(400, "Cannot determine next class for promotion");
  }

  const filter = { className: fromClass, isDeleted: false, status: "ACTIVE" };
  if (section) filter.section = section;

  const result = await Student.updateMany(filter, {
    $set: { className: targetClass, updatedBy: actorId },
  });

  return { promoted: result.modifiedCount, fromClass, toClass: targetClass };
};

export const getClassOptions = async () => {
  const classes = await Student.distinct("className", { isDeleted: false });
  return classes.filter(Boolean).sort();
};

export const getClassSectionOptions = async () => {
  const rows = await Student.aggregate([
    { $match: { isDeleted: false, className: { $nin: [null, ""] } } },
    {
      $group: {
        _id: { className: "$className", section: { $ifNull: ["$section", "A"] } },
      },
    },
    { $sort: { "_id.className": 1, "_id.section": 1 } },
  ]);

  return rows.map((row) => {
    const className = row._id.className;
    const section = row._id.section || "A";
    return {
      className,
      section,
      label: `${className} ${section}`,
      value: `${className}|${section}`,
    };
  });
};

export const getPromotionClasses = async () => CLASS_ORDER;

export const getStudentFeePortfolio = async (id) => {
  const student = await Student.findOne({ _id: id, isDeleted: false }).lean();
  if (!student) throw new ApiError(404, "Student not found");

  const assignments = await FeeAssignment.find({ studentId: id, isDeleted: false })
    .sort({ dueDate: 1, createdAt: 1 })
    .lean();

  const payments = await FeePayment.find({ studentId: id, isDeleted: false })
    .sort({ paidAt: -1 })
    .lean();

  const feeRecords = assignments.map((a) => ({
    id: a._id,
    title: a.title,
    feeType: a.feeType,
    month: a.month,
    amount: a.amount,
    paidAmount: a.paidAmount,
    pendingAmount: Math.max(a.amount - a.paidAmount, 0),
    status: a.status,
    dueDate: a.dueDate,
  }));

  const totalPending = feeRecords.reduce((sum, row) => sum + row.pendingAmount, 0);
  const totalPaid = payments.reduce((sum, row) => sum + (row.netAmount || 0), 0);

  return {
    student: {
      _id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNo: student.admissionNo,
      className: student.className,
      section: student.section,
      monthlyFee: student.monthlyFee || 0,
      admissionFee: student.admissionFee || 0,
      admissionFeePaid: student.admissionFeePaid || false,
      academicStream: student.academicStream || "",
      streamDetail: student.streamDetail || "",
    },
    summary: {
      monthlyFee: student.monthlyFee || 0,
      admissionFee: student.admissionFee || 0,
      admissionFeePaid: student.admissionFeePaid || false,
      totalPending,
      totalPaid,
    },
    feeRecords,
    recentPayments: payments.slice(0, 10).map((p) => ({
      receiptNo: p.receiptNo,
      feeType: p.feeType,
      netAmount: p.netAmount,
      paidAt: p.paidAt,
      month: p.month,
    })),
  };
};

export const getStudentAttendanceTotals = async (studentIds = []) => {
  const ids = [...new Set((studentIds || []).filter(Boolean))];
  if (!ids.length) return {};

  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) return {};

  const rows = await Attendance.aggregate([
    {
      $match: {
        isDeleted: false,
        studentId: { $in: objectIds },
      },
    },
    {
      $group: {
        _id: { studentId: "$studentId", status: "$status" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totals = Object.fromEntries(ids.map((id) => [id, { present: 0, absent: 0, onLeave: 0 }]));

  rows.forEach((row) => {
    const id = row._id.studentId.toString();
    if (!totals[id]) totals[id] = { present: 0, absent: 0, onLeave: 0 };

    const count = row.count;
    if (row._id.status === "PRESENT" || row._id.status === "LATE") {
      totals[id].present += count;
    } else if (row._id.status === "ABSENT") {
      totals[id].absent += count;
    } else if (row._id.status === "LEAVE") {
      totals[id].onLeave += count;
    }
  });

  return totals;
};

const toLocalDateKey = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getStudentAttendanceCalendar = async ({ studentId, year, month }) => {
  if (!studentId) throw new ApiError(400, "studentId is required");
  if (!year || !month) throw new ApiError(400, "year and month are required");

  const student = await Student.findOne({ _id: studentId, isDeleted: false })
    .select("_id firstName lastName className section")
    .lean();

  if (!student) throw new ApiError(404, "Student not found");

  const monthIndex = Number(month) - 1;
  const rangeStart = new Date(Number(year), monthIndex, 1);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(Number(year), monthIndex + 1, 0);
  rangeEnd.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    studentId,
    isDeleted: false,
    date: { $gte: rangeStart, $lte: rangeEnd },
  })
    .select("date status")
    .lean();

  return {
    studentId: student._id,
    studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
    className: student.className,
    section: student.section || "A",
    year: Number(year),
    month: Number(month),
    days: records.map((record) => ({
      date: toLocalDateKey(record.date),
      status: record.status,
    })),
  };
};

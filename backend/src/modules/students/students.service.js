import { Student } from "../../models/Student.js";
import { FeeAssignment } from "../../models/FeeAssignment.js";
import { FeePayment } from "../../models/FeePayment.js";
import { ApiError } from "../../utils/apiError.js";

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

const generateAdmissionNo = () => `STU-${Date.now()}`;

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

const normalizePayload = (payload) => {
  const fatherName = (payload.fatherName || payload.guardianName || "").trim();
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
    admissionDate: payload.admissionDate ? new Date(payload.admissionDate) : new Date(),
    studentPhotoUrl: payload.studentPhotoUrl || null,
    status: payload.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
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
    Student.find(filter).sort({ className: 1, rollNumber: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
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
  }

  const student = await Student.create({
    ...data,
    createdBy: actorId,
    updatedBy: actorId,
  });

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

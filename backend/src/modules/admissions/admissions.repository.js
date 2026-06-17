import { Admission } from "../../models/Admission.js";
import { Student } from "../../models/Student.js";

export const createStudentAndAdmissionRepo = async (payload, actorId) => {
  const student = await Student.create({
    ...payload,
    createdBy: actorId,
    updatedBy: actorId,
  });

  const admission = await Admission.create({
    studentId: student._id,
    status: "APPROVED",
    createdBy: actorId,
    updatedBy: actorId,
  });

  return { student, admission };
};

export const listAdmissionsRepo = async ({ page, limit, search, className, from, to }) => {
  const skip = (page - 1) * limit;
  const studentFilter = { isDeleted: false };

  if (search) {
    studentFilter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { admissionNo: { $regex: search, $options: "i" } },
    ];
  }

  if (className) {
    studentFilter.className = className;
  }

  if (from || to) {
    studentFilter.admissionDate = {};
    if (from) studentFilter.admissionDate.$gte = new Date(from);
    if (to) studentFilter.admissionDate.$lte = new Date(to);
  }

  const students = await Student.find(studentFilter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Student.countDocuments(studentFilter);

  const studentIds = students.map((item) => item._id);
  const admissions = await Admission.find({ studentId: { $in: studentIds }, isDeleted: false }).lean();
  const admissionByStudentId = new Map(admissions.map((item) => [item.studentId.toString(), item]));

  return {
    items: students.map((student) => ({
      ...student.toObject(),
      admission: admissionByStudentId.get(student._id.toString()) || null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

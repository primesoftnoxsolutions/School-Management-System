import { User } from "../../models/User.js";
import { Student } from "../../models/Student.js";
import { TeacherActivity } from "../../models/TeacherActivity.js";
import { ApiError } from "../../utils/apiError.js";

export const registerUser = async ({ fullName, email, password, role, actorId }) => {
  const exists = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (exists) {
    throw new ApiError(409, "Email is already in use");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};

const buildStudentAuthUser = (student) => ({
  id: student._id,
  fullName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.admissionNo || "Student",
  email: student.loginId || student.admissionNo || "",
  role: "STUDENT",
  admissionNo: student.admissionNo,
  className: student.className,
  section: student.section || "A",
});

const generateStudentLoginId = (student) => {
  const fullName = `${String(student.firstName || "")}${String(student.lastName || "")}`
    .replace(/[^a-z]/gi, "")
    .toLowerCase();
  if (!fullName) return "student@gmail.com";
  return `${fullName}@gmail.com`;
};

const generateStudentLoginPassword = (student) => {
  const lettersPool =
    `${String(student.firstName || "")}${String(student.lastName || "")}`.replace(/[^a-z]/gi, "").toUpperCase() ||
    "STUDENT";
  const dobValue = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
  const dobDigits =
    dobValue && !Number.isNaN(dobValue.getTime())
      ? `${dobValue.getFullYear()}${String(dobValue.getMonth() + 1).padStart(2, "0")}${String(dobValue.getDate()).padStart(2, "0")}`
      : "";
  const digitsPool =
    `${String(student.admissionNo || "")}${String(student.rollNumber || "")}${String(student.cnicBForm || "")}${dobDigits}`
      .replace(/\D/g, "") || `${Date.now()}`;
  const byPool = "BY";
  const glPool = "GL";
  const seed = `${lettersPool}|${digitsPool}|${String(student.admissionNo || "")}|BY|GL`;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }

  const pick = (pool, offset = 0) => pool[(hash + offset) % pool.length];
  return [
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
  ]
    .join("")
    .slice(0, 10);
};

export const loginUser = async ({ email, password, role }) => {
  const requestedRole = String(role || "SUPER_ADMIN").trim().toUpperCase();
  const normalizedLogin = String(email || "").trim().toLowerCase();

  if (requestedRole === "STUDENT") {
    const students = await Student.find({
      isDeleted: false,
      status: "ACTIVE",
    })
      .select("_id firstName lastName admissionNo className section loginId loginPassword rollNumber cnicBForm dateOfBirth status")
      .lean();

    const student = students.find((row) => {
      const storedLoginId = String(row.loginId || "").trim().toLowerCase();
      const generatedLoginId = generateStudentLoginId(row);
      const admissionNo = String(row.admissionNo || "").trim().toLowerCase();
      const rollNumber = String(row.rollNumber || "").trim().toLowerCase();
      return (
        normalizedLogin === storedLoginId ||
        normalizedLogin === generatedLoginId ||
        normalizedLogin === admissionNo ||
        normalizedLogin === rollNumber
      );
    });

    if (!student) {
      throw new ApiError(401, "Invalid credentials");
    }

    const expectedPassword = String(student.loginPassword || "").trim() || generateStudentLoginPassword(student);
    if (expectedPassword !== String(password || "")) {
      throw new ApiError(401, "Invalid credentials");
    }

    return {
      user: buildStudentAuthUser(student),
    };
  }

  const user = await User.findOne({ email: normalizedLogin, isDeleted: false }).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.role === "TEACHER") {
    TeacherActivity.create({
      teacherId: user._id,
      action: "LOGIN",
      module: "AUTH",
      details: "Teacher logged in",
      status: "SUCCESS",
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
    }).catch(() => {});
  }

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

export const logoutUser = async (session) =>
  new Promise((resolve, reject) => {
    if (!session) {
      resolve();
      return;
    }
    session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

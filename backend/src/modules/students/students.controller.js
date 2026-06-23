import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createStudent,
  deleteStudent,
  getClassOptions,
  getClassSectionOptions,
  getNextRollNumber,
  getPromotionClasses,
  getStudentById,
  getStudentAttendanceCalendar,
  getStudentAttendanceTotals,
  getStudentFeePortfolio,
  listStudents,
  promoteClass,
  promoteStudent,
  updateStudent,
} from "./students.service.js";

export const getStudents = asyncHandler(async (req, res) => {
  const data = await listStudents(req.query);
  res.status(200).json({ success: true, data });
});

export const getStudent = asyncHandler(async (req, res) => {
  const data = await getStudentById(req.params.id);
  res.status(200).json({ success: true, data });
});

export const postStudent = asyncHandler(async (req, res) => {
  const data = await createStudent(req.body, req.user._id.toString());
  res.status(201).json({ success: true, data });
});

export const putStudent = asyncHandler(async (req, res) => {
  const data = await updateStudent(req.params.id, req.body, req.user._id.toString());
  res.status(200).json({ success: true, data });
});

export const removeStudent = asyncHandler(async (req, res) => {
  const data = await deleteStudent(req.params.id, req.user._id.toString());
  res.status(200).json({ success: true, data });
});

export const postPromoteStudent = asyncHandler(async (req, res) => {
  const data = await promoteStudent(req.params.id, req.body, req.user._id.toString());
  res.status(200).json({ success: true, data });
});

export const postPromoteClass = asyncHandler(async (req, res) => {
  const data = await promoteClass(req.body, req.user._id.toString());
  res.status(200).json({ success: true, data });
});

export const getStudentClassOptions = asyncHandler(async (_req, res) => {
  const data = await getClassOptions();
  res.status(200).json({ success: true, data });
});

export const getStudentClassSectionOptions = asyncHandler(async (_req, res) => {
  const data = await getClassSectionOptions();
  res.status(200).json({ success: true, data });
});

export const getStudentPromotionClasses = asyncHandler(async (_req, res) => {
  const data = await getPromotionClasses();
  res.status(200).json({ success: true, data });
});

export const getNextStudentRoll = asyncHandler(async (req, res) => {
  const className = (req.query.className || "").trim();
  const section = (req.query.section || "A").trim();
  const rollNumber = await getNextRollNumber(className, section);
  res.status(200).json({ success: true, data: { rollNumber } });
});

export const getStudentFeePortfolioHandler = asyncHandler(async (req, res) => {
  const data = await getStudentFeePortfolio(req.params.id);
  res.status(200).json({ success: true, data });
});

export const uploadStudentPhotoHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Photo file is required" });
  }
  const url = `/uploads/students/${req.file.filename}`;
  res.status(201).json({ success: true, data: { url } });
});

export const getStudentAttendanceTotalsHandler = asyncHandler(async (req, res) => {
  const ids = (req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const data = await getStudentAttendanceTotals(ids);
  res.status(200).json({ success: true, data });
});

export const getStudentAttendanceCalendarHandler = asyncHandler(async (req, res) => {
  const data = await getStudentAttendanceCalendar({
    studentId: req.query.studentId,
    year: Number(req.query.year),
    month: Number(req.query.month),
  });
  res.status(200).json({ success: true, data });
});

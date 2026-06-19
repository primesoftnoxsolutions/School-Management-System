import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createStudent,
  deleteStudent,
  getClassOptions,
  getClassSectionOptions,
  getPromotionClasses,
  getStudentById,
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

export const getStudentFeePortfolioHandler = asyncHandler(async (req, res) => {
  const data = await getStudentFeePortfolio(req.params.id);
  res.status(200).json({ success: true, data });
});

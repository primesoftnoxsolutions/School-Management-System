import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTeacher,
  getMyTeacherPanel,
  getTeacherActivities,
  getTeachersByClass,
  listTeachers,
  updateTeacher,
} from "./teachers.service.js";

export const createTeacherAccount = asyncHandler(async (req, res) => {
  const teacher = await createTeacher(req.body, req.user._id.toString());
  res.status(201).json({ success: true, data: teacher });
});

export const putTeacherAccount = asyncHandler(async (req, res) => {
  const teacher = await updateTeacher(req.params.id, req.body, req.user._id.toString());
  res.status(200).json({ success: true, data: teacher });
});

export const getTeachers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
  const search = (req.query.search || "").trim();
  const className = (req.query.className || "").trim();
  const section = (req.query.section || "").trim();

  const result = await listTeachers({ page, limit, search, className, section });
  res.status(200).json({ success: true, data: result });
});

export const getTeachersForClass = asyncHandler(async (req, res) => {
  const className = (req.query.className || "").trim();
  const section = (req.query.section || "").trim();
  const data = await getTeachersByClass({ className, section });
  res.status(200).json({ success: true, data });
});

export const monitorTeacherActivities = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
  const search = (req.query.search || "").trim();
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;

  const result = await getTeacherActivities({ page, limit, search, from, to });
  res.status(200).json({ success: true, data: result });
});

export const getTeacherOwnPanel = asyncHandler(async (req, res) => {
  const result = await getMyTeacherPanel(req.user._id);
  res.status(200).json({ success: true, data: result });
});

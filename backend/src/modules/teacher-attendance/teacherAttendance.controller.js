import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getTeacherAttendanceCalendar,
  getTeacherAttendanceStats,
  listTeacherAttendance,
  markTeacherAttendance,
  resetDemoTeacherAttendance,
} from "./teacherAttendance.service.js";

export const getAttendance = asyncHandler(async (req, res) => {
  const data = await listTeacherAttendance(req.query.date);
  res.status(200).json({ success: true, data });
});

export const getCalendar = asyncHandler(async (req, res) => {
  const teacherId = (req.query.teacherId || "").trim();
  const year = Number(req.query.year) || null;
  const month = Number(req.query.month) || null;
  const from = (req.query.from || "").trim();
  const to = (req.query.to || "").trim();
  const data = await getTeacherAttendanceCalendar({ teacherId, year, month, from, to });
  res.status(200).json({ success: true, data });
});

export const getStats = asyncHandler(async (req, res) => {
  const data = await getTeacherAttendanceStats(req.query.date);
  res.status(200).json({ success: true, data });
});

export const postMark = asyncHandler(async (req, res) => {
  const data = await markTeacherAttendance(req.body, req.user._id);
  res.status(200).json({ success: true, data });
});

export const postResetDemo = asyncHandler(async (req, res) => {
  const data = await resetDemoTeacherAttendance(req.body?.date || req.query?.date, req.user._id, {
    all: req.body?.all === true || req.query?.all === "true",
  });
  res.status(200).json({
    success: true,
    data,
    message: data.scope === "all" ? "All teacher attendance reset (demo)." : "Today's attendance reset (demo).",
  });
});

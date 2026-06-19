import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getTeacherAttendanceStats,
  listTeacherAttendance,
  markTeacherAttendance,
} from "./teacherAttendance.service.js";

export const getAttendance = asyncHandler(async (req, res) => {
  const data = await listTeacherAttendance(req.query.date);
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

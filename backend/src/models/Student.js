import mongoose from "mongoose";
import { baseFields } from "./baseFields.js";

const studentSchema = new mongoose.Schema(
  {
    admissionNo: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    dateOfBirth: { type: Date, required: true },
    guardianName: { type: String, required: true, trim: true },
    guardianPhone: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true, index: true },
    section: { type: String, default: "A", trim: true },
    admissionDate: { type: Date, default: Date.now, index: true },
    studentPhotoUrl: { type: String, default: null },
    ...baseFields,
  },
  { timestamps: true }
);

studentSchema.index({ firstName: 1, className: 1, isDeleted: 1 });

export const Student = mongoose.model("Student", studentSchema);

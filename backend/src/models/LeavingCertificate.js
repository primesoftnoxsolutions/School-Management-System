import mongoose from "mongoose";
import { baseFields } from "./baseFields.js";

const leavingCertificateSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, required: true, unique: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    fatherName: { type: String, default: "", trim: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, default: "A", trim: true },
    rollNumber: { type: String, default: "", trim: true },
    dateOfBirth: { type: Date, default: null },
    dateOfAdmission: { type: Date, default: null },
    dateOfLeaving: { type: Date, required: true },
    reasonForLeaving: { type: String, required: true, trim: true },
    conduct: { type: String, default: "Good", trim: true },
    academicStream: { type: String, default: "", trim: true },
    remarks: { type: String, default: "", trim: true },
    ...baseFields,
  },
  { timestamps: true }
);

export const LeavingCertificate = mongoose.model("LeavingCertificate", leavingCertificateSchema);

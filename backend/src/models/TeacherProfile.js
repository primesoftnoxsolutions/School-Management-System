import mongoose from "mongoose";
import { baseFields } from "./baseFields.js";

const teacherProfileSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    cnic: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    phoneNumber: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    qualification: { type: String, trim: true, default: "" },
    expertise: { type: String, trim: true, default: "" },
    salary: { type: Number, default: null },
    allowPasswordReset: { type: Boolean, default: true },
    loginPassword: { type: String, default: "", select: false },
    ...baseFields,
  },
  { timestamps: true }
);

export const TeacherProfile = mongoose.model("TeacherProfile", teacherProfileSchema);

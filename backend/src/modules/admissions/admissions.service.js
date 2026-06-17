import { ApiError } from "../../utils/apiError.js";
import {
  createStudentAndAdmissionRepo,
  listAdmissionsRepo,
} from "./admissions.repository.js";

const generateAdmissionNo = () => `ADM-${Date.now()}`;

export const createAdmissionService = async (payload, actorId) => {
  const required = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
    "guardianName",
    "guardianPhone",
    "className",
  ];

  const missing = required.filter((field) => !payload[field]);
  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }

  const preparedPayload = {
    ...payload,
    admissionNo: payload.admissionNo || generateAdmissionNo(),
  };

  return createStudentAndAdmissionRepo(preparedPayload, actorId);
};

export const listAdmissionsService = async (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);

  return listAdmissionsRepo({
    page,
    limit,
    search: query.search || "",
    className: query.className || "",
    from: query.from || "",
    to: query.to || "",
  });
};

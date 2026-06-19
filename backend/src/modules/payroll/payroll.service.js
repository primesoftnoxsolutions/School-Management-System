import { Payroll } from "../../models/Payroll.js";
import { User } from "../../models/User.js";
import { ApiError } from "../../utils/apiError.js";

const parsePage = (query) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  return { page, limit, search: (query.search || "").trim(), skip: (page - 1) * limit };
};

const calcNet = (basic, allowances, deductions, bonus) =>
  Math.max(Number(basic) + Number(allowances || 0) + Number(bonus || 0) - Number(deductions || 0), 0);

export const listPayroll = async (query) => {
  const { page, limit, search, skip } = parsePage(query);
  const filter = { isDeleted: false };
  if (query.month) filter.month = query.month;
  if (query.year) filter.year = Number(query.year);
  if (query.status) filter.status = query.status;

  if (search) {
    filter.$or = [
      { staffName: { $regex: search, $options: "i" } },
      { staffRole: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Payroll.find(filter).sort({ year: -1, month: -1 }).skip(skip).limit(limit).lean(),
    Payroll.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};

export const getStaffOptions = async () => {
  return User.find({
    role: { $in: ["TEACHER", "ACCOUNTANT"] },
    isDeleted: false,
    isActive: true,
  })
    .select("_id fullName role")
    .sort({ fullName: 1 })
    .lean();
};

export const createPayroll = async (payload, actorId) => {
  const { staffId, month, year, basicSalary, allowances, deductions, bonus, paymentMethod, remarks } =
    payload;

  if (!staffId || !month || !year || basicSalary === undefined) {
    throw new ApiError(400, "staffId, month, year and basicSalary are required");
  }

  const staff = await User.findOne({ _id: staffId, isDeleted: false });
  if (!staff) throw new ApiError(404, "Staff not found");

  const exists = await Payroll.findOne({ staffId, month, year, isDeleted: false });
  if (exists) throw new ApiError(409, "Payroll already exists for this staff and month");

  const netSalary = calcNet(basicSalary, allowances, deductions, bonus);

  return Payroll.create({
    staffId,
    staffName: staff.fullName,
    staffRole: staff.role,
    month: month.trim(),
    year: Number(year),
    basicSalary: Number(basicSalary),
    allowances: Number(allowances || 0),
    deductions: Number(deductions || 0),
    bonus: Number(bonus || 0),
    netSalary,
    paymentMethod: paymentMethod || "BANK",
    remarks: remarks?.trim() || "",
    processedBy: actorId,
    createdBy: actorId,
    updatedBy: actorId,
  });
};

export const updatePayroll = async (id, payload, actorId) => {
  const item = await Payroll.findById(id);
  if (!item || item.isDeleted) throw new ApiError(404, "Payroll record not found");

  ["basicSalary", "allowances", "deductions", "bonus", "paymentMethod", "remarks", "month", "year"].forEach(
    (k) => {
      if (payload[k] !== undefined) item[k] = k === "year" ? Number(payload[k]) : payload[k];
    }
  );

  item.netSalary = calcNet(item.basicSalary, item.allowances, item.deductions, item.bonus);
  item.updatedBy = actorId;
  await item.save();
  return item;
};

export const markPayrollPaid = async (id, actorId) => {
  const item = await Payroll.findById(id);
  if (!item || item.isDeleted) throw new ApiError(404, "Payroll record not found");

  item.status = "PAID";
  item.paidAt = new Date();
  item.updatedBy = actorId;
  await item.save();
  return item;
};

export const deletePayroll = async (id, actorId) => {
  const item = await Payroll.findById(id);
  if (!item || item.isDeleted) throw new ApiError(404, "Payroll record not found");
  item.isDeleted = true;
  item.updatedBy = actorId;
  await item.save();
  return { id };
};

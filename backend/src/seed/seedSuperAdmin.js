import { User } from "../models/User.js";

export const seedSuperAdmin = async () => {
  const adminEmail = "admin@schoolerp.local";
  const accountantEmail = "accountant@schoolerp.local";
  const teacherEmail = "teacher@schoolerp.local";

  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      fullName: "Super Admin",
      email: adminEmail,
      password: "Admin@123",
      role: "SUPER_ADMIN",
      createdBy: "system",
      updatedBy: "system",
    });
    console.log("Seeded default super admin: admin@schoolerp.local / Admin@123");
  }

  const accountantExists = await User.findOne({ email: accountantEmail });
  if (!accountantExists) {
    await User.create({
      fullName: "Default Accountant",
      email: accountantEmail,
      password: "Account@123",
      role: "ACCOUNTANT",
      createdBy: "system",
      updatedBy: "system",
    });
    console.log("Seeded default accountant: accountant@schoolerp.local / Account@123");
  }

  const teacherExists = await User.findOne({ email: teacherEmail });
  if (!teacherExists) {
    await User.create({
      fullName: "Default Teacher",
      email: teacherEmail,
      password: "Teacher@123",
      role: "TEACHER",
      createdBy: "system",
      updatedBy: "system",
    });
    console.log("Seeded default teacher: teacher@schoolerp.local / Teacher@123");
  }
};

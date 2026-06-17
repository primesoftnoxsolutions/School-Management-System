import { User } from "../models/User.js";

const SUPER_ADMIN = {
  fullName: "Super Admin",
  email: "naseer@idealschool.com",
  password: "Naseer@59317",
  role: "SUPER_ADMIN",
};

const LEGACY_ADMIN_EMAIL = "admin@schoolerp.local";

export const seedSuperAdmin = async () => {
  await User.deleteOne({ email: LEGACY_ADMIN_EMAIL });

  let admin = await User.findOne({ email: SUPER_ADMIN.email }).select("+password");

  if (!admin) {
    const existingSuperAdmin = await User.findOne({
      role: "SUPER_ADMIN",
      isDeleted: false,
    }).select("+password");

    if (existingSuperAdmin) {
      existingSuperAdmin.email = SUPER_ADMIN.email;
      existingSuperAdmin.fullName = SUPER_ADMIN.fullName;
      existingSuperAdmin.password = SUPER_ADMIN.password;
      existingSuperAdmin.isActive = true;
      await existingSuperAdmin.save();
      admin = existingSuperAdmin;
    } else {
      await User.create({
        ...SUPER_ADMIN,
        createdBy: "system",
        updatedBy: "system",
      });
      console.log(`Seeded super admin: ${SUPER_ADMIN.email}`);
      admin = null;
    }
  } else {
    admin.fullName = SUPER_ADMIN.fullName;
    admin.password = SUPER_ADMIN.password;
    admin.isActive = true;
    await admin.save();
  }

  if (admin) {
    console.log(`Super admin ready: ${SUPER_ADMIN.email}`);
  }

  const accountantEmail = "accountant@schoolerp.local";
  const teacherEmail = "teacher@schoolerp.local";

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

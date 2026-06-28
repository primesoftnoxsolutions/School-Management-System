export const TEACHER_SUBPAGES = ["Assigned Classes & Sections", "Attendance", "Syllabus", "Duties", "Time Table", "Academic"];

export const TEACHER_PORTAL_SUBPAGES = [...TEACHER_SUBPAGES, "Statements"];

export const isTeacherSubpage = (selected) =>
  TEACHER_PORTAL_SUBPAGES.includes(selected) ||
  selected === "Mark Attendance" ||
  selected === "Academic Records";

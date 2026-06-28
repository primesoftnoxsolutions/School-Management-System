import { CampusTimeTable } from "../../models/CampusTimeTable.js";
import { ApiError } from "../../utils/apiError.js";

const CLASS_COLUMNS = [
  "PG",
  "Nursery",
  "Prep",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

const DEFAULT_BREAK = {
  label: "BREAK TIME",
  start: "11:45",
  end: "12:15",
  afterPeriod: 5,
};

const DEFAULT_PERIODS = [
  { number: 1, start: "08:00", end: "08:45" },
  { number: 2, start: "08:45", end: "09:30" },
  { number: 3, start: "09:30", end: "10:15" },
  { number: 4, start: "10:15", end: "11:00" },
  { number: 5, start: "11:00", end: "11:45" },
  { number: 6, start: "12:15", end: "01:00" },
  { number: 7, start: "01:00", end: "01:45" },
  { number: 8, start: "01:45", end: "02:30" },
  { number: 9, start: "02:30", end: "03:15" },
  { number: 10, start: "03:15", end: "04:00" },
];

const DEMO_CLASS_TEACHERS = {
  Boys: {
    PG: "Tariq Javed",
    Nursery: "Rizwan Khan",
    Prep: "Sara Ahmed",
    "1st": "Kashif Raza",
    "2nd": "Imran Ali",
    "3rd": "Usman Raza",
    "4th": "Faisal Shah",
    "5th": "Ahmed Hassan",
    "6th": "Bilal Ahmed",
    "7th": "Saeed Khan",
    "8th": "Hamza Ali",
    "9th": "Zain Malik",
    "10th": "Omar Farooq",
  },
  Girls: {
    PG: "Hira Fatima",
    Nursery: "Ayesha Khan",
    Prep: "Maha Noor",
    "1st": "Nadia Ali",
    "2nd": "Sana Bibi",
    "3rd": "Maria Noor",
    "4th": "Maira Shah",
    "5th": "Fatima Zahra",
    "6th": "Zainab Bibi",
    "7th": "Rabia Khan",
    "8th": "Amna Sheikh",
    "9th": "Sadia Noor",
    "10th": "Kiran Abbas",
  },
};

const PERIOD_SUBJECTS = [
  ["English", "English", "English", "English", "English", "English", "English", "English", "English", "English", "English", "English", "English"],
  ["Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics", "Mathematics"],
  ["Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu", "Urdu"],
  ["Science", "Science", "General Knowledge", "Science", "Science", "Science", "Science", "Physics", "Chemistry", "Biology", "Physics", "Chemistry", "Biology"],
  ["Islamiat", "Islamiat", "Islamiat", "Islamiat", "Islamiat", "Islamiat", "Islamiat", "Islamiat", "Islamiat", "Pakistan Studies", "Islamiat", "Islamiat", "Pakistan Studies"],
  ["Drawing", "Rhymes", "Alphabet", "Computer Science", "Social Studies", "Computer Science", "Arts", "Computer Science", "Mathematics", "English", "Computer Science", "Mathematics", "English"],
  ["Physical Education", "Story Time", "Numbers", "English", "Mathematics", "Urdu", "Science", "Urdu", "English", "Mathematics", "Urdu", "English", "Mathematics"],
  ["Rhymes", "English", "Urdu", "Mathematics", "Urdu", "English", "Mathematics", "Science", "Urdu", "Computer Science", "Science", "Physics", "Chemistry"],
  ["Free Period", "Arts", "Writing", "Science", "Computer Science", "Mathematics", "Urdu", "English", "Computer Science", "Islamiat", "Mathematics", "Biology", "Urdu"],
  ["Assembly", "Games", "Music", "Library", "Arts", "Sports", "Library", "Sports", "Library", "Career Guidance", "Library", "Sports", "Assembly"],
];

const emptyAssignments = () => Object.fromEntries(CLASS_COLUMNS.map((col) => [col, ""]));

const normalizeBranch = (branch) => (branch === "Girls" ? "Girls" : "Boys");

const demoCellValue = (branch, classColumn, periodIndex) => {
  const classTeacher = DEMO_CLASS_TEACHERS[branch]?.[classColumn] || "Class Teacher";
  const subject = PERIOD_SUBJECTS[periodIndex]?.[CLASS_COLUMNS.indexOf(classColumn)] || "Subject";
  if (periodIndex === 0) return subject;
  return `${classTeacher} (${subject})`;
};

const createDemoClassTeachers = (branch) => {
  const source = DEMO_CLASS_TEACHERS[branch];
  return Object.fromEntries(CLASS_COLUMNS.map((col) => [col, source[col] || ""]));
};

const createDemoPeriodAssignments = (branch) =>
  DEFAULT_PERIODS.map((period, periodIndex) => {
    const assignments = emptyAssignments();
    CLASS_COLUMNS.forEach((col) => {
      assignments[col] = demoCellValue(branch, col, periodIndex);
    });
    return { ...period, assignments };
  });

const buildDefault = (branch) => {
  const normalizedBranch = normalizeBranch(branch);
  return {
    branch: normalizedBranch,
    breakTime: { ...DEFAULT_BREAK },
    classTeachers: createDemoClassTeachers(normalizedBranch),
    periods: createDemoPeriodAssignments(normalizedBranch),
  };
};

const serializeAssignments = (assignments = {}) => {
  const normalized = emptyAssignments();
  CLASS_COLUMNS.forEach((col) => {
    normalized[col] = String(assignments[col] || assignments.get?.(col) || "");
  });
  return normalized;
};

const serializeClassTeachers = (classTeachers = {}, branch) => {
  const fallback = createDemoClassTeachers(normalizeBranch(branch));
  const normalized = emptyAssignments();
  CLASS_COLUMNS.forEach((col) => {
    normalized[col] = String(classTeachers[col] || classTeachers.get?.(col) || fallback[col] || "");
  });
  return normalized;
};

const isTimeTableEmpty = (doc) => {
  if (!doc) return true;
  const teachers = doc.classTeachers || {};
  const hasHeaderTeachers = CLASS_COLUMNS.some((col) => String(teachers[col] || teachers.get?.(col) || "").trim());
  if (hasHeaderTeachers) return false;

  const periods = doc.periods || [];
  return !periods.some((period) =>
    CLASS_COLUMNS.some((col) => String(period.assignments?.[col] || period.assignments?.get?.(col) || "").trim())
  );
};

const serializeDoc = (doc, branch) => {
  const normalizedBranch = normalizeBranch(branch);
  const fallback = buildDefault(normalizedBranch);
  if (!doc || isTimeTableEmpty(doc)) return fallback;

  const sourcePeriods = Array.isArray(doc.periods) && doc.periods.length ? doc.periods : fallback.periods;

  return {
    branch: normalizeBranch(doc.branch),
    breakTime: {
      label: doc.breakTime?.label || DEFAULT_BREAK.label,
      start: doc.breakTime?.start || DEFAULT_BREAK.start,
      end: doc.breakTime?.end || DEFAULT_BREAK.end,
      afterPeriod: Number(doc.breakTime?.afterPeriod || DEFAULT_BREAK.afterPeriod),
    },
    classTeachers: serializeClassTeachers(doc.classTeachers, normalizedBranch),
    periods: fallback.periods.map((template, index) => {
      const period = sourcePeriods[index] || template;
      return {
        number: Number(period.number || template.number),
        start: period.start || template.start,
        end: period.end || template.end,
        assignments: serializeAssignments(period.assignments),
      };
    }),
  };
};

export const getCampusTimeTable = async (branch) => {
  const normalizedBranch = normalizeBranch(branch);
  const doc = await CampusTimeTable.findOne({ branch: normalizedBranch, isDeleted: false }).lean();
  return serializeDoc(doc, normalizedBranch);
};

export const saveCampusTimeTable = async (payload, actorId) => {
  const branch = normalizeBranch(payload.branch);
  if (!payload.periods?.length) {
    throw new ApiError(400, "At least one period is required");
  }

  const periods = payload.periods.map((period, index) => ({
    number: Number(period.number || index + 1),
    start: String(period.start || "").trim(),
    end: String(period.end || "").trim(),
    assignments: serializeAssignments(period.assignments),
  }));

  const breakTime = {
    label: String(payload.breakTime?.label || DEFAULT_BREAK.label).trim(),
    start: String(payload.breakTime?.start || DEFAULT_BREAK.start).trim(),
    end: String(payload.breakTime?.end || DEFAULT_BREAK.end).trim(),
    afterPeriod: Number(payload.breakTime?.afterPeriod || DEFAULT_BREAK.afterPeriod),
  };

  const classTeachers = serializeClassTeachers(payload.classTeachers, branch);

  const doc = await CampusTimeTable.findOneAndUpdate(
    { branch, isDeleted: false },
    {
      $set: {
        branch,
        breakTime,
        classTeachers,
        periods,
        updatedBy: actorId,
      },
      $setOnInsert: { createdBy: actorId },
    },
    { upsert: true, new: true, lean: true }
  );

  return serializeDoc(doc, branch);
};

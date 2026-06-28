export const TIME_TABLE_CLASS_COLUMNS = [
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

export const DEFAULT_BREAK = {
  label: "BREAK TIME",
  start: "11:45",
  end: "12:15",
  afterPeriod: 5,
};

export const DEFAULT_PERIODS = [
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

function demoCellValue(classColumn, periodIndex) {
  const subject = PERIOD_SUBJECTS[periodIndex]?.[TIME_TABLE_CLASS_COLUMNS.indexOf(classColumn)] || "Subject";
  return subject;
}

export function createEmptyAssignments() {
  return Object.fromEntries(TIME_TABLE_CLASS_COLUMNS.map((col) => [col, ""]));
}

export function createDemoClassTeachers(branch = "Boys") {
  const source = DEMO_CLASS_TEACHERS[branch === "Girls" ? "Girls" : "Boys"];
  return Object.fromEntries(TIME_TABLE_CLASS_COLUMNS.map((col) => [col, source[col] || ""]));
}

export function createDemoPeriodAssignments(branch = "Boys") {
  return DEFAULT_PERIODS.map((period, periodIndex) => {
    const assignments = createEmptyAssignments();
    TIME_TABLE_CLASS_COLUMNS.forEach((col) => {
      assignments[col] = demoCellValue(col, periodIndex);
    });
    return { ...period, assignments };
  });
}

export function buildDefaultTimeTableState(branch = "Boys") {
  const normalizedBranch = branch === "Girls" ? "Girls" : "Boys";
  return {
    branch: normalizedBranch,
    breakTime: { ...DEFAULT_BREAK },
    classTeachers: createDemoClassTeachers(normalizedBranch),
    periods: createDemoPeriodAssignments(normalizedBranch),
  };
}

export function normalizeClassTeachers(source = {}, branch = "Boys") {
  const fallback = createDemoClassTeachers(branch);
  const normalized = createEmptyAssignments();
  TIME_TABLE_CLASS_COLUMNS.forEach((col) => {
    normalized[col] = String(source[col] || fallback[col] || "");
  });
  return normalized;
}

export function isTimeTableEmpty(data) {
  if (!data) return true;
  const teachers = data.classTeachers || {};
  const hasHeaderTeachers = TIME_TABLE_CLASS_COLUMNS.some((col) => String(teachers[col] || "").trim());
  if (hasHeaderTeachers) return false;

  const periods = data.periods || [];
  return !periods.some((period) =>
    TIME_TABLE_CLASS_COLUMNS.some((col) => String(period.assignments?.[col] || "").trim())
  );
}

export function normalizeTimeTablePayload(data, branch = "Boys") {
  const normalizedBranch = branch === "Girls" ? "Girls" : "Boys";
  const fallback = buildDefaultTimeTableState(normalizedBranch);

  if (!data || isTimeTableEmpty(data)) {
    return fallback;
  }

  const periods = Array.isArray(data.periods) ? data.periods : fallback.periods;
  return {
    branch: data.branch === "Girls" ? "Girls" : "Boys",
    breakTime: {
      label: data.breakTime?.label || DEFAULT_BREAK.label,
      start: data.breakTime?.start || DEFAULT_BREAK.start,
      end: data.breakTime?.end || DEFAULT_BREAK.end,
      afterPeriod: Number(data.breakTime?.afterPeriod || DEFAULT_BREAK.afterPeriod),
    },
    classTeachers: normalizeClassTeachers(data.classTeachers, normalizedBranch),
    periods: fallback.periods.map((template, index) => {
      const period = periods[index] || template;
      const assignments = createEmptyAssignments();
      const source = period.assignments || {};
      TIME_TABLE_CLASS_COLUMNS.forEach((col) => {
        assignments[col] = String(source[col] || template.assignments[col] || "");
      });
      return {
        number: Number(period.number || template.number || index + 1),
        start: period.start || template.start,
        end: period.end || template.end,
        assignments,
      };
    }),
  };
}

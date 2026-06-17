export const moduleTableData = {
  "Fee Management": {
    stats: [
      { label: "Active Fee Structures", value: "12" },
      { label: "Pending Challans", value: "428" },
      { label: "Today Collection", value: "PKR 1,240,000" },
      { label: "Overdue Students", value: "179" },
    ],
    rows: [
      ["CH-2026-1001", "Ali Raza", "Grade 8-A", "PKR 45,000", "Pending"],
      ["CH-2026-1002", "Ayesha Noor", "Grade 6-B", "PKR 38,500", "Paid"],
      ["CH-2026-1003", "Hamza Khan", "Grade 10-C", "PKR 52,000", "Partial"],
    ],
    headers: ["Challan #", "Student", "Class", "Amount", "Status"],
  },
  "Fee Refund": {
    stats: [
      { label: "Open Requests", value: "21" },
      { label: "Approved", value: "53" },
      { label: "Processed This Month", value: "17" },
      { label: "Total Refund Amount", value: "PKR 312,000" },
    ],
    rows: [
      ["RF-001", "Ahmed Bilal", "PKR 8,000", "Transport", "Pending"],
      ["RF-002", "Mariam Adeel", "PKR 12,000", "Admission Reversal", "Approved"],
      ["RF-003", "Faizan", "PKR 4,500", "Exam Fee", "Processed"],
    ],
    headers: ["Refund #", "Student", "Amount", "Reason", "Status"],
  },
  "Fine Management": {
    stats: [
      { label: "Active Fine Categories", value: "7" },
      { label: "Unpaid Fines", value: "96" },
      { label: "Collected Today", value: "PKR 28,500" },
      { label: "Discipline Cases", value: "14" },
    ],
    rows: [
      ["FN-1101", "Late Arrival", "Ali Raza", "PKR 500", "Collected"],
      ["FN-1102", "Uniform Violation", "Zara Shah", "PKR 300", "Pending"],
      ["FN-1103", "Class Misconduct", "Omer Javed", "PKR 1,000", "Pending"],
    ],
    headers: ["Fine #", "Category", "Student", "Amount", "Status"],
  },
  "Students Portfolios": {
    stats: [
      { label: "Profiles Completed", value: "98%" },
      { label: "Documents Uploaded", value: "42,300" },
      { label: "Academic Records", value: "215,000" },
      { label: "Activities Logged", value: "79,400" },
    ],
    rows: [
      ["ST-7781", "Ayesha Noor", "Grade 6-B", "Excellent", "Updated"],
      ["ST-5512", "Hamza Khan", "Grade 10-C", "Good", "Updated"],
      ["ST-3188", "Fatima Yousaf", "Grade 4-A", "Very Good", "Pending Docs"],
    ],
    headers: ["Student ID", "Name", "Class", "Performance", "Portfolio Status"],
  },
  "School Leaving": {
    stats: [
      { label: "Pending Clearance", value: "11" },
      { label: "Certificates Issued", value: "34" },
      { label: "Exit Requests", value: "16" },
      { label: "Rejected Requests", value: "2" },
    ],
    rows: [
      ["LV-001", "Hassan Rauf", "Grade 9-A", "Clearance In Progress", "Pending"],
      ["LV-002", "Iqra Saleem", "Grade 7-B", "Certificate Issued", "Completed"],
      ["LV-003", "Zain Haider", "Grade 5-C", "Accounts Hold", "Blocked"],
    ],
    headers: ["Case #", "Student", "Class", "Stage", "Status"],
  },
  "Time & Attendance": {
    stats: [
      { label: "Student Attendance Today", value: "92.4%" },
      { label: "Staff Attendance Today", value: "95.1%" },
      { label: "Leave Requests", value: "18" },
      { label: "Late Arrivals", value: "43" },
    ],
    rows: [
      ["2026-06-17", "Grade 8-A", "42/45", "93.3%", "2 leave"],
      ["2026-06-17", "Grade 9-C", "39/44", "88.6%", "3 leave"],
      ["2026-06-17", "Grade 10-B", "46/48", "95.8%", "1 leave"],
    ],
    headers: ["Date", "Class", "Present", "Attendance", "Notes"],
  },
  Payroll: {
    stats: [
      { label: "Employees", value: "324" },
      { label: "Monthly Payroll", value: "PKR 28.4M" },
      { label: "Pending Approvals", value: "19" },
      { label: "Paid Slips", value: "305" },
    ],
    rows: [
      ["PR-2026-06", "June 2026", "PKR 28,400,000", "Approved", "Processed"],
      ["PR-2026-05", "May 2026", "PKR 27,950,000", "Approved", "Processed"],
      ["PR-2026-04", "Apr 2026", "PKR 27,620,000", "Approved", "Processed"],
    ],
    headers: ["Payroll #", "Month", "Total", "Status", "Payment"],
  },
  Reports: {
    stats: [
      { label: "Generated Today", value: "57" },
      { label: "PDF Exports", value: "31" },
      { label: "Excel Exports", value: "26" },
      { label: "Queued Large Reports", value: "4" },
    ],
    rows: [
      ["Admissions Summary", "PDF", "Super Admin", "2026-06-17 11:42", "Ready"],
      ["Fee Defaulter List", "Excel", "Accounts", "2026-06-17 12:15", "Ready"],
      ["Attendance Monthly", "PDF", "Teacher", "2026-06-17 12:32", "Processing"],
    ],
    headers: ["Report", "Format", "Requested By", "Requested At", "Status"],
  },
};

export const superAdminKpis = [
  { label: "Total Students", value: "102,438" },
  { label: "Total Teachers", value: "1,248" },
  { label: "Pending Fees", value: "PKR 38.1M" },
  { label: "Attendance %", value: "92.7%" },
  { label: "Present Teachers", value: "1,182" },
  { label: "Absent Teachers", value: "66" },
  { label: "Present Students", value: "94,310" },
  { label: "Absent Students", value: "8,128" },
  { label: "Total On Leave", value: "214" },
];

export const teacherKpis = [
  { label: "Assigned Classes", value: "5" },
  { label: "Today's Attendance", value: "93.8%" },
  { label: "Total Students", value: "214" },
  { label: "Pending Tasks", value: "12" },
];

export const trendSeries = [
  { month: "Jan", admissions: 560, fee: 41, attendance: 90, payroll: 24 },
  { month: "Feb", admissions: 640, fee: 46, attendance: 91, payroll: 25 },
  { month: "Mar", admissions: 710, fee: 52, attendance: 92, payroll: 26 },
  { month: "Apr", admissions: 680, fee: 50, attendance: 91, payroll: 26 },
  { month: "May", admissions: 760, fee: 57, attendance: 93, payroll: 27 },
  { month: "Jun", admissions: 810, fee: 61, attendance: 94, payroll: 28 },
];

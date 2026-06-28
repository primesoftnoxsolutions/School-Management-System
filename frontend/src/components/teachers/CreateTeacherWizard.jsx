import { useEffect, useMemo, useState } from "react";
import { BRANCH_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS } from "../../constants/classes";
import ScrollableMultiSelect from "../ui/ScrollableMultiSelect";
import ScrollableSelect from "../ui/ScrollableSelect";
import SubjectManager from "./SubjectManager";

const STEPS = [
  { id: 1, title: "Personal Info" },
  { id: 2, title: "Class Assignments" },
  { id: 3, title: "Teacher Login Details" },
];

export const NO_ASSIGN_CLASS = "NO ASSIGN";

export function isNoAssignClass(className) {
  return className === NO_ASSIGN_CLASS;
}

export const initialCreateTeacherForm = {
  fullName: "",
  cnic: "",
  address: "",
  phoneNumber: "",
  designation: "",
  qualification: "",
  expertise: "",
  salary: "",
  branch: "",
  className: "",
  classNames: [],
  classAssignments: [],
  sections: [],
  sectionSubjects: {},
  sectionSubjectPools: {},
  email: "",
  password: "",
  confirmPassword: "",
  allowPasswordReset: true,
};

function Field({ label, required, children, dark = false }) {
  return (
    <div>
      <label className={`mb-1.5 block text-sm font-medium ${dark ? "text-[#9e9e9e]" : "text-slate-700"}`}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function inputClass(dark = false, extra = "") {
  return dark
    ? `w-full rounded-xl border border-white/[0.06] bg-[#1a1b26] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#9e9e9e] focus:border-[#7c4dff]/40 focus:ring-2 focus:ring-[#7c4dff]/15 ${extra}`
    : `w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${extra}`;
}

function createEmptyClassAssignment(className) {
  return {
    className,
    classSubjects: [],
    sections: [],
    sectionSubjects: {},
    sectionSubjectPools: {},
  };
}

function syncSectionData(sections, subjectsMap = {}, poolsMap = {}) {
  const sectionSubjects = {};
  const sectionSubjectPools = {};
  sections.forEach((section) => {
    sectionSubjects[section] = subjectsMap[section] || [];
    sectionSubjectPools[section] = poolsMap[section]?.length ? poolsMap[section] : [...SUBJECT_OPTIONS];
  });
  return { sectionSubjects, sectionSubjectPools };
}

function syncClassAssignments(selectedClasses, existingAssignments = []) {
  const lookup = new Map((existingAssignments || []).map((item) => [item.className, item]));
  return selectedClasses.map((className) => {
    const existing = lookup.get(className);
    return existing
      ? {
          className,
          classSubjects: existing.classSubjects || [],
          sections: existing.sections || [],
          sectionSubjects: existing.sectionSubjects || {},
          sectionSubjectPools: existing.sectionSubjectPools || {},
        }
      : createEmptyClassAssignment(className);
  });
}

function ClassAssignmentCard({
  assignment,
  sectionOptions,
  subjectOptions,
  dark,
  onSectionsChange,
  onClassSubjectsChange,
  onSectionPoolChange,
  onSectionSubjectsChange,
}) {
  const subjectLabel = assignment.sections.length
    ? `Section ${assignment.sections[0]} - Subjects`
    : "Subjects (multiple)";
  const subjectPlaceholder = assignment.sections.length ? `Select subjects for Section ${assignment.sections[0]}` : "Select subjects";

  return (
    <div
      className={`space-y-3 rounded-xl border p-3 ${
        dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#7c4dff]" : "text-indigo-600"}`}>
            Class Assignment
          </p>
          <h5 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{assignment.className}</h5>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ScrollableMultiSelect
          label="Sections (multiple)"
          placeholder="Select sections"
          values={assignment.sections}
          options={sectionOptions}
          onChange={onSectionsChange}
          required
          openUpward
          dark={dark}
        />

        <div className="space-y-3">
          <ScrollableMultiSelect
            label={subjectLabel}
            placeholder={subjectPlaceholder}
            values={assignment.classSubjects || []}
            options={subjectOptions}
            onChange={onClassSubjectsChange}
            required
            openUpward
            dark={dark}
          />
        </div>
      </div>
    </div>
  );
}

function ClassAssignmentFields({
  form,
  classOptions,
  branchOptions,
  sectionOptions,
  subjectOptions,
  hasNoAssignment,
  onClassNamesChange,
  onBranchChange,
  onClassAssignmentSectionsChange,
  onClassAssignmentSubjectsChange,
  onClassAssignmentSectionPoolChange,
  onClassAssignmentSectionSubjectsChange,
  dark,
}) {
  const assignments = form.classAssignments || [];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ScrollableMultiSelect
          label="Classes"
          placeholder="Select classes"
          values={form.classNames}
          options={classOptions}
          onChange={onClassNamesChange}
          required
          openUpward
          dark={dark}
        />
        <ScrollableSelect
          label="Branch"
          placeholder="Select branch"
          value={form.branch}
          options={branchOptions}
          onChange={onBranchChange}
          required={!hasNoAssignment}
          disabled={hasNoAssignment}
          openUpward
          dark={dark}
        />
      </div>

      {hasNoAssignment ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          No class assignment selected. You can assign classes later from Edit.
        </div>
      ) : null}

      {!hasNoAssignment && assignments.length ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <ClassAssignmentCard
              key={assignment.className}
              assignment={assignment}
              sectionOptions={sectionOptions}
              subjectOptions={subjectOptions}
              dark={dark}
              onSectionsChange={(sections) => onClassAssignmentSectionsChange(assignment.className, sections)}
              onClassSubjectsChange={(subjects) => onClassAssignmentSubjectsChange(assignment.className, subjects)}
              onSectionPoolChange={(section, subjects) =>
                onClassAssignmentSectionPoolChange(assignment.className, section, subjects)
              }
              onSectionSubjectsChange={(section, subjects) =>
                onClassAssignmentSectionSubjectsChange(assignment.className, section, subjects)
              }
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function buildAssignmentsFromSelection(classNameOrAssignments, branch, sections, sectionSubjects) {
  const normalizedBranch = branch === "Boys" ? "Boys" : "Girls";
  const assignments = [];

  if (Array.isArray(classNameOrAssignments) && classNameOrAssignments.length && typeof classNameOrAssignments[0] === "object") {
    for (const block of classNameOrAssignments) {
      const className = String(block.className || "").trim();
      if (!className || isNoAssignClass(className)) continue;
      for (const section of block.sections || []) {
        const subjects = block.sectionSubjects?.[section] || [];
        for (const subject of subjects) {
          assignments.push({ className, branch: normalizedBranch, section, subject });
        }
      }
    }
    return assignments;
  }

  const classNames = Array.isArray(classNameOrAssignments) ? classNameOrAssignments : [classNameOrAssignments];
  const selectedClasses = classNames.map((item) => String(item || "").trim()).filter(Boolean);
  if (!selectedClasses.length || selectedClasses.every(isNoAssignClass)) return [];

  for (const selectedClass of selectedClasses) {
    if (isNoAssignClass(selectedClass)) continue;
    for (const section of sections || []) {
      const subjects = sectionSubjects?.[section] || [];
      for (const subject of subjects) {
        assignments.push({ className: selectedClass, branch: normalizedBranch, section, subject });
      }
    }
  }
  return assignments;
}

export function assignedClassesToFormState(assignedClasses = [], teacher = {}) {
  const base = {
    ...initialCreateTeacherForm,
    fullName: teacher.fullName || "",
  };

  if (!assignedClasses.length) {
    return {
      ...base,
      className: NO_ASSIGN_CLASS,
      classNames: [NO_ASSIGN_CLASS],
      classAssignments: [],
      classSubjects: [],
      sections: [],
      sectionSubjects: {},
      sectionSubjectPools: {},
    };
  }

  const classNames = [...new Set(assignedClasses.map((row) => row.className || "").filter(Boolean))].sort(
    (a, b) => CLASS_OPTIONS.indexOf(a) - CLASS_OPTIONS.indexOf(b)
  );
  const branch = assignedClasses[0].branch === "Boys" ? "Boys" : "Girls";
  const classAssignments = classNames.map((className) => {
    const rows = assignedClasses.filter((row) => (row.className || "") === className);
    const sections = [...new Set(rows.map((row) => row.section || "A"))].sort(
      (a, b) => SECTION_OPTIONS.indexOf(a) - SECTION_OPTIONS.indexOf(b)
    );
    const sectionSubjects = {};
    const sectionSubjectPools = {};

    sections.forEach((section) => {
      const subjects = rows
        .filter((row) => (row.section || "A") === section)
        .map((row) => row.subject || "Class Teacher")
        .filter(Boolean);
      sectionSubjects[section] = subjects;
      const pool = [...SUBJECT_OPTIONS];
      subjects.forEach((subject) => {
        if (!pool.some((item) => item.toLowerCase() === subject.toLowerCase())) {
          pool.push(subject);
        }
      });
      sectionSubjectPools[section] = pool;
    });

    return {
      className,
      classSubjects: [...new Set(rows.map((row) => row.subject || "Class Teacher").filter(Boolean))],
      sections,
      sectionSubjects,
      sectionSubjectPools,
    };
  });

  const firstClass = classNames[0] || "";
  const firstAssignment = classAssignments[0] || createEmptyClassAssignment(firstClass);

  return {
    ...base,
    branch,
    className: firstClass || NO_ASSIGN_CLASS,
    classNames: classNames.length ? classNames : [NO_ASSIGN_CLASS],
    classAssignments,
    sections: firstAssignment.sections || [],
    sectionSubjects: firstAssignment.sectionSubjects || {},
    sectionSubjectPools: firstAssignment.sectionSubjectPools || {},
  };
}

export default function CreateTeacherWizard({
  form,
  setForm,
  onSubmit,
  saving,
  onCancel,
  onTitleChange,
  dark = false,
  mode = "create",
  submitError = "",
  onDismissError,
}) {
  const isAssignMode = mode === "assign";
  const isImportMode = mode === "import";
  const [step, setStep] = useState(isAssignMode ? 2 : 1);
  const [stepDirection, setStepDirection] = useState("forward");
  const [stepError, setStepError] = useState("");

  useEffect(() => {
    if (!onTitleChange) return;
    const name = form.fullName?.trim() || "";
    onTitleChange(isAssignMode || step >= 2 ? name : "");
  }, [step, form.fullName, onTitleChange, isAssignMode]);

  const classOptions = useMemo(() => {
    const options = CLASS_OPTIONS.map((cls) => ({ value: cls, label: cls }));
    return [{ value: NO_ASSIGN_CLASS, label: "NO ASSIGN" }, ...options];
  }, []);
  const branchOptions = useMemo(() => BRANCH_OPTIONS.map((branch) => ({ value: branch, label: branch })), []);
  const sectionOptions = useMemo(
    () => SECTION_OPTIONS.map((sec) => ({ value: sec, label: `Section ${sec}` })),
    []
  );
  const subjectOptions = useMemo(() => SUBJECT_OPTIONS.map((subject) => ({ value: subject, label: subject })), []);

  const selectedClassNames = Array.isArray(form.classNames) ? form.classNames : form.className ? [form.className] : [];
  const activeAssignments = Array.isArray(form.classAssignments) ? form.classAssignments : [];
  const hasNoAssignment = selectedClassNames.includes(NO_ASSIGN_CLASS);

  const update = (patch) => {
    onDismissError?.();
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleClassNamesChange = (classNames) => {
    const normalized = Array.isArray(classNames)
      ? classNames.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    const actualClasses = normalized.filter((item) => !isNoAssignClass(item));

    if (actualClasses.length) {
      setForm((prev) => ({
        ...prev,
        className: actualClasses[0] || "",
        classNames: actualClasses,
        classAssignments: syncClassAssignments(actualClasses, prev.classAssignments),
      }));
      onDismissError?.();
      return;
    }

    if (normalized.includes(NO_ASSIGN_CLASS)) {
      setForm((prev) => ({
        ...prev,
        className: NO_ASSIGN_CLASS,
        classNames: [NO_ASSIGN_CLASS],
        classAssignments: [],
        branch: "",
        sections: [],
        sectionSubjects: {},
        sectionSubjectPools: {},
      }));
      onDismissError?.();
      return;
    }

    setForm((prev) => ({
      ...prev,
      className: "",
      classNames: [],
      classAssignments: [],
      branch: "",
      sections: [],
      sectionSubjects: {},
      sectionSubjectPools: {},
    }));
    onDismissError?.();
  };

  const handleBranchChange = (branch) => {
    setForm((prev) => ({
      ...prev,
      branch,
      classAssignments: (prev.classAssignments || []).map((assignment) => ({
        ...assignment,
        sections: [],
        sectionSubjects: {},
        sectionSubjectPools: {},
      })),
    }));
    onDismissError?.();
  };

  const handleClassAssignmentSectionsChange = (className, sections) => {
    setForm((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((assignment) => {
        if (assignment.className !== className) return assignment;
        const { sectionSubjects, sectionSubjectPools } = syncSectionData(
          sections,
          assignment.sectionSubjects,
          assignment.sectionSubjectPools
        );
        const defaultSubjects = assignment.classSubjects || [];
        const seededSectionSubjects = {};
        const seededSectionSubjectPools = {};
        sections.forEach((section) => {
          seededSectionSubjects[section] = sectionSubjects[section]?.length ? sectionSubjects[section] : defaultSubjects;
          seededSectionSubjectPools[section] = sectionSubjectPools[section] || [...SUBJECT_OPTIONS];
        });
        return { ...assignment, sections, sectionSubjects: seededSectionSubjects, sectionSubjectPools: seededSectionSubjectPools };
      }),
    }));
    onDismissError?.();
  };

  const handleClassAssignmentSubjectsChange = (className, subjects) => {
    setForm((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((assignment) =>
        assignment.className === className
          ? {
              ...assignment,
              classSubjects: subjects,
              sectionSubjects: Object.fromEntries(
                Object.entries(assignment.sectionSubjects || {}).map(([section, selected]) => [
                  section,
                  selected.length ? selected : subjects,
                ])
              ),
            }
          : assignment
      ),
    }));
    onDismissError?.();
  };

  const handleClassAssignmentSectionSubjectsChange = (className, section, subjects) => {
    setForm((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((assignment) =>
        assignment.className === className
          ? {
              ...assignment,
              sectionSubjects: {
                ...assignment.sectionSubjects,
                [section]: subjects,
              },
            }
          : assignment
      ),
    }));
    onDismissError?.();
  };

  const handleClassAssignmentSectionPoolChange = (className, section, subjects) => {
    setForm((prev) => ({
      ...prev,
      classAssignments: (prev.classAssignments || []).map((assignment) =>
        assignment.className === className
          ? {
              ...assignment,
              sectionSubjectPools: {
                ...assignment.sectionSubjectPools,
                [section]: subjects,
              },
              sectionSubjects: {
                ...assignment.sectionSubjects,
                [section]: (assignment.sectionSubjects[section] || []).filter((item) => subjects.includes(item)),
              },
            }
          : assignment
      ),
    }));
    onDismissError?.();
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.fullName.trim()) return "Full Name is required.";
      return "";
    }
    if (currentStep === 2) {
      if (!selectedClassNames.length) return "Please select at least one class or NO ASSIGN.";
      if (selectedClassNames.includes(NO_ASSIGN_CLASS)) return "";
      if (!form.branch) return "Please select a branch (Girls or Boys).";
      if (!activeAssignments.length) return "Please configure at least one class assignment.";

      for (const assignment of activeAssignments) {
        if (!assignment.sections.length) {
          return `Please select at least one section for ${assignment.className}.`;
        }
        const sectionWithoutSubjects = assignment.sections.find(
          (section) => !(assignment.sectionSubjects[section] || []).length
        );
        if (sectionWithoutSubjects) {
          return `Please assign at least one subject to ${assignment.className} - Section ${sectionWithoutSubjects}.`;
        }
      }
      return "";
    }
    if (currentStep === 3) {
      if (!form.email.trim()) return "Email ID is required.";
      if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
      return "";
    }
    return "";
  };

  const goNext = () => {
    const message = validateStep(step);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError("");
    onDismissError?.();
    setStepDirection("forward");
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const goBack = () => {
    setStepError("");
    onDismissError?.();
    setStepDirection("back");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = validateStep(isAssignMode ? 2 : 3);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError("");
    onSubmit(form);
  };

  const handleSaveAssignments = () => {
    const message = validateStep(2);
    if (message) {
      setStepError(message);
      return;
    }
    setStepError("");
    onSubmit(form);
  };

  const stepPanelClass = stepDirection === "back" ? "wizard-step-enter-back" : "wizard-step-enter";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isAssignMode ? (
        <div className="flex items-center gap-2">
          {STEPS.map((item, index) => {
            const active = step === item.id;
            const done = step > item.id;
            return (
              <div key={item.id} className="flex flex-1 items-center gap-2">
                <div
                  className={`wizard-step-indicator flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active ? "wizard-step-indicator-active" : ""
                  } ${
                    active || done
                      ? dark
                        ? "bg-[#7c4dff] text-white"
                        : "bg-indigo-600 text-white"
                      : dark
                        ? "bg-[#1a1b26] text-[#9e9e9e]"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.id}
                </div>
                <div className="min-w-0">
                  <p
                    className={`truncate text-xs font-semibold ${
                      active ? (dark ? "text-[#7c4dff]" : "text-indigo-700") : dark ? "text-[#9e9e9e]" : "text-slate-500"
                    }`}
                  >
                    Step {item.id}
                  </p>
                  <p
                    className={`truncate text-sm font-medium ${
                      active ? (dark ? "text-white" : "text-slate-900") : dark ? "text-[#9e9e9e]" : "text-slate-500"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
                {index < STEPS.length - 1 ? (
                  <div className={`mx-1 hidden h-px flex-1 sm:block ${dark ? "bg-white/[0.06]" : "bg-slate-200"}`} />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="wizard-step-enter">
          <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#7c4dff]" : "text-indigo-600"}`}>
            Step 2
          </p>
          <h4 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Class Assignments</h4>
          {form.fullName ? (
            <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
              Assigning classes for {form.fullName}
            </p>
          ) : null}
        </div>
      )}

      {!isAssignMode ? (
        <div key={`wizard-step-${step}`} className={stepPanelClass}>
          {step === 1 ? (
            <div className="space-y-4">
              <h4 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Personal Info</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" required dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.fullName}
                    onChange={(e) => update({ fullName: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </Field>
                <Field label="CNIC" dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.cnic}
                    onChange={(e) => update({ cnic: e.target.value })}
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                </Field>
                <Field label="Phone Number" dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.phoneNumber}
                    onChange={(e) => update({ phoneNumber: e.target.value })}
                    placeholder="03XX-XXXXXXX"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address" dark={dark}>
                    <input
                      className={inputClass(dark)}
                      value={form.address}
                      onChange={(e) => update({ address: e.target.value })}
                      placeholder="Residential address"
                    />
                  </Field>
                </div>
                <Field label="Designation" dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.designation}
                    onChange={(e) => update({ designation: e.target.value })}
                    placeholder="e.g. Senior Teacher"
                  />
                </Field>
                <Field label="Qualification" dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.qualification}
                    onChange={(e) => update({ qualification: e.target.value })}
                    placeholder="e.g. M.Ed, B.Ed"
                  />
                </Field>
                <Field label="Expertise / Favorite Subjects" dark={dark}>
                  <input
                    className={inputClass(dark)}
                    value={form.expertise}
                    onChange={(e) => update({ expertise: e.target.value })}
                    placeholder="e.g. Mathematics, Physics"
                  />
                </Field>
                <Field label="Salary" dark={dark}>
                  <input
                    type="number"
                    min="0"
                    className={inputClass(dark)}
                    value={form.salary}
                    onChange={(e) => update({ salary: e.target.value })}
                    placeholder="Monthly salary (Rs.)"
                  />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h4 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Class Assignments</h4>
              <ClassAssignmentFields
                form={form}
                classOptions={classOptions}
                branchOptions={branchOptions}
                sectionOptions={sectionOptions}
                subjectOptions={subjectOptions}
                hasNoAssignment={hasNoAssignment}
                onClassNamesChange={handleClassNamesChange}
                onBranchChange={handleBranchChange}
                onClassAssignmentSectionsChange={handleClassAssignmentSectionsChange}
                onClassAssignmentSubjectsChange={handleClassAssignmentSubjectsChange}
                onClassAssignmentSectionPoolChange={handleClassAssignmentSectionPoolChange}
                onClassAssignmentSectionSubjectsChange={handleClassAssignmentSectionSubjectsChange}
                dark={dark}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h4 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>Teacher Login Details</h4>
              <Field label="Email ID" required dark={dark}>
                <input
                  type="email"
                  className={inputClass(dark)}
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="teacher@schoolerp.local"
                  required
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Password" required dark={dark}>
                  <input
                    type="password"
                    className={inputClass(dark)}
                    value={form.password}
                    onChange={(e) => update({ password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </Field>
                <Field label="Confirm Password" required dark={dark}>
                  <input
                    type="password"
                    className={inputClass(dark)}
                    value={form.confirmPassword}
                    onChange={(e) => update({ confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    required
                  />
                </Field>
              </div>
              <div
                className={`rounded-xl border px-4 py-3 ${
                  dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"
                }`}
              >
                <label className={`flex items-start gap-3 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-700"}`}>
                  <input
                    type="checkbox"
                    checked={form.allowPasswordReset}
                    onChange={(e) => update({ allowPasswordReset: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
                  />
                  <span>
                    <span className={`font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                      Enable change / forgot password
                    </span>
                    <span className={`mt-1 block ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      Teacher can use forgot password on login page to reset their account password.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div key="wizard-assign-step" className="wizard-step-enter">
          <div className="space-y-4">
            <ClassAssignmentFields
              form={form}
              classOptions={classOptions}
              branchOptions={branchOptions}
              sectionOptions={sectionOptions}
              subjectOptions={subjectOptions}
              hasNoAssignment={hasNoAssignment}
              onClassNamesChange={handleClassNamesChange}
              onBranchChange={handleBranchChange}
              onClassAssignmentSectionsChange={handleClassAssignmentSectionsChange}
              onClassAssignmentSubjectsChange={handleClassAssignmentSubjectsChange}
              onClassAssignmentSectionPoolChange={handleClassAssignmentSectionPoolChange}
              onClassAssignmentSectionSubjectsChange={handleClassAssignmentSectionSubjectsChange}
              dark={dark}
            />
          </div>
        </div>
      )}

      {stepError || submitError ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="alert"
        >
          {stepError || submitError}
        </div>
      ) : null}

      <div
        className={`flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-between ${
          dark ? "border-white/[0.06]" : "border-slate-100"
        }`}
      >
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
            dark
              ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Cancel
        </button>
        <div className="flex gap-2">
          {!isAssignMode && step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                dark
                  ? "border-white/[0.06] bg-[#1a1b26] text-white hover:bg-white/[0.04]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Back
            </button>
          ) : null}
          {isAssignMode ? (
            <button
              type="button"
              onClick={handleSaveAssignments}
              disabled={saving}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saving ? "Saving..." : "Save Assignments"}
            </button>
          ) : step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saving ? (isImportMode ? "Importing..." : "Creating...") : isImportMode ? "Import Teacher" : "Create Teacher"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

import { useEffect, useMemo, useState } from "react";
import { CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS } from "../../constants/classes";
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
  className: "",
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

export function buildAssignmentsFromSelection(className, sections, sectionSubjects) {
  if (isNoAssignClass(className)) return [];
  const assignments = [];
  for (const section of sections) {
    const subjects = sectionSubjects[section] || [];
    for (const subject of subjects) {
      assignments.push({ className, section, subject });
    }
  }
  return assignments;
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

export function assignedClassesToFormState(assignedClasses = [], teacher = {}) {
  const base = {
    ...initialCreateTeacherForm,
    fullName: teacher.fullName || "",
  };

  if (!assignedClasses.length) {
    return {
      ...base,
      className: NO_ASSIGN_CLASS,
      sections: [],
      sectionSubjects: {},
      sectionSubjectPools: {},
    };
  }

  const className = assignedClasses[0].className || "";
  const sections = [...new Set(assignedClasses.map((row) => row.section || "A"))].sort(
    (a, b) => SECTION_OPTIONS.indexOf(a) - SECTION_OPTIONS.indexOf(b)
  );
  const sectionSubjects = {};
  const sectionSubjectPools = {};

  sections.forEach((section) => {
    const subjects = assignedClasses
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

  return { ...base, className, sections, sectionSubjects, sectionSubjectPools };
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
  const sectionOptions = useMemo(
    () => SECTION_OPTIONS.map((sec) => ({ value: sec, label: `Section ${sec}` })),
    []
  );

  const update = (patch) => {
    onDismissError?.();
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleClassNameChange = (className) => {
    if (isNoAssignClass(className)) {
      update({ className, sections: [], sectionSubjects: {}, sectionSubjectPools: {} });
      return;
    }
    update({ className });
  };

  const hasNoAssignment = isNoAssignClass(form.className);

  const handleSectionsChange = (sections) => {
    setForm((prev) => {
      const { sectionSubjects, sectionSubjectPools } = syncSectionData(
        sections,
        prev.sectionSubjects,
        prev.sectionSubjectPools
      );
      return { ...prev, sections, sectionSubjects, sectionSubjectPools };
    });
  };

  const handleSectionSubjectsChange = (section, subjects) => {
    setForm((prev) => ({
      ...prev,
      sectionSubjects: {
        ...prev.sectionSubjects,
        [section]: subjects,
      },
    }));
  };

  const handleSectionPoolChange = (section, subjects) => {
    setForm((prev) => ({
      ...prev,
      sectionSubjectPools: {
        ...prev.sectionSubjectPools,
        [section]: subjects,
      },
      sectionSubjects: {
        ...prev.sectionSubjects,
        [section]: (prev.sectionSubjects[section] || []).filter((item) => subjects.includes(item)),
      },
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.fullName.trim()) return "Full Name is required.";
      return "";
    }
    if (currentStep === 2) {
      if (!form.className) return "Please select a class or NO ASSIGN.";
      if (isNoAssignClass(form.className)) return "";
      if (!form.sections.length) return "Please select at least one section.";
      const sectionWithoutSubjects = form.sections.find(
        (section) => !(form.sectionSubjects[section] || []).length
      );
      if (sectionWithoutSubjects) {
        return `Please assign at least one subject to Section ${sectionWithoutSubjects}.`;
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
          <ScrollableSelect
            label="Class"
            placeholder="Select class"
            value={form.className}
            options={classOptions}
            onChange={handleClassNameChange}
            required
            openUpward
            dark={dark}
          />

          {hasNoAssignment ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              No class assignment selected. You can assign classes later from Edit.
            </div>
          ) : null}

          {!hasNoAssignment ? (
          <ScrollableMultiSelect
            label="Sections (multiple)"
            placeholder="Select sections"
            values={form.sections}
            options={sectionOptions}
            onChange={handleSectionsChange}
            required
            openUpward
            dark={dark}
          />
          ) : null}

          {!hasNoAssignment && form.className && form.sections.length ? (
            <>
              <div
                className={`space-y-4 rounded-xl border p-4 ${
                  dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
                  Assign subjects per section — {form.className}
                </p>
                {[...form.sections].sort().map((section) => (
                  <SubjectManager
                    key={section}
                    label={`Section ${section} — Subjects`}
                    placeholder={`Select subjects for Section ${section}`}
                    subjects={form.sectionSubjectPools[section] || [...SUBJECT_OPTIONS]}
                    selected={form.sectionSubjects[section] || []}
                    onSubjectsChange={(subjects) => handleSectionPoolChange(section, subjects)}
                    onSelectedChange={(subjects) => handleSectionSubjectsChange(section, subjects)}
                    dark={dark}
                  />
                ))}
              </div>
            </>
          ) : null}
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
          <ScrollableSelect
            label="Class"
            placeholder="Select class"
            value={form.className}
            options={classOptions}
            onChange={handleClassNameChange}
            required
            openUpward
            dark={dark}
          />

          {hasNoAssignment ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              No class assignment selected. You can assign classes later from Edit.
            </div>
          ) : null}

          {!hasNoAssignment ? (
          <ScrollableMultiSelect
            label="Sections (multiple)"
            placeholder="Select sections"
            values={form.sections}
            options={sectionOptions}
            onChange={handleSectionsChange}
            required
            openUpward
            dark={dark}
          />
          ) : null}

          {!hasNoAssignment && form.className && form.sections.length ? (
            <>
              <div
                className={`space-y-4 rounded-xl border p-4 ${
                  dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
                  Assign subjects per section — {form.className}
                </p>
                {[...form.sections].sort().map((section) => (
                  <SubjectManager
                    key={section}
                    label={`Section ${section} — Subjects`}
                    placeholder={`Select subjects for Section ${section}`}
                    subjects={form.sectionSubjectPools[section] || [...SUBJECT_OPTIONS]}
                    selected={form.sectionSubjects[section] || []}
                    onSubjectsChange={(subjects) => handleSectionPoolChange(section, subjects)}
                    onSelectedChange={(subjects) => handleSectionSubjectsChange(section, subjects)}
                    dark={dark}
                  />
                ))}
              </div>
            </>
          ) : null}
          </div>
        </div>
      )}

      {stepError || submitError ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark
              ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]"
              : "border-rose-200 bg-rose-50 text-rose-700"
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
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          ) : step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white ${
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className={`rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
                dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
              }`}
            >
              {saving ? "Creating..." : "Create Teacher"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

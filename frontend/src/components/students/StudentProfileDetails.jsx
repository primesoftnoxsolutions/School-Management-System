function ProfileField({ label, value, dark = false, className = "" }) {
  return (
    <div className={className}>
      <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{label}</p>
      <p className={`font-medium ${dark ? "text-white" : "text-slate-800"}`}>{value || "-"}</p>
    </div>
  );
}

export function StudentProfileHeaderMeta({ student, dark = false }) {
  return (
    <div
      className={`mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 ${
        dark ? "border-white/[0.06]" : "border-slate-100"
      }`}
    >
      <ProfileField label="Student CNIC" value={student?.cnicBForm} dark={dark} />
      <ProfileField label="Student Mobile" value={student?.phoneNumber} dark={dark} />
    </div>
  );
}

export default function StudentProfileDetails({ student, dark = false }) {
  if (!student) return null;

  const subjects = (student.subjects || []).length ? student.subjects.join(", ") : "-";
  const dateOfBirth = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-";
  const admissionDate = student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "-";

  return (
    <div className="modal-body-enter space-y-4 px-6 py-5 text-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ProfileField label="Class" value={student.className} dark={dark} />
        <ProfileField label="Section" value={student.section || "A"} dark={dark} />
        <ProfileField label="Roll No" value={student.rollNumber} dark={dark} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ProfileField label="Father Name" value={student.fatherName || student.guardianName} dark={dark} />
        <ProfileField label="Father CNIC" value={student.fatherCnic} dark={dark} />
        <ProfileField label="Father Mobile" value={student.guardianPhone} dark={dark} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ProfileField label="Gender" value={student.gender} dark={dark} />
        <ProfileField label="Date of Birth" value={dateOfBirth} dark={dark} />
        <ProfileField label="Admission Date" value={admissionDate} dark={dark} />
      </div>

      <ProfileField label="Subjects" value={subjects} dark={dark} />
      <ProfileField label="Address" value={student.address} dark={dark} />
    </div>
  );
}

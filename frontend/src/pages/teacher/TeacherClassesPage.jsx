import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import { resolveStudentPhotoUrl } from "../../utils/mediaUrl";

export default function TeacherClassesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileClass, setProfileClass] = useState("");
  const [profileSection, setProfileSection] = useState("A");
  const [profileStudents, setProfileStudents] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  const assignedClassNames = useMemo(() => [...new Set(items.map((item) => item.className))], [items]);
  const assignedSections = useMemo(
    () => [...new Set(items.filter((item) => !profileClass || item.className === profileClass).map((item) => item.section || "A"))],
    [items, profileClass]
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher-panel/classes", {
        params: { page: 1, limit: 100 },
      });
      setItems(data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load classes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!profileClass && assignedClassNames.length) {
      setProfileClass(assignedClassNames[0]);
    }
  }, [assignedClassNames, profileClass]);

  useEffect(() => {
    if (assignedSections.length && !assignedSections.includes(profileSection)) {
      setProfileSection(assignedSections[0]);
    }
  }, [assignedSections, profileSection]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!profileClass || !profileSection) {
        setProfileStudents([]);
        return;
      }
      setProfilesLoading(true);
      try {
        const { data } = await api.get("/teacher-panel/students", {
          params: { className: profileClass, section: profileSection },
        });
        setProfileStudents(data.data || []);
      } catch {
        setProfileStudents([]);
      } finally {
        setProfilesLoading(false);
      }
    };

    loadProfiles();
  }, [profileClass, profileSection]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Classes</h2>
        <p className="text-sm text-slate-500">View students from your assigned classes.</p>
      </div>

      <div className="ref-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Class Student Profiles</h3>
            <p className="text-sm text-slate-500">Select class and section to view assigned students.</p>
          </div>
          <div className="ml-auto grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <label className="text-xs font-black uppercase tracking-[0.08em] text-blue-700">
              Class
              <select
                className="mt-2 h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 sm:w-48"
                value={profileClass}
                onChange={(event) => setProfileClass(event.target.value)}
              >
                {assignedClassNames.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-black uppercase tracking-[0.08em] text-blue-700">
              Section
              <select
                className="mt-2 h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 sm:w-40"
                value={profileSection}
                onChange={(event) => setProfileSection(event.target.value)}
              >
                {assignedSections.map((section) => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {profilesLoading ? (
            <p className="text-sm text-slate-500">Loading students...</p>
          ) : profileStudents.length ? (
            profileStudents.map((student) => {
              const photo = resolveStudentPhotoUrl(student.studentPhotoUrl);
              const initials = `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}` || "S";
              return (
                <div key={student._id} className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-black text-blue-700">
                    {photo ? <img src={photo} alt={`${student.firstName} ${student.lastName}`} className="h-full w-full object-cover" /> : initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{student.firstName} {student.lastName}</p>
                    <p className="text-xs font-semibold text-slate-500">Reg: {student.admissionNo || student._id}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No students found for this class and section.</p>
          )}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}

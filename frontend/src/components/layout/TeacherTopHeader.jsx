export default function TeacherTopHeader({ user }) {
  return (
    <header className="ref-header mb-6 flex flex-wrap items-center gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Teacher Portal</h1>
        <p className="text-xs text-slate-500">Naseer Ideal Public School</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {(user?.fullName || "T").charAt(0)}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName || "Teacher"}</p>
            <p className="text-xs text-slate-500">Teacher</p>
          </div>
        </div>
      </div>
    </header>
  );
}

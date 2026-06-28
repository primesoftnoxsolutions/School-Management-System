import TeacherSubpagePlaceholder from "./TeacherSubpagePlaceholder";

export default function TeacherDutiesPage({ dark = false }) {
  return (
    <TeacherSubpagePlaceholder
      dark={dark}
      title="Duties"
      subtitle="Teacher duty assignments and follow-up actions."
      points={[
        "Record daily duties, supervision, and special tasks.",
        "This page can later show duty checklists and approvals.",
      ]}
    />
  );
}

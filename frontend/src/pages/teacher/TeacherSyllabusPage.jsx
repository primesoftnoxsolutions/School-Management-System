import TeacherSubpagePlaceholder from "./TeacherSubpagePlaceholder";

export default function TeacherSyllabusPage({ dark = false }) {
  return (
    <TeacherSubpagePlaceholder
      dark={dark}
      title="Syllabus"
      subtitle="View and manage assigned syllabus details."
      points={[
        "Track chapter progress by class and section.",
        "Add syllabus notes, topics, and completion status later.",
      ]}
    />
  );
}

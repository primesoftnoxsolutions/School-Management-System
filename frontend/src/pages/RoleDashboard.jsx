import { useEffect, useMemo, useState } from "react";

import api from "../services/api/client";

import StatCard from "../components/dashboard/StatCard";
import { StatsColumnBoard } from "../components/dashboard/StatsColumnBoard";
import ModernDatePicker from "../components/ui/ModernDatePicker";
import ScrollableSelect from "../components/ui/ScrollableSelect";
import FormModal from "../components/ui/FormModal";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";

import {
  IconAbsent,
  IconAttendance,
  IconClasses,
  IconClock,
  IconFee,
  IconLeave,
  IconPresent,
  IconStudents,
  IconTasks,
  IconTeachers,
} from "../components/icons/DashboardIcons";

const darkCard = "rounded-xl border border-white/[0.06] bg-[#161722]";
const lightCard = "rounded-xl border border-white/80 bg-white/90 shadow-[0_16px_38px_rgba(79,70,229,0.1)]";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCount = (value) => String(Number(value ?? 0)).padStart(2, "0");

const branchKey = (branchSection) => (branchSection === "Boys" ? "Boys" : "Girls");

const allClassOptions = [
  { value: "", label: "Select All Classes" },
  ...CLASS_OPTIONS.map((className) => ({ value: className, label: className })),
];

const allSectionOptions = [
  { value: "", label: "Select All Sections" },
  ...SECTION_OPTIONS.map((section) => ({ value: section, label: `Section ${section}` })),
];

const syllabusData = {
  Girls: [
    {
      id: "g-1",
      teacherName: "Ayesha Khan",
      className: "Grade 2",
      section: "A",
      classSection: "Grade 2 - A",
      from: "2026-06-01",
      to: "2026-06-15",
      totalBooks: 3,
      overallCoverage: 78,
      notes: "Focus on vocabulary and short exercises.",
      books: [
        { bookName: "English Reader", syllabus: "Chapters 1-4", coveredPercent: 80, more: "Revision done" },
        { bookName: "Urdu", syllabus: "Nazm 1-2", coveredPercent: 75, more: "Writing practice included" },
        { bookName: "Maths", syllabus: "Number patterns and tables", coveredPercent: 79, more: "Worksheet pending" },
        { bookName: "Science", syllabus: "Living and non-living things", coveredPercent: 76, more: "Class discussion" },
        { bookName: "Islamiyat", syllabus: "Daily duas", coveredPercent: 77, more: "Recitation practice" },
      ],
    },
    {
      id: "g-pg-1",
      teacherName: "Hira Fatima",
      className: "Play Group",
      section: "A",
      classSection: "Play Group - A",
      from: "2026-06-02",
      to: "2026-06-14",
      totalBooks: 4,
      overallCoverage: 66,
      notes: "Focus on alphabets, rhymes and coloring activities.",
      books: [
        { bookName: "English", syllabus: "Alphabet A to G", coveredPercent: 68, more: "Flash cards used" },
        { bookName: "Urdu", syllabus: "Huroof-e-Tahaji", coveredPercent: 65, more: "Tracing practice" },
        { bookName: "Maths", syllabus: "Counting 1 to 20", coveredPercent: 64, more: "Oral counting" },
        { bookName: "Art", syllabus: "Basic shapes and colors", coveredPercent: 67, more: "Coloring sheets" },
      ],
    },
    {
      id: "g-pg-2",
      teacherName: "Nadia Ali",
      className: "Play Group",
      section: "B",
      classSection: "Play Group - B",
      from: "2026-06-04",
      to: "2026-06-18",
      totalBooks: 4,
      overallCoverage: 61,
      notes: "Activity based learning and phonics practice.",
      books: [
        { bookName: "English", syllabus: "Alphabet H to M", coveredPercent: 60, more: "Story time" },
        { bookName: "Urdu", syllabus: "Pehchan-e-Huroof", coveredPercent: 62, more: "Board tracing" },
        { bookName: "Maths", syllabus: "Shapes and sizes", coveredPercent: 63, more: "Counting blocks" },
        { bookName: "Rhymes", syllabus: "Morning rhymes", coveredPercent: 59, more: "Sing-along practice" },
      ],
    },
    {
      id: "g-pg-3",
      teacherName: "Maira Shah",
      className: "Play Group",
      section: "C",
      classSection: "Play Group - C",
      from: "2026-06-06",
      to: "2026-06-20",
      totalBooks: 4,
      overallCoverage: 70,
      notes: "Reinforce speaking, listening and fine motor activities.",
      books: [
        { bookName: "English", syllabus: "Alphabet N to S", coveredPercent: 71, more: "Picture reading" },
        { bookName: "Urdu", syllabus: "Letter recognition", coveredPercent: 69, more: "Tracing workbook" },
        { bookName: "Maths", syllabus: "Matching numbers", coveredPercent: 70, more: "Class games" },
        { bookName: "EVS", syllabus: "Self introduction", coveredPercent: 70, more: "Show and tell" },
      ],
    },
    {
      id: "g-2",
      teacherName: "Sana Bibi",
      className: "Grade 4",
      section: "B",
      classSection: "Grade 4 - B",
      from: "2026-06-03",
      to: "2026-06-20",
      totalBooks: 4,
      overallCoverage: 83,
      notes: "Weekly quizzes are already covered.",
      books: [
        { bookName: "Science", syllabus: "Plants and habitats", coveredPercent: 85, more: "Lab activity complete" },
        { bookName: "Islamiyat", syllabus: "Dua and Akhlaq", coveredPercent: 81, more: "Oral recitation done" },
        { bookName: "Computer", syllabus: "Parts of computer", coveredPercent: 82, more: "Practical demo done" },
        { bookName: "English Grammar", syllabus: "Parts of speech", coveredPercent: 84, more: "Quiz completed" },
      ],
    },
    {
      id: "g-3",
      teacherName: "Maria Noor",
      className: "Grade 5",
      section: "A",
      classSection: "Grade 5 - A",
      from: "2026-06-08",
      to: "2026-06-24",
      totalBooks: 4,
      overallCoverage: 74,
      notes: "Focus on writing and comprehension.",
      books: [
        { bookName: "English", syllabus: "Essay writing", coveredPercent: 72, more: "Draft review pending" },
        { bookName: "Maths", syllabus: "Fractions", coveredPercent: 75, more: "Practice book assigned" },
        { bookName: "Science", syllabus: "Water cycle", coveredPercent: 73, more: "Diagram work" },
        { bookName: "Urdu", syllabus: "Comprehension", coveredPercent: 76, more: "Homework checked" },
      ],
    },
  ],
  Boys: [
    {
      id: "b-1",
      teacherName: "Imran Ali",
      className: "Grade 3",
      section: "A",
      classSection: "Grade 3 - A",
      from: "2026-06-01",
      to: "2026-06-18",
      totalBooks: 3,
      overallCoverage: 72,
      notes: "Concentrate on reading speed and handwriting.",
      books: [
        { bookName: "English Reader", syllabus: "Chapter 2-5", coveredPercent: 74, more: "Comprehension class pending" },
        { bookName: "Maths", syllabus: "Addition and subtraction", coveredPercent: 71, more: "Practice sheets issued" },
        { bookName: "General Knowledge", syllabus: "Pakistan and provinces", coveredPercent: 72, more: "Map work included" },
        { bookName: "Urdu", syllabus: "Sentence making", coveredPercent: 70, more: "Oral drill done" },
      ],
    },
    {
      id: "b-pg-1",
      teacherName: "Rizwan Khan",
      className: "Play Group",
      section: "A",
      classSection: "Play Group - A",
      from: "2026-06-01",
      to: "2026-06-16",
      totalBooks: 4,
      overallCoverage: 63,
      notes: "Play-based learning with daily activity sheets.",
      books: [
        { bookName: "English", syllabus: "Alphabet A to F", coveredPercent: 64, more: "Phonics songs" },
        { bookName: "Urdu", syllabus: "Basic letters", coveredPercent: 62, more: "Tracing lines" },
        { bookName: "Maths", syllabus: "Counting 1 to 15", coveredPercent: 61, more: "Beads activity" },
        { bookName: "Drawing", syllabus: "Lines and circles", coveredPercent: 65, more: "Crayon practice" },
      ],
    },
    {
      id: "b-pg-2",
      teacherName: "Tariq Javed",
      className: "Play Group",
      section: "B",
      classSection: "Play Group - B",
      from: "2026-06-03",
      to: "2026-06-19",
      totalBooks: 4,
      overallCoverage: 58,
      notes: "Focus on oral learning and motor skills.",
      books: [
        { bookName: "English", syllabus: "Alphabet G to L", coveredPercent: 57, more: "Flashcard drill" },
        { bookName: "Urdu", syllabus: "Letter sound match", coveredPercent: 59, more: "Board work" },
        { bookName: "Maths", syllabus: "Shape recognition", coveredPercent: 60, more: "Blocks activity" },
        { bookName: "Rhymes", syllabus: "Morning prayer and rhymes", coveredPercent: 58, more: "Group recitation" },
      ],
    },
    {
      id: "b-pg-3",
      teacherName: "Kashif Raza",
      className: "Play Group",
      section: "C",
      classSection: "Play Group - C",
      from: "2026-06-05",
      to: "2026-06-21",
      totalBooks: 4,
      overallCoverage: 67,
      notes: "Improving handwriting and classroom manners.",
      books: [
        { bookName: "English", syllabus: "Alphabet M to R", coveredPercent: 66, more: "Reading circles" },
        { bookName: "Urdu", syllabus: "Basic vowels", coveredPercent: 68, more: "Oral practice" },
        { bookName: "Maths", syllabus: "Comparing quantities", coveredPercent: 67, more: "Counting blocks" },
        { bookName: "Art", syllabus: "Colors and crayons", coveredPercent: 68, more: "Color fill sheets" },
      ],
    },
    {
      id: "b-2",
      teacherName: "Usman Raza",
      className: "Grade 6",
      section: "B",
      classSection: "Grade 6 - B",
      from: "2026-06-05",
      to: "2026-06-22",
      totalBooks: 4,
      overallCoverage: 88,
      notes: "Workbook entries are near completion.",
      books: [
        { bookName: "Science", syllabus: "Energy and force", coveredPercent: 90, more: "Class experiment done" },
        { bookName: "Urdu", syllabus: "Essay writing", coveredPercent: 86, more: "Homework checked" },
        { bookName: "Social Studies", syllabus: "History timeline", coveredPercent: 89, more: "Project activity pending" },
        { bookName: "Maths", syllabus: "Decimals", coveredPercent: 87, more: "Board practice complete" },
      ],
    },
    {
      id: "b-3",
      teacherName: "Faisal Shah",
      className: "Grade 8",
      section: "C",
      classSection: "Grade 8 - C",
      from: "2026-06-10",
      to: "2026-06-26",
      totalBooks: 5,
      overallCoverage: 69,
      notes: "Extra revision needed before exams.",
      books: [
        { bookName: "Physics", syllabus: "Motion", coveredPercent: 68, more: "Concept test pending" },
        { bookName: "Chemistry", syllabus: "States of matter", coveredPercent: 70, more: "Lab notes pending" },
        { bookName: "Maths", syllabus: "Algebra basics", coveredPercent: 67, more: "Worksheet in progress" },
        { bookName: "English", syllabus: "Comprehension", coveredPercent: 71, more: "Reading session complete" },
        { bookName: "Computer", syllabus: "MS Word basics", coveredPercent: 69, more: "Typing drill pending" },
      ],
    },
  ],
};

const furnitureData = {
  Girls: [
    {
      id: "fg-1",
      teacherName: "Ayesha Khan",
      className: "Grade 2",
      section: "A",
      classSection: "Grade 2 - A",
      from: "2026-06-18",
      to: "2026-06-27",
      brokenDeskBenchChairs: "2 desks / 3 chairs",
      bulbs: 1,
      fans: 0,
      more: "Classroom 4 needs immediate repair.",
    },
    {
      id: "fg-2",
      teacherName: "Sana Bibi",
      className: "Grade 4",
      section: "B",
      classSection: "Grade 4 - B",
      from: "2026-06-20",
      to: "2026-06-28",
      brokenDeskBenchChairs: "1 bench / 2 chairs",
      bulbs: 0,
      fans: 1,
      more: "Fan motor is weak and should be serviced.",
    },
  ],
  Boys: [
    {
      id: "fb-1",
      teacherName: "Usman Jutt",
      className: "Grade 5",
      section: "A",
      classSection: "Grade 5 - A",
      from: "2026-06-20",
      to: "2026-06-27",
      desks: 1,
      benches: 0,
      chairs: 1,
      bulbs: 1,
      fans: 2,
      total: 5,
      desksTotal: 5,
      benchesTotal: 5,
      chairsTotal: 5,
      bulbsTotal: 5,
      fansTotal: 5,
      brokenDeskBenchChairs: "1 desk / 0 benches / 1 chair",
      more: "Need replacement for back-row benches.",
    },
    {
      id: "fb-2",
      teacherName: "Usman Raza",
      className: "Grade 6",
      section: "B",
      classSection: "Grade 6 - B",
      from: "2026-06-22",
      to: "2026-06-30",
      desks: 1,
      benches: 0,
      chairs: 1,
      bulbs: 1,
      fans: 2,
      total: 5,
      desksTotal: 5,
      benchesTotal: 5,
      chairsTotal: 5,
      bulbsTotal: 5,
      fansTotal: 5,
      brokenDeskBenchChairs: "1 desk / 1 chair",
      more: "All other fixtures are in working condition.",
    },
  ],
};

function SectionCard({ title, subtitle, badge, dark, children }) {
  return (
    <div className={`overflow-hidden ${dark ? darkCard : lightCard}`}>
      <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
        <div>
          <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{title}</h3>
          {subtitle ? <p className={`mt-1 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{subtitle}</p> : null}
        </div>
        {badge ? <div className="rounded-full bg-[#7c4dff]/10 px-3 py-1 text-xs font-semibold text-[#7c4dff]">{badge}</div> : null}
      </div>
      {children}
    </div>
  );
}

function DetailGrid({ dark, items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border px-4 py-3 ${dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-100 bg-slate-50"}`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            {item.label}
          </p>
          <p className={`mt-2 text-sm font-medium ${dark ? "text-white" : "text-slate-800"}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function SyllabusModalBody({ item, dark }) {
  const remainingAverage = Math.max(0, 100 - Number(item.overallCoverage || 0));
  const className = item.className || item.classSection?.split(" - ")?.[0] || "-";
  const section = item.section || item.classSection?.split(" - ")?.[1] || "-";

  return (
    <div className="space-y-5">
      <div
        className={`overflow-hidden rounded-[28px] border ${
          dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="grid gap-3 px-4 py-3.5 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${dark ? "text-[#9e9e9e]" : "text-indigo-600"}`}>
              Teachers Assign Syllabus
            </p>
            <h4 className={`mt-1.5 text-[22px] font-semibold leading-tight ${dark ? "text-white" : "text-slate-900"}`}>{item.teacherName || "-"}</h4>
            <p className={`mt-1 text-[14px] leading-5 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
              {className} - Section {section} | {formatDate(item.from)} to {formatDate(item.to)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div
              className={`flex min-h-[76px] flex-col justify-between rounded-2xl border px-3.5 py-2.5 ${
                dark ? "border-white/[0.08] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                Covered
              </p>
              <p className="text-[20px] font-semibold leading-none text-emerald-600">{item.overallCoverage}%</p>
            </div>
            <div
              className={`flex min-h-[76px] flex-col justify-between rounded-2xl border px-3.5 py-2.5 ${
                dark ? "border-white/[0.08] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                Remaining
              </p>
              <p className="text-[20px] font-semibold leading-none text-rose-600">{remainingAverage}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden rounded-[28px] border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
        <div
          className={`grid grid-cols-[1fr_3.15fr_0.42fr_0.58fr] items-center gap-0 border-b px-[18px] py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] ${
            dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span>Subjects</span>
          <span className="pl-3">Syllabus</span>
          <span className="pr-1 text-right">Covered %</span>
          <span className="pr-1 text-right">Remaining</span>
        </div>
        <div className="divide-y" style={{ divideColor: dark ? "rgba(255,255,255,0.06)" : "rgb(226 232 240)" }}>
          {item.books.map((book) => (
            <div
              key={book.bookName}
              className={`grid grid-cols-[1fr_3.15fr_0.42fr_0.58fr] items-center gap-0 px-[18px] py-3 text-sm ${
                dark ? "text-white" : "text-slate-700"
              }`}
            >
              <div className="pr-3.5">
                <p className="text-[16px] font-bold leading-5 md:text-[17px]">{book.bookName}</p>
              </div>
              <div className={`pr-4 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                <p className="whitespace-normal break-words text-[16px] font-medium leading-5 md:text-[17px]">{book.syllabus}</p>
                <div className={`mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium leading-5 ${dark ? "text-[#7f8197]" : "text-slate-400"}`}>
                  <span>
                    Chapters: <span className={dark ? "text-white" : "text-slate-700"}>{book.chapters || book.syllabus}</span>
                  </span>
                  <span className={dark ? "text-[#575b73]" : "text-slate-300"}>|</span>
                  <span>
                    Topics: <span className={dark ? "text-white" : "text-slate-700"}>{book.topics || book.more || "-"}</span>
                  </span>
                </div>
              </div>
              <span className="pr-1 text-right text-[16px] font-semibold leading-5 text-emerald-600">{book.coveredPercent}%</span>
              <span className="pr-1 text-right text-[16px] font-semibold leading-5 text-rose-600">{100 - Number(book.coveredPercent || 0)}%</span>
            </div>
          ))}
        </div>
      </div>
      {item.notes ? <p className={`text-[13px] leading-5 ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{item.notes}</p> : null}
    </div>
  );
}

function FurnitureModalBody({ item, dark }) {
  const desks = item.desks ?? 0;
  const benches = item.benches ?? 0;
  const chairs = item.chairs ?? 0;
  const bulbs = item.bulbs ?? 0;
  const fans = item.fans ?? 0;
  const brokenTotal = desks + benches + chairs + bulbs + fans;
  const total = item.total ?? desks + benches + chairs + bulbs + fans;
  const renderRatio = (broken, fullTotal) => (
    <span>
      <span className="text-rose-600">{formatCount(broken)}</span>
      <span className={dark ? "text-[#9e9e9e]" : "text-slate-300"}> / </span>
      <span className="text-emerald-600">{formatCount(fullTotal)}</span>
    </span>
  );
  const separatorClass = dark
    ? "relative flex items-center justify-center px-4 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-white/[0.12]"
    : "relative flex items-center justify-center px-4 before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-slate-300";

  return (
    <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
      <div
        className={`grid gap-3 border-b px-5 py-4 md:grid-cols-[1.1fr_0.9fr] ${
          dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-100 bg-white"
        }`}
      >
        <div>
          <p className={`text-[12px] font-semibold uppercase tracking-[0.22em] ${dark ? "text-[#9e9e9e]" : "text-indigo-600"}`}>
            Furniture Status
          </p>
          <h4 className={`mt-1.5 text-[32px] font-semibold leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
            {item.teacherName || "-"}
          </h4>
          <p className={`mt-1 whitespace-nowrap text-[16px] leading-6 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
            {item.classSection || "-"} | {formatDate(item.from)} to {formatDate(item.to)}
          </p>
        </div>
        <div className="flex items-start justify-end gap-3">
          <div
            className={`min-w-[92px] rounded-2xl border px-4 py-3 text-center ${
              dark ? "border-[#ff4d6d]/20 bg-[#ff4d6d]/10" : "border-rose-200 bg-rose-50"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#9e9e9e]" : "text-rose-500"}`}>
              Broken
            </p>
            <p className={`mt-1 text-[28px] font-semibold leading-none ${dark ? "text-white" : "text-slate-900"}`}>
              {formatCount(brokenTotal)}
            </p>
          </div>
          <div
            className={`min-w-[92px] rounded-2xl border px-4 py-3 text-center ${
              dark ? "border-emerald-400/20 bg-emerald-400/10" : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#9e9e9e]" : "text-emerald-600"}`}>
              Total
            </p>
            <p className={`mt-1 text-[28px] font-semibold leading-none ${dark ? "text-white" : "text-emerald-600"}`}>
              {formatCount(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className={`grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)] gap-0 border-b px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.16em] ${
            dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          <span className="text-center">Teacher Name</span>
          <span className={separatorClass}>Class/Section</span>
          <span className={separatorClass}>Date</span>
          <span className={separatorClass}>Desks</span>
          <span className={separatorClass}>Benches</span>
          <span className={separatorClass}>Chairs</span>
          <span className={separatorClass}>Bulbs</span>
          <span className={separatorClass}>Fans</span>
          <span className={separatorClass}>Total</span>
        </div>
        <div
          className={`grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.58fr)_minmax(0,0.58fr)_minmax(0,0.58fr)_minmax(0,0.58fr)_minmax(0,0.58fr)_minmax(0,0.58fr)] gap-0 px-5 py-5 text-base ${
            dark ? "text-white" : "text-slate-700"
          }`}
        >
          <span className="text-center text-[20px] font-semibold leading-tight md:text-[22px]">{item.teacherName || "-"}</span>
          <span className={`${separatorClass} ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{item.classSection || "-"}</span>
          <span className={`${separatorClass} whitespace-nowrap text-sm md:text-[15px] ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
            {item.dateRange || `${formatDate(item.from)} to ${formatDate(item.to)}`}
          </span>
          <span className={`${separatorClass} text-lg font-semibold`}>{renderRatio(desks, item.desksTotal ?? total)}</span>
          <span className={`${separatorClass} text-lg font-semibold`}>{renderRatio(benches, item.benchesTotal ?? total)}</span>
          <span className={`${separatorClass} text-lg font-semibold`}>{renderRatio(chairs, item.chairsTotal ?? total)}</span>
          <span className={`${separatorClass} text-lg font-semibold`}>{renderRatio(bulbs, item.bulbsTotal ?? total)}</span>
          <span className={`${separatorClass} text-lg font-semibold`}>{renderRatio(fans, item.fansTotal ?? total)}</span>
          <span className={`${separatorClass} text-lg font-semibold text-emerald-600`}>{formatCount(total)}</span>
        </div>
      </div>
    </div>
  );
}

function SectionTable({ dark, rows, onOpen, variant = "default" }) {
  if (!rows.length) {
    return (
      <div className={`px-5 py-10 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
        No records found for the selected filters.
      </div>
    );
  }

  const isFurniture = variant === "furniture";

  return (
    <div className="divide-y" style={{ divideColor: dark ? "rgba(255,255,255,0.06)" : "rgb(226 232 240)" }}>
      {rows.map((row) => (
        <button
          key={row.id}
          type="button"
          onClick={() => onOpen(row)}
          className={`grid w-full gap-3 px-5 py-4 text-left transition ${
            dark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"
          }`}
          style={
            isFurniture
              ? { gridTemplateColumns: "1.15fr 0.95fr 1fr 1.05fr 0.35fr" }
              : { gridTemplateColumns: "1.2fr 1fr 0.9fr 0.35fr" }
          }
        >
          <div>
            <p className={`text-base font-semibold md:text-[18px] ${dark ? "text-white" : "text-slate-800"}`}>{row.teacherName}</p>
            <p className={`mt-1 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{row.classSection}</p>
          </div>
          {isFurniture ? (
            <div className={`whitespace-nowrap text-sm md:text-[15px] ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.dateRange}</div>
          ) : (
            <div className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.subtitle}</div>
          )}
          {isFurniture ? (
            <>
              <div className={`text-right text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.subtitle}</div>
              <div className={`text-right text-sm font-medium ${dark ? "text-white" : "text-slate-700"}`}>{row.metric}</div>
            </>
          ) : row.covered && row.remaining ? (
            <div className="flex items-center justify-end gap-3 text-sm">
              <span className="font-semibold text-emerald-600">{row.covered}</span>
              <span className={dark ? "text-[#9e9e9e]" : "text-slate-300"}>/</span>
              <span className="font-semibold text-rose-600">{row.remaining}</span>
            </div>
          ) : (
            <div className={`text-right text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{row.metric}</div>
          )}
          <div className="flex items-center justify-end">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                dark
                  ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.06] hover:text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function downloadCsv(filename, rows) {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    if (/[,"\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 15.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildSyllabusExportRows(item) {
  const className = item.className || item.classSection?.split(" - ")?.[0] || "-";
  const section = item.section || item.classSection?.split(" - ")?.[1] || "-";
  const fromDate = formatDate(item.from);
  const toDate = formatDate(item.to);

  return [
    ["Teacher Name", "Class", "Section", "From Date", "To Date", "Subject", "Syllabus", "Chapters", "Topics", "Covered %", "Remaining %"],
    ...item.books.map((book) => [
      item.teacherName || "-",
      className,
      section,
      fromDate,
      toDate,
      book.bookName,
      book.syllabus,
      book.chapters || book.syllabus,
      book.topics || book.more || "-",
      `${book.coveredPercent}%`,
      `${100 - Number(book.coveredPercent || 0)}%`,
    ]),
  ];
}

function buildFurnitureExportRows(item) {
  const className = item.className || item.classSection?.split(" - ")?.[0] || "-";
  const section = item.section || item.classSection?.split(" - ")?.[1] || "-";

  return [
    ["Teacher Name", "Class", "Section", "From Date", "To Date", "Furniture Status", "Bulbs", "Fans", "More"],
    [
      item.teacherName || "-",
      className,
      section,
      formatDate(item.from),
      formatDate(item.to),
      item.brokenDeskBenchChairs || "-",
      item.bulbs ?? 0,
      item.fans ?? 0,
      item.more || "-",
    ],
  ];
}

export default function RoleDashboard({ role, onNavigate, dark = false, branchSection = "Boys" }) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [syllabusFromDate, setSyllabusFromDate] = useState("2026-06-26");
  const [syllabusToDate, setSyllabusToDate] = useState("2026-06-26");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [furnitureFromDate, setFurnitureFromDate] = useState("2026-06-26");
  const [furnitureToDate, setFurnitureToDate] = useState("2026-06-26");
  const [selectedFurnitureClass, setSelectedFurnitureClass] = useState("");
  const [selectedFurnitureSection, setSelectedFurnitureSection] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/teacher";
        const response = await api.get(endpoint);
        setData(response.data?.data || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isSuperAdmin]);

  const selectedBranch = branchKey(branchSection);
  const branchSyllabus = useMemo(() => {
    return syllabusData[selectedBranch].filter((item) => {
      const inDateRange =
        (!syllabusFromDate || item.to >= syllabusFromDate) && (!syllabusToDate || item.from <= syllabusToDate);
      const matchesClass = !selectedClass || item.className === selectedClass;
      const matchesSection = !selectedSection || item.section === selectedSection;
      return inDateRange && matchesClass && matchesSection;
    });
  }, [selectedBranch, syllabusFromDate, syllabusToDate, selectedClass, selectedSection]);
  const branchFurniture = useMemo(() => {
    return furnitureData[selectedBranch].filter((item) => {
      const inDateRange =
        (!furnitureFromDate || item.to >= furnitureFromDate) && (!furnitureToDate || item.from <= furnitureToDate);
      const matchesClass = !selectedFurnitureClass || item.className === selectedFurnitureClass;
      const matchesSection = !selectedFurnitureSection || item.section === selectedFurnitureSection;
      return inDateRange && matchesClass && matchesSection;
    });
  }, [selectedBranch, furnitureFromDate, furnitureToDate, selectedFurnitureClass, selectedFurnitureSection]);
  const syllabusExportRows = useMemo(() => {
    const rows = [
      ["Teacher Name", "Class", "Section", "From Date", "To Date", "Subjects", "Syllabus", "Covered %", "Remaining %"],
    ];
    branchSyllabus.forEach((item) => {
      item.books.forEach((book) => {
        rows.push([
          item.teacherName,
          item.className,
          item.section,
          formatDate(item.from),
          formatDate(item.to),
          book.bookName,
          book.syllabus,
          `${book.coveredPercent}%`,
          `${100 - Number(book.coveredPercent || 0)}%`,
        ]);
      });
    });
    return rows;
  }, [branchSyllabus]);

  if (loading) return <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading dashboard...</p>;
  if (error) return <p className="text-sm text-rose-500">{error}</p>;

  if (!isSuperAdmin) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h2>
          <p className="text-sm text-slate-500">Your classroom overview.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Assigned Classes" value={data.cards?.assignedClasses ?? 0} tone="blue" icon={IconClasses} />
          <StatCard title="Today's Attendance" value={data.cards?.todaysAttendance ?? 0} tone="green" icon={IconClock} />
          <StatCard title="Total Students" value={data.cards?.totalStudents ?? 0} tone="purple" icon={IconStudents} />
          <StatCard title="Pending Tasks" value={data.cards?.pendingTasks ?? 0} tone="orange" icon={IconTasks} />
        </div>
      </section>
    );
  }

  const cards = data.cards || {};

  const teacherStats = [
    { label: "Total Teachers", value: cards.totalTeachers ?? 0, tone: "purple", icon: IconTeachers },
    { label: "Present Teachers", value: cards.presentTeachers ?? 0, tone: "green", icon: IconPresent },
    { label: "Absent Teachers", value: cards.absentTeachers ?? 0, tone: "rose", icon: IconAbsent },
  ];

  const studentStats = [
    { label: "Total Students", value: cards.totalStudents ?? 0, tone: "green", icon: IconStudents },
    { label: "Present Students", value: cards.presentStudents ?? 0, tone: "green", icon: IconPresent },
    { label: "Absent Students", value: cards.absentStudents ?? 0, tone: "rose", icon: IconAbsent },
  ];

  const otherStats = [
    { label: "Pending Fees", value: `Rs. ${(cards.pendingFees ?? 0).toLocaleString()}`, tone: "orange", icon: IconFee },
    { label: "Attendance %", value: `${cards.attendancePercentage ?? 0}%`, tone: "purple", icon: IconAttendance },
    { label: "Total On Leave", value: cards.totalOnLeave ?? 0, tone: "orange", icon: IconLeave },
  ];

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <StatsColumnBoard title="Teacher Stats" items={teacherStats} dark={dark} />
        <StatsColumnBoard title="Student Stats" items={studentStats} dark={dark} />
        <StatsColumnBoard title="Other Stats" items={otherStats} dark={dark} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className={`overflow-hidden ${dark ? darkCard : lightCard}`}>
          <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className="min-w-0">
              <h3 className={`text-base font-semibold md:text-[18px] ${dark ? "text-white" : "text-slate-800"}`}>
                Teachers Assign Syllabus
              </h3>
            </div>
            <div className="rounded-full bg-[#7c4dff]/10 px-3 py-1 text-xs font-semibold text-[#7c4dff]">
              {branchSyllabus.length} teachers
            </div>
          </div>

          <div className={`grid gap-4 border-b px-5 py-4 md:grid-cols-2 xl:grid-cols-4 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <ModernDatePicker
              label="From date"
              value={syllabusFromDate}
              onChange={setSyllabusFromDate}
              dark={dark}
              placeholder="Select from date"
            />
            <ModernDatePicker
              label="To date"
              value={syllabusToDate}
              onChange={setSyllabusToDate}
              dark={dark}
              placeholder="Select to date"
            />
            <ScrollableSelect
              label="Class"
              placeholder="Select All Classes"
              value={selectedClass}
              onChange={setSelectedClass}
              options={allClassOptions}
              dark={dark}
              openUpward
            />
            <ScrollableSelect
              label="Section"
              placeholder="Select All Sections"
              value={selectedSection}
              onChange={setSelectedSection}
              options={allSectionOptions}
              dark={dark}
              openUpward
            />
          </div>

          <div className="px-5 py-3">
            <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
              Selected: {formatDate(syllabusFromDate)} to {formatDate(syllabusToDate)} | {selectedClass || "All Classes"} |{" "}
              {selectedSection ? `Section ${selectedSection}` : "All Sections"}
            </p>
          </div>

          <SectionTable
            dark={dark}
            rows={branchSyllabus.map((item) => ({
              ...item,
              subtitle: `${formatDate(item.from)} to ${formatDate(item.to)}`,
              covered: `${item.overallCoverage}%`,
              remaining: `${Math.max(0, 100 - Number(item.overallCoverage || 0))}%`,
            }))}
            onOpen={(item) => setActiveModal({ type: "syllabus", item })}
          />
        </div>

        <SectionCard
          title={`${selectedBranch} Branch Furniture`}
          subtitle="Broken desks, benches, chairs, bulbs and fans"
          badge={`${branchFurniture.length} rows`}
          dark={dark}
        >
          <div className={`grid gap-4 border-b px-5 py-4 md:grid-cols-2 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <ScrollableSelect
              label="Class"
              placeholder="Select All Classes"
              value={selectedFurnitureClass}
              onChange={setSelectedFurnitureClass}
              options={allClassOptions}
              dark={dark}
              openUpward
            />
            <ScrollableSelect
              label="Section"
              placeholder="Select All Sections"
              value={selectedFurnitureSection}
              onChange={setSelectedFurnitureSection}
              options={allSectionOptions}
              dark={dark}
              openUpward
            />
          </div>

          <div className="px-5 py-3">
            <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
              Selected: {selectedFurnitureClass || "All Classes"} |{" "}
              {selectedFurnitureSection ? `Section ${selectedFurnitureSection}` : "All Sections"}
            </p>
          </div>

          <SectionTable
            dark={dark}
            rows={branchFurniture.map((item) => ({
              ...item,
              subtitle: item.brokenDeskBenchChairs,
              dateRange: `${formatDate(item.from)} to ${formatDate(item.to)}`,
              metric: `${item.bulbs} bulbs / ${item.fans} fans`,
            }))}
            variant="furniture"
            onOpen={(item) => setActiveModal({ type: "furniture", item })}
          />
        </SectionCard>
      </div>

      <FormModal
        open={Boolean(activeModal)}
        title={
          activeModal?.type === "syllabus"
            ? "Teachers Assign Syllabus"
            : activeModal?.type === "furniture"
              ? `${selectedBranch} Branch Furniture`
              : ""
        }
        subtitle={
          activeModal?.type === "syllabus"
            ? `${formatDate(activeModal.item?.from)} to ${formatDate(activeModal.item?.to)}`
            : ""
        }
        onClose={() => setActiveModal(null)}
        extraWide
        dark={dark}
        scrollBody
        headerActions={
          activeModal?.type === "syllabus" ? (
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `syllabus-${String(activeModal.item?.teacherName || "teacher").toLowerCase().replace(/\s+/g, "-")}-${String(
                    activeModal.item?.classSection || "class-section"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${activeModal.item?.from || "from"}-${activeModal.item?.to || "to"}.csv`,
                  buildSyllabusExportRows(activeModal.item || {})
                )
              }
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                dark
                  ? "border-[#7c4dff]/30 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/15"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
              title="Export syllabus"
              aria-label="Export syllabus"
            >
              <IconDownload />
            </button>
          ) : activeModal?.type === "furniture" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    `furniture-${String(activeModal.item?.teacherName || "teacher").toLowerCase().replace(/\s+/g, "-")}-${String(
                      activeModal.item?.classSection || "class-section"
                    )
                      .toLowerCase()
                      .replace(/\s+/g, "-")}-${activeModal.item?.from || "from"}-${activeModal.item?.to || "to"}.csv`,
                    buildFurnitureExportRows(activeModal.item || {})
                  )
                }
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  dark
                    ? "border-[#7c4dff]/30 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/15"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
                title="Export furniture"
                aria-label="Export furniture"
              >
                <IconDownload />
              </button>
            </div>
          ) : null
        }
      >
        {activeModal?.type === "syllabus" ? (
          <div className="flex-1 overflow-hidden">
            <SyllabusModalBody item={activeModal.item} dark={dark} />
          </div>
        ) : null}
        {activeModal?.type === "furniture" ? (
          <div className="flex-1 overflow-hidden">
            <FurnitureModalBody item={activeModal.item} dark={dark} />
          </div>
        ) : null}
      </FormModal>
    </section>
  );
}

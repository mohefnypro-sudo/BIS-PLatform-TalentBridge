import type { Role } from "@prisma/client";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "TalentBridge";

export const TRACK_OPTIONS = [
  "Frontend Engineering",
  "Backend Engineering",
  "AI / Machine Learning",
  "Data Engineering",
  "DevOps / Cloud",
  "Mobile Development",
  "Cybersecurity",
  "Product Management",
  "UI/UX Design",
  "QA / Testing",
] as const;

export const DOMAIN_OPTIONS = [
  "Software Engineering",
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "IoT & Embedded",
  "Bioinformatics",
  "Business Intelligence",
  "Mobile Applications",
  "Web Applications",
  "Cloud & DevOps",
  "Robotics",
  "Fintech",
  "EdTech",
  "HealthTech",
] as const;

export const SESSION_LENGTHS = [15, 30, 60] as const;

export const SESSION_TYPES = [
  "CAREER_GUIDANCE",
  "TECHNICAL_REVIEW",
  "PROJECT_MENTORING",
  "RESUME_REVIEW",
  "INTERVIEW_PREP",
  "OTHER",
] as const;

export const ACADEMIC_LEVELS = [
  { value: "FRESHMAN", label: "1st Year — Freshman" },
  { value: "SOPHOMORE", label: "2nd Year — Sophomore" },
  { value: "JUNIOR", label: "3rd Year — Junior" },
  { value: "SENIOR", label: "4th Year — Senior" },
  { value: "GRADUATE", label: "Alumnus — Graduated" },
] as const;

export const TIER_META = {
  GROWTH: {
    label: "Growth Tier",
    description: "Years 1–2 · Career orientation & track development",
  },
  PROFESSIONAL: {
    label: "Professional Tier",
    description: "Years 3–4 · Portfolio showcase & career placement",
  },
} as const;

export const LEVEL_TO_TIER = {
  FRESHMAN: "GROWTH",
  SOPHOMORE: "GROWTH",
  JUNIOR: "PROFESSIONAL",
  SENIOR: "PROFESSIONAL",
  GRADUATE: "PROFESSIONAL",
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Student",
  MENTOR: "Mentor",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
};

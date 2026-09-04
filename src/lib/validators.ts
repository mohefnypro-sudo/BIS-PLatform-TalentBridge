import { z } from "zod";

export const idSchema = z.string().min(1);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(["STUDENT", "MENTOR", "RECRUITER"]).default("STUDENT"),
  isFree: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const studentProfileSchema = z.object({
  level: z.enum(["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR", "GRADUATE"]).optional(),
  headline: z.string().max(120).optional().nullable(),
  careerTrackId: z.string().max(40).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  graduationYear: z.number().int().min(2015).max(2040).optional().nullable(),
  gpa: z.number().min(0).max(4).optional().nullable(),
  resumeUrl: z.string().max(500).optional().nullable(),
  resumeName: z.string().max(200).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  github: z.string().max(300).optional().nullable(),
  linkedin: z.string().max(300).optional().nullable(),
  twitter: z.string().max(300).optional().nullable(),
  preferredTags: z.array(z.string().max(40)).max(20).optional(),
  featuredSkills: z.array(z.string().max(40)).max(30).optional(),
  showcase: z.boolean().optional(),
});

export const mentorProfileSchema = z.object({
  headline: z.string().max(120).optional().nullable(),
  bio: z.string().max(3000).optional().nullable(),
  domains: z.array(z.string().max(50)).max(12).optional(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
  isFree: z.boolean().optional(),
  hourlyRate: z.number().min(0).max(5000).optional().nullable(),
  sessionLengths: z.array(z.number().int().min(5).max(120)).min(1).max(5).optional(),
  videoLinkPreference: z.enum(["google_meet", "zoom", "other"]).optional().nullable(),
  maxBookingsPerDay: z.number().int().min(1).max(20).optional(),
});

export const milestoneSchema = z.object({
  trackId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional().nullable(),
  resourceUrl: z.string().max(500).optional().nullable(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(2).max(120),
  company: z.string().min(2).max(120),
  companyLogo: z.string().max(500).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().optional(),
  description: z.string().max(3000).optional().nullable(),
  skills: z.array(z.string().max(40)).max(20).optional(),
});

export const certificationSchema = z.object({
  name: z.string().min(2).max(200),
  issuer: z.string().min(2).max(200),
  url: z.string().max(500).optional().nullable(),
  issuedAt: z.coerce.date().optional().nullable(),
  verifyId: z.string().max(120).optional().nullable(),
});

export const projectSchema = z.object({
  title: z.string().min(3).max(160),
  abstract: z.string().min(20).max(2000),
  about: z.string().max(10000).optional().nullable(),
  domain: z.string().max(80).optional(),
  techStack: z.array(z.string().max(40)).max(30).optional(),
  academicYear: z.string().max(30).optional(),
  imageGallery: z.array(z.string().max(500)).max(12).optional(),
  coverImage: z.string().max(500).optional().nullable(),
  videoDemoUrl: z.string().max(500).optional().nullable(),
  liveDemoUrl: z.string().max(500).optional().nullable(),
  githubRepoUrl: z.string().max(500).optional().nullable(),
  docsPdfUrl: z.string().max(500).optional().nullable(),
  advisorName: z.string().max(120).optional().nullable(),
  members: z.array(z.object({ studentId: z.string().min(1), roleInProject: z.string().max(80).optional(), isLead: z.boolean().optional() })).max(12).optional(),
});

export const slotSchema = z.object({
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});

export const bookingSchema = z.object({
  mentorProfileId: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  sessionType: z.enum(["CAREER_GUIDANCE", "TECHNICAL_REVIEW", "PROJECT_MENTORING", "RESUME_REVIEW", "INTERVIEW_PREP", "OTHER"]),
  sessionLength: z.number().int().min(5).max(120),
  preSessionQuestions: z.string().max(3000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "CANCELLED", "DECLINED"]),
  meetingLink: z.string().max(500).optional().nullable(),
  mentorNotes: z.string().max(3000).optional().nullable(),
  studentFeedback: z.string().max(3000).optional().nullable(),
  studentRating: z.number().int().min(1).max(5).optional().nullable(),
});

export const jobSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(30).max(12000),
  companyName: z.string().min(2).max(160),
  companyLogo: z.string().max(500).optional().nullable(),
  companyWebsite: z.string().max(300).optional().nullable(),
  locationType: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  location: z.string().max(160).optional().nullable(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "TRAINING", "CONTRACT"]),
  trackId: z.string().max(40).optional().nullable(),
  requirements: z.array(z.string().max(500)).max(30).optional(),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  currency: z.string().max(10).optional(),
  isPaid: z.boolean().optional(),
  applicationDeadline: z.coerce.date().optional().nullable(),
  isTraining: z.boolean().optional(),
  skills: z.array(z.string().max(40)).max(30).optional(),
});

export const jobStatusSchema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "ARCHIVED"]),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "INTERVIEW", "ACCEPTED", "REJECTED"]),
  recruiterNotes: z.string().max(3000).optional().nullable(),
});

export const applySchema = z.object({
  coverLetter: z.string().max(5000).optional().nullable(),
});

export const trackSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  skills: z.array(z.string().max(40)).max(40).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const verifyUserSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]),
});

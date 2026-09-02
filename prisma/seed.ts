import { PrismaClient, type Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const TRACKS = [
  {
    name: "Frontend Engineering",
    slug: "frontend-engineering",
    color: "#6366f1",
    icon: "LayoutTemplate",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Accessibility"],
  },
  {
    name: "Backend Engineering",
    slug: "backend-engineering",
    color: "#10b981",
    icon: "Server",
    skills: ["Node.js", "PostgreSQL", "Prisma", "REST APIs", "Redis"],
  },
  {
    name: "AI / Machine Learning",
    slug: "ai-machine-learning",
    color: "#f59e0b",
    icon: "BrainCircuit",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Computer Vision"],
  },
  {
    name: "Data Engineering",
    slug: "data-engineering",
    color: "#06b6d4",
    icon: "Database",
    skills: ["Python", "SQL", "Airflow", "Spark", "dbt"],
  },
  {
    name: "DevOps / Cloud",
    slug: "devops-cloud",
    color: "#8b5cf6",
    icon: "Cloud",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    color: "#f43f5e",
    icon: "Smartphone",
    skills: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase"],
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    color: "#22c55e",
    icon: "Shield",
    skills: ["Penetration Testing", "Network Security", "Cryptography", "SOC"],
  },
  {
    name: "Product Management",
    slug: "product-management",
    color: "#eab308",
    icon: "Rocket",
    skills: ["Roadmapping", "Agile", "Analytics", "User Research", "Prioritization"],
  },
  {
    name: "UI/UX Design",
    slug: "ui-ux-design",
    color: "#ec4899",
    icon: "Palette",
    skills: ["Figma", "Design Systems", "Prototyping", "Usability Testing"],
  },
  {
    name: "QA / Testing",
    slug: "qa-testing",
    color: "#14b8a6",
    icon: "Bug",
    skills: ["Test Automation", "Cypress", "Playwright", "CI Pipelines", "Test Planning"],
  },
];

const PROJECTS = [
  {
    title: "Smart Campus AI Assistant",
    slug: "smart-campus-ai-assistant",
    domain: "Artificial Intelligence",
    techStack: ["Python", "FastAPI", "Next.js", "PostgreSQL", "OpenAI"],
    abstract:
      "A campus-wide AI assistant that answers administrative questions, schedules advising sessions and keeps students on track with their graduation requirements.",
    about:
      "Built a RAG-based assistant over the university's academic catalogs. Includes an approval workflow, conversation logging and a student-facing chat UI. Improved query resolution time from days to seconds.",
    academicYear: "2025/2026",
    isFeatured: true,
    rating: 4.7,
    advisorName: "Prof. Nadia Hassan",
  },
  {
    title: "MedTrack — Patient Flow Optimizer",
    slug: "medtrack-patient-flow-optimizer",
    domain: "HealthTech",
    techStack: ["Flutter", "Node.js", "MongoDB", "Firebase", "ML"],
    abstract:
      "A clinic management platform that predicts wait times and optimizes patient scheduling using queuing models and machine learning.",
    about:
      "Implemented an ML-based wait-time predictor, a real-time dashboard for receptionists, and a mobile app for patients with smart reminders. Reduced average wait times by 28% in pilot clinics.",
    academicYear: "2025/2026",
    isFeatured: false,
    rating: 4.4,
    advisorName: "Dr. Omar Selim",
  },
  {
    title: "Blockchain E-Voting System",
    slug: "blockchain-e-voting-system",
    domain: "Cybersecurity",
    techStack: ["Solidity", "Hardhat", "React", "Ethereum", "IPFS"],
    abstract:
      "A tamper-evident electronic voting system built on a permissioned blockchain with verifiable ballots and live audit trails.",
    about:
      "Designed smart contracts for ballot casting and tallying, an IPFS-backed evidence store, and a voter-facing React app with end-to-end verification.",
    academicYear: "2024/2025",
    isFeatured: false,
    rating: 4.1,
    advisorName: "Dr. Hany Fawzy",
  },
  {
    title: "AgriSense — IoT Farm Monitoring",
    slug: "agrisense-iot-farm-monitoring",
    domain: "IoT & Embedded",
    techStack: ["Arduino", "Raspberry Pi", "MongoDB", "React", "MQTT"],
    abstract:
      "An IoT platform that monitors soil moisture, temperature and humidity, and autonomously triggers irrigation to conserve water.",
    about:
      "Built sensor nodes with low-power microcontrollers, a Raspberry Pi gateway, an MQTT pipeline, and a React dashboard with alerting. Reduced water usage by 32% in field trials.",
    academicYear: "2024/2025",
    isFeatured: true,
    rating: 4.6,
    advisorName: "Prof. Layla Rashid",
  },
];

async function upsertUser(
  email: string,
  name: string,
  password: string,
  role: Role,
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED",
) {
  const passwordHash = await hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: { role, status },
    create: { email, name, passwordHash, role, status, verifiedAt: status === "ACTIVE" ? new Date() : null },
  });
}

async function main() {
  console.log("🌱 Seeding TalentBridge...");

  // 1. Career tracks
  const trackMap = new Map<string, { id: string; name: string; color: string | null; skills: string[] }>();
  for (const [i, t] of TRACKS.entries()) {
    const track = await prisma.careerTrack.upsert({
      where: { slug: t.slug },
      update: { name: t.name, color: t.color, icon: t.icon, skills: t.skills, order: i, isActive: true },
      create: { name: t.name, slug: t.slug, color: t.color, icon: t.icon, skills: t.skills, description: `${t.name} roadmap`, order: i },
    });
    trackMap.set(t.slug, track);
  }
  console.log(`✓ ${trackMap.size} career tracks`);

  // 2. Users
  const admin = await upsertUser("admin@talentbridge.io", "Platform Admin", "Admin@1234", "ADMIN", "ACTIVE");
  const mentorUser = await upsertUser("mentor@talentbridge.io", "Dr. Sara Khaled", "Mentor@1234", "MENTOR", "ACTIVE");
  const recruiterUser = await upsertUser("hr@nexatech.io", "NexaTech HR", "Recruit@1234", "RECRUITER", "ACTIVE");
  const studentUser = await upsertUser("student@talentbridge.io", "Ahmed Mansour", "Student@1234", "STUDENT", "ACTIVE");
  const studentUser2 = await upsertUser("salma@talentbridge.io", "Salma Youssef", "Student@1234", "STUDENT", "ACTIVE");
  console.log("✓ Users (admin, mentor, recruiter, 2 students)");

  // 3. Student profiles
  const aiTrack = trackMap.get("ai-machine-learning")!;
  const backendTrack = trackMap.get("backend-engineering")!;

  const student = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      level: "JUNIOR",
      tier: "PROFESSIONAL",
      headline: "Backend Engineer in training · AWS certified",
      careerTrackId: backendTrack.id,
      bio: "Full-stack student focused on scalable backend systems. Passionate about clean architecture and DevOps.",
      city: "Cairo",
      graduationYear: 2026,
      gpa: 3.6,
      github: "https://github.com/ahmedmansour",
      linkedin: "https://linkedin.com/in/ahmedmansour",
      showcase: true,
      featuredSkills: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "Prisma", "REST APIs"],
      preferredTags: ["backend", "internship", "devops"],
    },
  });

  const student2 = await prisma.studentProfile.upsert({
    where: { userId: studentUser2.id },
    update: {},
    create: {
      userId: studentUser2.id,
      level: "SENIOR",
      tier: "PROFESSIONAL",
      headline: "AI/ML enthusiast building applied models",
      careerTrackId: aiTrack.id,
      bio: "ML student who loves turning data into products. Experience with NLP and computer vision projects.",
      city: "Alexandria",
      graduationYear: 2025,
      gpa: 3.8,
      showcase: true,
      featuredSkills: ["Python", "PyTorch", "TensorFlow", "NLP", "Computer Vision"],
      preferredTags: ["ai", "ml", "data-science"],
    },
  });

  // 4. Milestones
  await prisma.studentMilestone.deleteMany({ where: { studentId: student.id } });
  const milestones = [
    { title: "Complete Node.js & Express foundations", status: "COMPLETED" as const, progress: 100 },
    { title: "Build a REST API with Prisma & PostgreSQL", status: "COMPLETED" as const, progress: 100 },
    { title: "Containerize services with Docker", status: "IN_PROGRESS" as const, progress: 45 },
    { title: "Deploy a full stack app to AWS", status: "PLANNED" as const, progress: 0 },
  ];
  await prisma.studentMilestone.createMany({
    data: milestones.map((m) => ({
      studentId: student.id,
      trackId: backendTrack.id,
      title: m.title,
      status: m.status,
      progress: m.progress,
    })),
  });
  console.log("✓ Student milestones");

  // 5. Certifications + experience
  await prisma.certification.createMany({
    data: [
      { studentId: student.id, name: "AWS Certified Cloud Practitioner", issuer: "Amazon", issuedAt: new Date("2025-02-10"), verifyId: "AWS-10482" },
      { studentId: student.id, name: "PostgreSQL Certification", issuer: "EDB", issuedAt: new Date("2024-11-01") },
    ],
    skipDuplicates: true,
  });
  await prisma.experience.createMany({
    data: [
      {
        studentId: student.id,
        title: "Backend Developer Intern",
        company: "NexaTech",
        startDate: new Date("2025-06-01"),
        current: true,
        description: "Building internal tooling and REST APIs for the fintech product team.",
        skills: ["Node.js", "TypeScript", "PostgreSQL"],
      },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Certifications & experience");

  // 6. Graduation projects (approved, with members)
  const projectIds: string[] = [];
  for (const p of PROJECTS) {
    const project = await prisma.graduationProject.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        abstract: p.abstract,
        about: p.about,
        domain: p.domain,
        techStack: p.techStack,
        academicYear: p.academicYear,
        rating: p.rating,
        isFeatured: p.isFeatured,
        advisorName: p.advisorName,
        status: "APPROVED",
        visibility: "PUBLIC",
        ownerId: student.id,
        members: {
          create: [
            { studentId: student.id, roleInProject: "Team Lead", isLead: true },
            { studentId: student2.id, roleInProject: "ML Engineer", isLead: false },
          ],
        },
      },
    });
    projectIds.push(project.id);
  }
  console.log(`✓ ${projectIds.length} approved graduation projects`);

  // 7. Mentor profile + availability slots
  const mentor = await prisma.mentorProfile.upsert({
    where: { userId: mentorUser.id },
    update: {},
    create: {
      userId: mentorUser.id,
      headline: "Senior ML Engineer · 9 years at FAANG & fintech",
      bio: "I help students master machine learning, ace technical interviews and build impressive portfolios.",
      domains: ["AI & Machine Learning", "Data Science", "Python"],
      yearsOfExperience: 9,
      isFree: false,
      hourlyRate: 40,
      sessionLengths: [15, 30, 60],
      maxBookingsPerDay: 6,
      isVerified: true,
      totalSessions: 42,
      avgRating: 4.8,
    },
  });

  // open slots across the next 14 days
  const existingSlots = await prisma.availabilitySlot.count({ where: { mentorProfileId: mentor.id } });
  if (existingSlots === 0) {
    let day = 1;
    for (let offset = 1; offset <= 14; offset++) {
      const date = new Date(Date.now() + offset * 86400000);
      if (date.getDay() === 5 || date.getDay() === 6) continue;
      const starts = new Date(date);
      starts.setHours(day === 1 ? 10 : 15, 0, 0, 0);
      const ends = new Date(starts.getTime() + 60 * 60000);
      await prisma.availabilitySlot.create({ data: { mentorProfileId: mentor.id, startsAt: starts, endsAt: ends } });
      day++;
    }
  }
  console.log("✓ Mentor profile + open slots");

  // 8. Jobs
  const jobs = [
    {
      title: "Junior Backend Developer (Internship)",
      slug: "junior-backend-developer",
      companyName: "NexaTech",
      employmentType: "INTERNSHIP" as const,
      locationType: "HYBRID" as const,
      location: "Cairo, Egypt",
      isPaid: true,
      salaryMin: 15000,
      salaryMax: 20000,
      currency: "EGP",
      isTraining: false,
      trackSlug: "backend-engineering",
      description:
        "Join our fintech platform team. You'll build and maintain REST APIs, work with PostgreSQL and Prisma, and collaborate with frontend engineers on new features.",
      requirements: [
        "Currently enrolled in a CS or related degree",
        "Strong JavaScript/TypeScript fundamentals",
        "Familiarity with Node.js and SQL",
        "Eagerness to learn and work in a team",
      ],
      skills: ["Node.js", "TypeScript", "PostgreSQL", "Prisma", "REST APIs"],
    },
    {
      title: "AI/ML Research Assistant",
      slug: "ai-ml-research-assistant",
      companyName: "DataSphere Labs",
      employmentType: "PART_TIME" as const,
      locationType: "REMOTE" as const,
      isPaid: true,
      salaryMin: 25,
      salaryMax: 35,
      currency: "USD",
      isTraining: false,
      trackSlug: "ai-machine-learning",
      description:
        "Support our research team on NLP projects. You'll clean datasets, build and evaluate models, and document findings for publication.",
      requirements: [
        "Python proficiency",
        "Experience with PyTorch or TensorFlow",
        "Basic understanding of NLP concepts",
        "Strong written communication",
      ],
      skills: ["Python", "PyTorch", "NLP", "Data Cleaning", "Research"],
    },
    {
      title: "Full-Stack Developer — Paid Training Track",
      slug: "fullstack-paid-training",
      companyName: "BuildUp Academy",
      employmentType: "TRAINING" as const,
      locationType: "ONSITE" as const,
      location: "Giza, Egypt",
      isPaid: true,
      salaryMin: 12000,
      salaryMax: 15000,
      currency: "EGP",
      isTraining: true,
      trackSlug: "frontend-engineering",
      description:
        "A 12-week paid training program covering React, Next.js and TypeScript. Top graduates receive full-time offers.",
      requirements: [
        "Basic HTML/CSS/JavaScript",
        "Interest in web development",
        "Commitment to 12-week full-time program",
      ],
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
  ];

  for (const j of jobs) {
    const trackId = trackMap.get(j.trackSlug)?.id ?? null;
    await prisma.jobPosting.upsert({
      where: { id: j.slug },
      update: {},
      create: {
        id: j.slug,
        recruiterId: recruiterUser.id,
        title: j.title,
        description: j.description,
        companyName: j.companyName,
        locationType: j.locationType,
        location: j.location,
        employmentType: j.employmentType,
        trackId,
        requirements: j.requirements,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        currency: j.currency,
        isPaid: j.isPaid,
        isTraining: j.isTraining,
        skills: j.skills,
        status: "OPEN",
      },
    });
  }
  console.log("✓ Jobs posted");

  // 9. Seed notifications
  await prisma.notification.createMany({
    data: [
      { userId: studentUser.id, type: "SYSTEM", title: "Welcome to TalentBridge 👋", body: "Your Professional-tier profile is ready. Explore projects, mentors and jobs.", link: "/dashboard" },
      { userId: studentUser.id, type: "PROJECT", title: "Your project is live! 🚀", body: '"Smart Campus AI Assistant" is now visible in the directory.', link: "/projects/smart-campus-ai-assistant" },
      { userId: mentorUser.id, type: "SYSTEM", title: "You're verified ✅", body: "Your mentor profile is verified and searchable by students.", link: "/dashboard" },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Notifications");

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed complete. Demo accounts:");
  console.log(`  Admin     → admin@talentbridge.io    / Admin@1234`);
  console.log(`  Student   → student@talentbridge.io  / Student@1234`);
  console.log(`  Mentor    → mentor@talentbridge.io   / Mentor@1234`);
  console.log(`  Recruiter → hr@nexatech.io           / Recruit@1234`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

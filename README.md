# TalentBridge

**University Talent, Graduation Project & Career Development Ecosystem.**

TalentBridge connects **students**, their **graduation projects**, **academic mentors** and **industry recruiters** in one platform — with animated, modern UI, role-based access control and a production-grade stack.

---

## ✨ Features

### Students
- Two-tier portfolio lifecycle: **Growth Tier** (years 1–2, career orientation) → **Professional Tier** (years 3–4, showcase & placement) — automatically escalated as the student advances.
- Career track roadmaps with skill-based **milestones** (planned / in progress / completed).
- Portfolio builder: bio, skills, experience, certifications, links, resume, GPA, and a public **showcase mode** (`/u/:id`).
- Submit **graduation projects**; admins approve them into a public, searchable directory.
- Book **mentoring sessions** with race-condition-safe slot claiming; reviews & ratings after sessions.
- **Apply to jobs & internships** with an automatic portfolio snapshot for recruiters.

### Mentors
- Profile with domains, session lengths, pricing (free or hourly), verification.
- **Availability slots** management with bulk weekly templates.
- Booking dashboard: approve / decline / complete sessions, add meeting links and notes.

### Recruiters
- Post jobs (full-time, part-time, internship, **paid training programs**).
- Applicant pipeline: review → interview → accept / reject, with student portfolio snapshots.

### Admins
- Platform stats overview (users, projects, jobs, bookings, top tracks).
- **User verification** workflow (approve / suspend / reject).
- **Project moderation** + featured flag.
- Career track management.
- **Academic year rollover** with automatic tier escalation.

---

## 🧱 Stack

| Layer      | Technology |
|------------|-----------|
| Framework  | Next.js 15 (App Router) + React 19 |
| Language   | TypeScript |
| Database   | PostgreSQL 18 · Prisma ORM |
| Auth       | NextAuth v5 (credentials, JWT, RBAC) |
| UI         | Tailwind CSS · Radix UI · Framer Motion |
| Queue      | BullMQ + Redis (falls back to inline execution when Redis is absent) |
| Email      | Nodemailer / Resend (SMTP credentials) |
| Storage    | Local disk or S3 (configurable) |

---

## 🚀 Getting started

### 1. Prerequisites
- Node.js ≥ 20 (tested on 24)
- PostgreSQL ≥ 15 running locally (or `docker compose up db`)

### 2. Install & configure

```bash
npm install
cp .env.example .env    # then edit DATABASE_URL + secrets
```

### 3. Database + seed

```bash
npm run setup
# runs: prisma generate → prisma db push → tsx prisma/seed.ts
```

Seed demo accounts:

| Role      | Email                     | Password     |
|-----------|---------------------------|--------------|
| Admin     | `admin@talentbridge.io`   | `Admin@1234` |
| Student   | `student@talentbridge.io` | `Student@1234` |
| Mentor    | `mentor@talentbridge.io`  | `Mentor@1234` |
| Recruiter | `hr@nexatech.io`          | `Recruit@1234` |

### 4. Run

```bash
npm run dev        # http://localhost:3000
```

Optional Redis-backed workers:

```bash
docker compose up redis
npm run queue:worker
```

### 5. Full local stack (Docker)

```bash
docker compose up --build
```

---

## 🔑 Environment variables

See `.env.example` for the full template. Key ones:

```
DATABASE_URL=postgresql://talentbridge:talentbridge@localhost:5432/talentbridge
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random 32+ chars>
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false
SMTP_HOST=          # optional, for transactional email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
AWS_ACCESS_KEY_ID=  # optional, for S3 uploads
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=
```

---

## 📚 Project structure

```
prisma/
  schema.prisma      # full data model (16 tables)
  seed.ts            # demo data
src/
  app/
    (auth)/          # login / register
    (main)/          # public: projects, mentors, jobs (+ [id] pages)
    admin/           # admin panel
    api/             # REST route handlers with RBAC
    dashboard/       # student / mentor / recruiter dashboard
  components/
    dashboard/       # tab components
    landing/         # landing page sections
    motion/          # animation primitives
    ui/              # design system
  lib/               # auth, booking, tier, queue, mailer, storage, validators
  workers/           # BullMQ workers
```

---

## 🔐 Roles & access

- **ADMIN** — platform management, verification, moderation, rollover.
- **STUDENT** — portfolio, milestones, projects, bookings, applications.
- **MENTOR** — availability, booking management, sessions.
- **RECRUITER** — job postings and applicant pipeline.

All new registrations start as `PENDING` until an admin verifies the account.

## 🛡️ Race-condition protections (booking engine)

`src/lib/booking.ts` guards against double-booking using a serializable transaction, `SELECT … FOR UPDATE` row locks, and an atomic slot claim (`updateMany` where `isBooked = false`) — so two students can never reserve the same slot.

---

## 📝 Scripts

| Command                 | Description                        |
|-------------------------|------------------------------------|
| `npm run dev`           | Start dev server                   |
| `npm run build`         | Production build                   |
| `npm run typecheck`     | TypeScript check (`tsc --noEmit`)  |
| `npm run db:push`       | Push schema to DB                  |
| `npm run db:seed`       | Run seed                           |
| `npm run setup`         | Generate + push + seed             |
| `npm run queue:worker`  | Start notification worker          |

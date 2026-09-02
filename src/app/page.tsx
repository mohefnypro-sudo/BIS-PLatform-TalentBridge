import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { RoleFlow } from "@/components/landing/role-flow";
import { ProjectMarquee } from "@/components/landing/project-marquee";
import { MentorSpotlight } from "@/components/landing/mentor-spotlight";
import { CTA } from "@/components/landing/cta";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [featuredProjects, topMentors, stats] = await Promise.all([
    prisma.graduationProject.findMany({
      where: { status: "APPROVED", visibility: "PUBLIC", isFeatured: true },
      include: {
        owner: { include: { user: { select: { name: true, image: true } } } },
      },
      orderBy: { rating: "desc" },
      take: 6,
    }),
    prisma.mentorProfile.findMany({
      where: { isVerified: true, calendarEnabled: true },
      include: { user: { select: { name: true, image: true, bio: true } } },
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
    (async () => {
      const [students, projects, mentors, jobs] = await Promise.all([
        prisma.studentProfile.count(),
        prisma.graduationProject.count({ where: { status: "APPROVED" } }),
        prisma.mentorProfile.count(),
        prisma.jobPosting.count({ where: { status: "OPEN" } }),
      ]);
      return { students, projects, mentors, jobs };
    })(),
  ]);

  return (
    <>
      <Navbar />
      <Hero stats={stats} />
      <Features />
      <ProjectMarquee projects={featuredProjects} />
      <RoleFlow />
      <MentorSpotlight mentors={topMentors} />
      <CTA />
    </>
  );
}

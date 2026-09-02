import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { slugify } from "@/lib/utils";
import { projectSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? "";
  const tech = url.searchParams.get("tech");
  const domain = url.searchParams.get("domain");
  const year = url.searchParams.get("year");
  const featured = url.searchParams.get("featured") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 12)));

  const where = {
    status: "APPROVED" as const,
    visibility: "PUBLIC" as const,
    ...(tech ? { techStack: { has: tech } } : {}),
    ...(domain ? { domain } : {}),
    ...(year ? { academicYear: year } : {}),
    ...(featured ? { isFeatured: true } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { abstract: { contains: search, mode: "insensitive" as const } },
            { techStack: { has: search } },
            { domain: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.graduationProject.findMany({
      where,
      include: {
        members: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
          },
        },
        owner: { include: { user: { select: { name: true, image: true } } } },
      },
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.graduationProject.count({ where }),
  ]);

  const techs = await prisma.graduationProject.findMany({
    where: { status: "APPROVED" },
    select: { techStack: true },
  });
  const techSet = [...new Set(techs.flatMap((t) => t.techStack))].sort();

  const years = await prisma.graduationProject.findMany({
    where: { status: "APPROVED" },
    distinct: ["academicYear"],
    select: { academicYear: true },
  });

  return json({
    projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    facets: { techs: techSet, years: years.map((y) => y.academicYear).filter(Boolean) },
  });
}

export async function POST(req: Request) {
  const result = await requireRole("STUDENT", "MENTOR");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = projectSchema.parse(await req.json());
    const slug = `${slugify(body.title)}-${Date.now().toString(36)}`;

    const profile = user.role === "STUDENT"
      ? await prisma.studentProfile.findUnique({ where: { userId: user.id } })
      : null;

    const project = await prisma.graduationProject.create({
      data: {
        title: body.title,
        slug,
        abstract: body.abstract,
        about: body.about,
        domain: body.domain ?? "Software Engineering",
        techStack: body.techStack ?? [],
        academicYear: body.academicYear ?? new Date().getFullYear().toString(),
        imageGallery: body.imageGallery ?? [],
        coverImage: body.coverImage,
        videoDemoUrl: body.videoDemoUrl,
        liveDemoUrl: body.liveDemoUrl,
        githubRepoUrl: body.githubRepoUrl,
        docsPdfUrl: body.docsPdfUrl,
        advisorName: body.advisorName,
        status: "SUBMITTED",
        ownerId: profile?.id ?? null,
        members: profile
          ? { create: [{ studentId: profile.id, roleInProject: "Team Lead", isLead: true }] }
          : undefined,
      },
    });

    if (profile) {
      await notify({
        userId: user.id,
        type: "PROJECT",
        title: "Project submitted for review",
        body: `Your project "${body.title}" has been submitted. An admin will review and publish it.`,
        link: `/projects/${slug}`,
      });
    }

    return json({ ...project, slug }, 201);
  } catch (error) {
    return handleError(error);
  }
}

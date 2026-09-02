import { apiError, handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { jobSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const track = url.searchParams.get("track");
  const type = url.searchParams.get("type"); // employmentType
  const training = url.searchParams.get("training") === "true";
  const mine = url.searchParams.get("mine") === "true";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") ?? 9)));

  let recruiterId: string | undefined;
  if (mine) {
    const result = await requireRole("RECRUITER", "ADMIN");
    if (result.error) return result.error;
    recruiterId = result.user.id;
  }

  const where = {
    ...(mine ? { recruiterId } : { status: "OPEN" as const }),
    ...(track ? { trackId: track } : {}),
    ...(type ? { employmentType: type as never } : {}),
    ...(training ? { isTraining: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { companyName: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      include: { track: { select: { name: true, color: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.jobPosting.count({ where }),
  ]);

  const tracks = await prisma.careerTrack.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });

  return json({ jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, tracks });
}

export async function POST(req: Request) {
  const result = await requireRole("RECRUITER");
  if (result.error) return result.error;
  const { user } = result;

  try {
    const body = jobSchema.parse(await req.json());
    const job = await prisma.jobPosting.create({
      data: {
        recruiterId: user.id,
        title: body.title,
        description: body.description,
        companyName: body.companyName,
        companyLogo: body.companyLogo,
        companyWebsite: body.companyWebsite,
        locationType: body.locationType,
        location: body.location,
        employmentType: body.employmentType,
        trackId: body.trackId,
        requirements: body.requirements ?? [],
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        currency: body.currency ?? "USD",
        isPaid: body.isPaid ?? true,
        applicationDeadline: body.applicationDeadline,
        isTraining: body.isTraining ?? false,
        skills: body.skills ?? [],
      },
    });
    return json(job, 201);
  } catch (error) {
    return handleError(error);
  }
}

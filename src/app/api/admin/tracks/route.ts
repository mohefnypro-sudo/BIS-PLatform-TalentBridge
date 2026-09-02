import { handleError, json, requireRole } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { trackSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  try {
    const body = trackSchema.parse(await req.json());
    const track = await prisma.careerTrack.create({ data: body });
    return json(track, 201);
  } catch (error) {
    return handleError(error);
  }
}

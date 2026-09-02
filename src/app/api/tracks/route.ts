import { json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracks = await prisma.careerTrack.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  return json(tracks);
}

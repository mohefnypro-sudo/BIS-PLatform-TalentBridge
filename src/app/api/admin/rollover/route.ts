import { json, requireRole } from "@/lib/api";
import { rolloverAcademicYear } from "@/lib/tier";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await requireRole("ADMIN");
  if (result.error) return result.error;

  const advanced = await rolloverAcademicYear();
  return json({ ok: true, advanced });
}

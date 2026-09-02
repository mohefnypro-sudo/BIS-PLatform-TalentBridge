import { handleError, json, requireUser } from "@/lib/api";
import { storeFile, validateUploadInput } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const result = await requireUser();
  if (result.error) return result.error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "general";

    const validated = validateUploadInput(file as File | undefined);
    if (validated.error) return validated.error;

    const stored = await storeFile(validated.file, folder);
    return json(stored, 201);
  } catch (error) {
    return handleError(error);
  }
}

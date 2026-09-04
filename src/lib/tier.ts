import type { AcademicLevel, StudentTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { LEVEL_TO_TIER } from "@/lib/constants";

export interface EscalationResult {
  tier: StudentTier;
  level: AcademicLevel;
  escalated: boolean;
}

/**
 * Dynamic profile escalation: a student's tier is derived from their academic
 * level. Moving into Year 3 (JUNIOR) escalates the account from the Growth tier
 * to the Professional tier, unlocking the professional portfolio capabilities.
 *
 * Called automatically whenever the level is updated, and also idempotently by
 * an admin/automation sweep for year rolls (see admin route /api/admin/rollover).
 */
export async function ensureTierForLevel(profileId: string, level: AcademicLevel): Promise<EscalationResult> {
  const targetTier = LEVEL_TO_TIER[level];

  const current = await prisma.studentProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!current) throw new Error("Student profile not found");

  if (current.tier === targetTier) {
    return { tier: current.tier, level, escalated: false };
  }

  await prisma.studentProfile.update({
    where: { id: profileId },
    data: { tier: targetTier },
  });

  if (targetTier === "PROFESSIONAL") {
    await notify({
      userId: current.user.id,
      type: "TIER_UPGRADE",
      title: "Welcome to the Professional tier 🎉",
      body: `Congratulations! You've advanced to Year ${level === "GRADUATE" ? "4+" : "3"}+ territory. Your portfolio now unlocks work experience, graduation project showcase, skill badges and resume upload. Complete your professional profile to get discovered by recruiters.`,
      link: "/dashboard?tab=portfolio",
    });
  } else {
    await notify({
      userId: current.user.id,
      type: "TIER_UPGRADE",
      title: "Growth tier active",
      body: "Your learning track and milestones are active. Keep progressing toward a professional portfolio.",
      link: "/dashboard?tab=growth",
    });
  }

  return { tier: targetTier, level, escalated: true };
}

/** Set a student's academic level and derive tier (escalation safe-guard). */
export async function updateStudentLevel(userId: string, level: AcademicLevel): Promise<EscalationResult> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, level: true },
  });
  if (!profile) throw new Error("Student profile not found");

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { level },
  });

  return ensureTierForLevel(profile.id, level);
}

/** Academic-year rollover: auto-advance students one level. Idempotent. */
export async function rolloverAcademicYear(): Promise<number> {
  const progression: Record<AcademicLevel, AcademicLevel | null> = {
    FRESHMAN: "SOPHOMORE",
    SOPHOMORE: "JUNIOR",
    JUNIOR: "SENIOR",
    SENIOR: null, // stays senior until graduation is recorded manually
    GRADUATE: null,
  };

  const profiles = await prisma.studentProfile.findMany({ select: { id: true, level: true } });
  let advanced = 0;

  for (const profile of profiles) {
    const next = progression[profile.level];
    if (!next) continue;
    await prisma.studentProfile.update({ where: { id: profile.id }, data: { level: next } });
    await ensureTierForLevel(profile.id, next);
    advanced += 1;
  }

  return advanced;
}

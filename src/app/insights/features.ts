// Turns the raw API data for one student into (a) human-readable stats used
// to word the explanations and (b) a normalized feature vector for the model.

import type {
  ChecklistItemDto, LevelHistoryDto, PaymentSummaryDto,
  PrivatePackageDto, RegistrationDto, SessionDto,
} from '../api/pswmApi';

export const N_FEATURES = 14;

/** Raw, interpretable numbers, everything an explanation might cite. */
export interface StudentStats {
  // Group attendance (sessions where attendance was actually taken)
  groupSessionCount: number;
  attOverall: number;          // 0..1 lifetime rate
  attRecent: number;           // 0..1 over the last `recentWindow` sessions
  recentWindow: number;        // how many sessions attRecent covers
  recentAttended: number;      // attended count inside that window
  missStreak: number;          // consecutive most-recent absences
  daysSinceAttended: number | null;
  // Skills checklist
  hasChecklist: boolean;
  checklistTotal: number;
  checklistDone: number;
  completion: number;          // 0..1
  skillsLast90: number;        // items checked in the last 90 days
  velRecent: number;           // items/month over the last 90 days
  velPrior: number;            // items/month over the 180 days before that
  daysSinceSkill: number | null;
  // Level history
  monthsInLevel: number | null;
  medianLevelMonths: number | null;
  lastPromotion: { level: string; date: Date } | null;
  // Private packages
  hasPrivate: boolean;
  minSessionsLeftRatio: number | null; // lowest sessionsLeft/packageSize among open packages
  lowPackage: { name: string; left: number } | null;
  // Payments & registration state
  totalDue: number;
  dueRatio: number;            // due / net-to-pay, 0..1
  stopped: boolean;            // latest registration flagged as stopped
  // Data coverage
  enoughAttendanceData: boolean;
  enoughSkillData: boolean;
}

export interface InsightSourceData {
  sessions: SessionDto[];             // past sessions incl. attendance (12–15 months)
  checklist: ChecklistItemDto[];
  levelHistory: LevelHistoryDto[];
  packages: PrivatePackageDto[];
  registrations: RegistrationDto[];
  paymentSummary: PaymentSummaryDto | null;
}

const DAY = 86400000;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function isCancelled(status: string | null | undefined): boolean {
  const s = (status ?? '').toLowerCase().trim();
  return s === 'cancelled' || s === 'canceled';
}

export function computeStats(data: InsightSourceData, now = new Date()): StudentStats {
  // ── Group attendance: only sessions where attendance was taken ──────────
  const taken = data.sessions
    .filter((s) => !isCancelled(s.sessionStatus) && s.myAttended != null && s.sessionDate)
    .map((s) => ({ date: new Date(s.sessionDate!), attended: !!s.myAttended }))
    .filter((s) => !isNaN(s.date.getTime()) && s.date.getTime() <= now.getTime() + DAY)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const attendedAll = taken.filter((s) => s.attended);
  const attOverall = taken.length ? attendedAll.length / taken.length : 0;
  const recentWindow = Math.min(8, taken.length);
  const recent = taken.slice(-recentWindow);
  const recentAttended = recent.filter((s) => s.attended).length;
  const attRecent = recentWindow ? recentAttended / recentWindow : 0;

  let missStreak = 0;
  for (let i = taken.length - 1; i >= 0 && !taken[i].attended; i--) missStreak++;
  const lastAttended = attendedAll[attendedAll.length - 1] ?? null;
  const daysSinceAttended = lastAttended
    ? Math.max(0, Math.floor((now.getTime() - lastAttended.date.getTime()) / DAY)) : null;

  // ── Skills checklist ────────────────────────────────────────────────────
  const items = data.checklist;
  const done = items.filter((c) => c.isChecked);
  const datedChecks = done
    .map((c) => (c.dateChecked ? new Date(c.dateChecked) : null))
    .filter((d): d is Date => d != null && !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const inWindow = (from: number, to: number) =>
    datedChecks.filter((d) => {
      const age = (now.getTime() - d.getTime()) / DAY;
      return age >= from && age < to;
    }).length;
  const skillsLast90 = inWindow(0, 90);
  const skillsPrior = inWindow(90, 270);
  const lastCheck = datedChecks[datedChecks.length - 1] ?? null;

  // ── Level history ───────────────────────────────────────────────────────
  const completedMonths: number[] = [];
  let monthsInLevel: number | null = null;
  let lastPromotion: StudentStats['lastPromotion'] = null;
  for (const lv of data.levelHistory) {
    const from = lv.levelDateFrom ? new Date(lv.levelDateFrom) : null;
    const to = lv.levelDateTo ? new Date(lv.levelDateTo) : null;
    if (!from || isNaN(from.getTime())) continue;
    const open = !to || isNaN(to.getTime()) || to.getFullYear() > 2090; // "present" sentinel
    if (open) {
      monthsInLevel = (now.getTime() - from.getTime()) / (30.44 * DAY);
      if (lv.levelName && (!lastPromotion || from > lastPromotion.date)) {
        lastPromotion = { level: lv.levelName, date: from };
      }
    } else {
      completedMonths.push((to.getTime() - from.getTime()) / (30.44 * DAY));
    }
  }
  completedMonths.sort((a, b) => a - b);
  const medianLevelMonths = completedMonths.length
    ? completedMonths[Math.floor(completedMonths.length / 2)] : null;

  // ── Private packages ────────────────────────────────────────────────────
  const open = data.packages.filter((p) => (p.sessionsLeft ?? 0) > 0 && (p.packageNumberOfSessions ?? 0) > 0);
  let minRatio: number | null = null;
  let lowPackage: StudentStats['lowPackage'] = null;
  for (const p of open) {
    const r = p.sessionsLeft / p.packageNumberOfSessions;
    if (minRatio == null || r < minRatio) {
      minRatio = r;
      lowPackage = { name: p.packageName ?? '', left: p.sessionsLeft };
    }
  }

  // ── Payments & registration ─────────────────────────────────────────────
  const pay = data.paymentSummary;
  const totalDue = (pay?.totalGroupDue ?? 0) + (pay?.totalPrivateDue ?? 0);
  const totalNet = (pay?.totalGroupNetToPay ?? 0) + (pay?.totalPrivateNetToPay ?? 0);
  const dueRatio = totalNet > 0 ? clamp01(totalDue / totalNet) : 0;

  const latestReg = [...data.registrations]
    .sort((a, b) => new Date(b.registrationDate ?? 0).getTime() - new Date(a.registrationDate ?? 0).getTime())[0];
  const stopped = !!latestReg?.registrationStudentStopped;

  return {
    groupSessionCount: taken.length,
    attOverall, attRecent, recentWindow, recentAttended, missStreak, daysSinceAttended,
    hasChecklist: items.length > 0,
    checklistTotal: items.length,
    checklistDone: done.length,
    completion: items.length ? done.length / items.length : 0,
    skillsLast90,
    velRecent: skillsLast90 / 3,
    velPrior: skillsPrior / 6,
    daysSinceSkill: lastCheck ? Math.max(0, Math.floor((now.getTime() - lastCheck.getTime()) / DAY)) : null,
    monthsInLevel, medianLevelMonths, lastPromotion,
    hasPrivate: open.length > 0,
    minSessionsLeftRatio: minRatio,
    lowPackage,
    totalDue, dueRatio, stopped,
    enoughAttendanceData: taken.length >= 6,
    enoughSkillData: datedChecks.length >= 3,
  };
}

/**
 * Normalized model input, all in [0,1]. Missing data maps to neutral values;
 * the engine separately suppresses insights that have no data behind them.
 */
export function toFeatureVector(s: StudentStats): number[] {
  const attRecent = s.enoughAttendanceData ? s.attRecent : 0.7;
  const attOverall = s.groupSessionCount ? s.attOverall : 0.7;
  return [
    attRecent,
    attOverall,
    clamp01((attRecent - attOverall + 1) / 2),                    // trend
    clamp01(Math.min(s.missStreak, 5) / 5),
    clamp01((s.daysSinceAttended ?? 14) / 60),
    s.hasChecklist ? s.completion : 0.5,
    clamp01(s.velRecent / 6),
    clamp01((s.velPrior - s.velRecent + 3) / 6),                  // velocity drop
    clamp01((s.daysSinceSkill ?? 60) / 240),
    s.monthsInLevel != null && s.medianLevelMonths
      ? clamp01(s.monthsInLevel / s.medianLevelMonths / 3)        // pace vs own history
      : 0.33,
    s.minSessionsLeftRatio ?? 0.5,
    s.hasPrivate ? 1 : 0,
    s.dueRatio,
    s.stopped ? 1 : 0,
  ];
}

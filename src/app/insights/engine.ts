// The insights engine: loads the student's history, runs it through the
// on-device neural network, and turns the scores + raw stats into worded
// explanations with concrete next steps. No data ever leaves the device.

import {
  getChecklist, getGroupRegistrations, getGroupSessions,
  getPaymentSummary, getPrivatePackages, getProfileLevelHistory,
} from '../api/pswmApi';
import { t, monthShort } from '../i18n';
import { computeStats, toFeatureVector, type InsightSourceData, type StudentStats } from './features';
import { score, type OutputName } from './train';

export type InsightTone = 'positive' | 'info' | 'warn' | 'alert';

export interface InsightAction {
  label: string;
  to?: string;    // in-app route
  href?: string;  // external link (WhatsApp)
}

export interface Insight {
  id: string;
  tone: InsightTone;
  priority: number; // for sorting, higher first
  title: string;
  body: string;
  actions: InsightAction[];
}

export interface InsightReport {
  stats: StudentStats;
  scores: Record<OutputName, number>;
  insights: Insight[];
  generatedAt: Date;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const WHATSAPP = 'https://wa.me/96178949498';

function currentStudentId(): number | null {
  try {
    const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const id = parseInt(u.studentId);
    return Number.isFinite(id) ? id : null;
  } catch { return null; }
}

async function loadData(): Promise<InsightSourceData> {
  const now = new Date();
  const from = new Date(now); from.setMonth(from.getMonth() - 15);
  const studentId = currentStudentId();

  const [sessions, checklist, levelHistory, packages, registrations, paymentSummary] =
    await Promise.allSettled([
      getGroupSessions(undefined, iso(from), iso(now)),
      studentId != null ? getChecklist(studentId) : Promise.resolve([]),
      getProfileLevelHistory(),
      getPrivatePackages(),
      getGroupRegistrations(),
      getPaymentSummary(),
    ]);

  const val = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
    r.status === 'fulfilled' ? r.value : fallback;

  return {
    sessions: val(sessions, []),
    checklist: val(checklist, []),
    levelHistory: val(levelHistory, []),
    packages: val(packages, []),
    registrations: val(registrations, []),
    paymentSummary: val(paymentSummary, null),
  };
}

const TONE_WEIGHT: Record<InsightTone, number> = { alert: 30, warn: 20, positive: 10, info: 5 };

function make(id: string, tone: InsightTone, s: number, params: Record<string, string | number>, actions: InsightAction[]): Insight {
  return {
    id, tone,
    priority: TONE_WEIGHT[tone] + s,
    title: t(`ins.${id}.title`),
    body: t(`ins.${id}.body`, params),
    actions,
  };
}

function fmtDate(d: Date): string {
  return `${monthShort(d.getMonth())} ${d.getDate()}, ${d.getFullYear()}`;
}

export function generateInsights(stats: StudentStats, scores: Record<OutputName, number>): Insight[] {
  const out: Insight[] = [];
  const act = {
    sessions: { label: t('ins.act.sessions'), to: '/registrations' },
    checklist: { label: t('ins.act.checklist'), to: '/checklist' },
    book: { label: t('ins.act.book'), href: `${WHATSAPP}?text=${encodeURIComponent('Hello ProSwim, I would like to book a session.')}` },
    pay: { label: t('ins.act.pay'), to: '/payment-history' },
    packages: { label: t('ins.act.packages'), to: '/private' },
    profile: { label: t('ins.act.profile'), to: '/profile' },
  };

  // ── Attendance ───────────────────────────────────────────────────────────
  if (stats.enoughAttendanceData) {
    if (scores.attendanceRisk >= 0.55) {
      out.push(make('attRisk', scores.attendanceRisk >= 0.75 ? 'alert' : 'warn', scores.attendanceRisk, {
        recent: stats.recentAttended, n: stats.recentWindow,
        pct: Math.round(stats.attOverall * 100),
      }, [act.sessions, act.book]));
    } else if (stats.attRecent >= 0.85) {
      out.push(make('attGreat', 'positive', 1 - scores.attendanceRisk, {
        pct: Math.round(stats.attRecent * 100),
      }, [act.sessions]));
    }
  }

  // ── Skills momentum / plateau ────────────────────────────────────────────
  if (stats.enoughSkillData && scores.momentum >= 0.65 && stats.skillsLast90 > 0) {
    out.push(make('momentum', 'positive', scores.momentum, { n: stats.skillsLast90 }, [act.checklist]));
  }
  if (stats.hasChecklist && stats.completion < 0.95 && stats.daysSinceSkill != null
    && scores.plateauRisk >= 0.6 && stats.daysSinceSkill >= 45) {
    out.push(make('plateau', 'warn', scores.plateauRisk, { days: stats.daysSinceSkill }, [act.checklist, act.book]));
  }

  // ── Re-engagement (churn) ────────────────────────────────────────────────
  if (scores.churnRisk >= 0.65 && stats.daysSinceAttended != null && stats.daysSinceAttended >= 21) {
    out.push(make('reengage', 'warn', scores.churnRisk, { days: stats.daysSinceAttended }, [act.book, act.sessions]));
  }

  // ── Payments ─────────────────────────────────────────────────────────────
  if (stats.totalDue > 0) {
    out.push(make('payment', scores.paymentRisk >= 0.6 ? 'warn' : 'info', scores.paymentRisk, {
      amount: stats.totalDue.toLocaleString(),
    }, [act.pay]));
  }

  // ── Private package running low ──────────────────────────────────────────
  if (stats.lowPackage && stats.lowPackage.left <= 2) {
    out.push(make('lowSessions', 'info', 0.9, {
      pkg: stats.lowPackage.name, n: stats.lowPackage.left,
    }, [act.book, act.packages]));
  }

  // ── Recent level promotion ───────────────────────────────────────────────
  if (stats.lastPromotion) {
    const days = (Date.now() - stats.lastPromotion.date.getTime()) / 86400000;
    if (days >= 0 && days <= 60) {
      out.push(make('newLevel', 'positive', 0.95, {
        level: stats.lastPromotion.level, date: fmtDate(stats.lastPromotion.date),
      }, [act.profile]));
    }
  }

  // ── Fallback while there is little history to learn from ────────────────
  if (out.length === 0 || (!stats.enoughAttendanceData && !stats.enoughSkillData)) {
    out.push(make('newHere', 'info', 0.1, {}, [act.checklist, act.sessions]));
  }

  out.sort((a, b) => b.priority - a.priority);
  return out;
}

// The report is cached briefly so the dashboard card and the full page don't
// refetch everything when the user navigates between them.
let cache: { key: string; at: number; report: InsightReport } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function buildInsightReport(force = false): Promise<InsightReport> {
  const key = String(currentStudentId() ?? 'anon');
  if (!force && cache && cache.key === key && Date.now() - cache.at < CACHE_MS) {
    return cache.report;
  }
  const data = await loadData();
  const stats = computeStats(data);
  const scores = score(toFeatureVector(stats));
  const report: InsightReport = {
    stats, scores,
    insights: generateInsights(stats, scores),
    generatedAt: new Date(),
  };
  cache = { key, at: Date.now(), report };
  return report;
}

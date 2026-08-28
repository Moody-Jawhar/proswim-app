// Smart Insights: the on-device model reads the swimmer's full history
// (attendance, skills, levels, packages, payments) and explains what it sees
// with concrete next steps. Everything is computed locally.

import { useEffect, useState } from 'react';
import { AlertCircle, BrainCircuit } from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { PageHero } from '../components/PageHero';
import { InsightRow } from '../components/InsightRow';
import { t } from '../i18n';
import { buildInsightReport, type InsightReport } from '../insights/engine';

const BRAND = '#1e5c97';

export function InsightsPage() {
  const [report, setReport] = useState<InsightReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    buildInsightReport()
      .then((r) => { if (alive) setReport(r); })
      .catch(() => { if (alive) setError(t('ins.loadError')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const s = report?.stats;
  const tiles = s ? [
    {
      label: t('ins.scores.attendance'),
      value: s.groupSessionCount ? `${Math.round(s.attOverall * 100)}%` : '-',
    },
    {
      label: t('ins.scores.skills'),
      value: s.hasChecklist ? `${s.checklistDone}/${s.checklistTotal}` : '-',
    },
    {
      label: t('ins.scores.momentum'),
      value: report ? `${Math.round(report.scores.momentum * 100)}` : '-',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('ins.title')} showBell />
      <PageHero title={t('ins.title')} subtitle={t('ins.subtitle')} slide={2} />

      <div className="px-4 pt-4">
        {loading ? (
          <PageLoader label={t('ins.loading')} />
        ) : error ? (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="size-5" style={{ color: '#DC2626', flexShrink: 0 }} />
            <p className="text-sm text-slate-900">{error}</p>
          </div>
        ) : report && (
          <>
            {/* ── Headline numbers ── */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {tiles.map((tile) => (
                <div key={tile.label} className="bg-white rounded-2xl border border-slate-100 shadow-soft p-3 text-center">
                  <p className="num-stat text-xl font-bold" style={{ color: BRAND }}>{tile.value}</p>
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: '#64748B' }}>{tile.label}</p>
                </div>
              ))}
            </div>

            {/* ── Insights ── */}
            <div className="flex flex-col gap-3 mb-5">
              {report.insights.map((ins) => (
                <div key={ins.id} className="bg-white rounded-2xl border border-slate-100 shadow-soft">
                  <InsightRow insight={ins} />
                </div>
              ))}
            </div>

            {/* ── How this works ── */}
            <div className="rounded-2xl p-4 mb-5 flex items-start gap-3"
              style={{ background: 'rgba(30,92,151,0.06)', border: '1px solid rgba(30,92,151,0.15)' }}>
              <BrainCircuit className="size-4 mt-0.5" style={{ color: BRAND, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#475569', lineHeight: 1.55 }}>{t('ins.note')}</p>
            </div>
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

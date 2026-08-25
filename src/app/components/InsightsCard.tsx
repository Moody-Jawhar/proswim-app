// "Smart insights" section for the student dashboard: the top few findings
// from the on-device model, with a link to the full insights page.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { t } from '../i18n';
import { buildInsightReport, type Insight } from '../insights/engine';
import { InsightRow } from './InsightRow';

const BRAND = '#1e5c97';

export function InsightsCard() {
  const [insights, setInsights] = useState<Insight[] | null>(null);

  useEffect(() => {
    let alive = true;
    buildInsightReport()
      .then((r) => { if (alive) setInsights(r.insights); })
      .catch(() => { if (alive) setInsights(null); });
    return () => { alive = false; };
  }, []);

  if (!insights || insights.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,92,151,0.12)' }}>
          <Sparkles className="size-4" style={{ color: BRAND }} />
        </div>
        <p className="font-display text-xs uppercase" style={{ color: '#475569', letterSpacing: '0.12em', fontWeight: 700 }}>
          {t('ins.cardTitle')}
        </p>
        <div className="flex-1" style={{ height: 1, background: 'rgba(100,116,139,0.12)' }} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft mb-5 overflow-hidden">
        {insights.slice(0, 3).map((ins, i) => (
          <div key={ins.id} style={i > 0 ? { borderTop: '1px solid #F1F5F9' } : undefined}>
            <InsightRow insight={ins} compact />
          </div>
        ))}
        <Link to="/insights" className="flex items-center justify-between px-4 py-3 active:opacity-70"
          style={{ borderTop: '1px solid #F1F5F9' }}>
          <span className="text-sm font-bold" style={{ color: BRAND }}>{t('ins.viewAll')}</span>
          <ChevronRight className="size-4" style={{ color: BRAND }} />
        </Link>
      </div>
    </>
  );
}

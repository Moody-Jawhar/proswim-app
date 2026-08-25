// One insight rendered as a row: tone icon, title, explanation, and (in the
// full view) the recommended actions. Shared by the dashboard card and the
// insights page.

import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Insight, InsightTone } from '../insights/engine';

const TONES: Record<InsightTone, { color: string; bg: string; Icon: typeof Info }> = {
  positive: { color: '#047857', bg: 'rgba(16,185,129,0.12)', Icon: TrendingUp },
  info: { color: '#1e5c97', bg: 'rgba(30,92,151,0.12)', Icon: Info },
  warn: { color: '#B45309', bg: 'rgba(245,158,11,0.14)', Icon: TrendingDown },
  alert: { color: '#B91C1C', bg: 'rgba(239,68,68,0.12)', Icon: AlertTriangle },
};

export function InsightRow({ insight, compact = false }: { insight: Insight; compact?: boolean }) {
  const tone = TONES[insight.tone];

  return (
    <div className={compact ? 'px-4 py-3' : 'p-4'}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl flex items-center justify-center shrink-0"
          style={{ width: 34, height: 34, background: tone.bg }}>
          <tone.Icon className="size-4" style={{ color: tone.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">{insight.title}</p>
          <p className="text-xs mt-0.5" style={{
            color: '#64748B',
            ...(compact ? {
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            } : { lineHeight: 1.5 }),
          }}>
            {insight.body}
          </p>
          {!compact && insight.actions.length > 0 && (
            <div className="flex gap-2 mt-2.5" style={{ flexWrap: 'wrap' }}>
              {insight.actions.map((a) =>
                a.to ? (
                  <Link key={a.label} to={a.to}
                    className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 active:opacity-70"
                    style={{ background: tone.bg, color: tone.color }}>
                    {a.label} <ChevronRight className="size-3" />
                  </Link>
                ) : (
                  <a key={a.label} href={a.href} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1.5 active:opacity-70"
                    style={{ background: tone.bg, color: tone.color }}>
                    {a.label} <ChevronRight className="size-3" />
                  </a>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

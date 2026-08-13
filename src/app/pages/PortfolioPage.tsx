import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Medal, Timer, TrendingUp, FileText, Star,
  CalendarDays, ExternalLink, Loader2, AlertCircle, MapPin,
} from 'lucide-react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { getCompPortfolio, type CompPortfolioDto, type PortfolioRow } from '../api/pswmApi';

const str = (r: PortfolioRow, k: string) => (r[k] == null ? '' : String(r[k]));
const num = (r: PortfolioRow, k: string) => Number(r[k] ?? 0);

function fmtMs(ms: number): string {
  if (!ms || ms <= 0) return '—';
  const m = Math.floor(ms / 60000);
  const s = (ms % 60000) / 1000;
  return m > 0 ? `${m}:${s.toFixed(2).padStart(5, '0')}` : s.toFixed(2);
}

function fmtDate(v: string): string {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const AWARD_STYLE: Record<string, { bg: string; fg: string }> = {
  Gold: { bg: 'rgba(245,158,11,0.15)', fg: '#92600A' },
  Silver: { bg: 'rgba(148,163,184,0.20)', fg: '#475569' },
  Bronze: { bg: 'rgba(249,115,22,0.15)', fg: '#9A3412' },
};

// Read-only competitive portfolio for the signed-in team swimmer.
export function PortfolioPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<CompPortfolioDto | null>(null);
  const [error, setError] = useState('');
  const [chartEvent, setChartEvent] = useState('');

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/signin');
      return;
    }
    getCompPortfolio()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load the portfolio.'));
  }, [navigate]);

  const chartEvents = useMemo(() => {
    const set = new Set<string>();
    for (const r of data?.results ?? []) if (num(r, 'TimeMs') > 0) set.add(str(r, 'EventName'));
    return [...set].sort();
  }, [data]);

  useEffect(() => {
    if (!chartEvent && chartEvents.length > 0) setChartEvent(chartEvents[0]);
  }, [chartEvents, chartEvent]);

  const chartPoints = useMemo(() =>
    (data?.results ?? [])
      .filter((r) => str(r, 'EventName') === chartEvent && num(r, 'TimeMs') > 0 && str(r, 'ResultDate'))
      .map((r) => ({ date: new Date(str(r, 'ResultDate')).getTime(), ms: num(r, 'TimeMs') }))
      .filter((p) => !isNaN(p.date))
      .sort((a, b) => a.date - b.date),
  [data, chartEvent]);

  if (!data) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="My Portfolio" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
          {error
            ? <><AlertCircle className="size-10 text-red-400" /><p className="text-sm text-red-600 text-center">{error}</p></>
            : <Loader2 className="size-8 text-[#1e5c97] animate-spin" />}
        </div>
        <MobileNav />
      </div>
    );
  }

  const empty = data.personalBests.length === 0 && data.results.length === 0 &&
    data.awards.length === 0 && data.evaluations.length === 0;

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="My Portfolio" showBack />

      <div className="px-4 pt-4 pb-5">
        {empty && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center mb-4">
            <Trophy className="size-8 mx-auto mb-2" style={{ color: '#F59E0B' }} />
            <p className="text-sm text-slate-900 font-semibold">Your portfolio is just getting started</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>
              Results, awards and coach evaluations will appear here as your coach records them.
            </p>
          </div>
        )}

        {/* Personal bests */}
        {data.personalBests.length > 0 && (
          <Card icon={<Timer className="size-4" style={{ color: '#1e5c97' }} />} iconBg="rgba(91,173,255,0.18)" title="Personal Best Times">
            <div className="grid grid-cols-2 gap-3">
              {data.personalBests.map((b) => (
                <div key={str(b, 'EventName')} className="rounded-xl p-3" style={{ background: 'rgba(30,92,151,0.06)' }}>
                  <p className="text-xs" style={{ color: '#64748B' }}>{str(b, 'EventName')}</p>
                  <p className="num-stat text-xl font-bold" style={{ color: '#1e5c97' }}>{fmtMs(num(b, 'TimeMs'))}</p>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                    {[fmtDate(str(b, 'ResultDate')), str(b, 'CompetitionName')].filter(Boolean).join(' · ')}
                  </p>
                  {b.IsRecord === true && (
                    <span className="inline-block mt-1 text-xs font-bold rounded-full px-2 py-0.5"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#6D28D9' }}>
                      ★ {str(b, 'RecordLevel') || 'Record'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Progress chart */}
        {chartEvents.length > 0 && (
          <Card icon={<TrendingUp className="size-4" style={{ color: '#10B981' }} />} iconBg="rgba(52,211,153,0.18)" title="Progress">
            {chartEvents.length > 1 && (
              <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                {chartEvents.map((ev) => (
                  <button key={ev} onClick={() => setChartEvent(ev)}
                    className="text-xs font-bold rounded-full px-3 py-1.5"
                    style={chartEvent === ev
                      ? { background: '#1e5c97', color: 'white' }
                      : { background: 'rgba(30,92,151,0.08)', color: '#1e5c97' }}>
                    {ev}
                  </button>
                ))}
              </div>
            )}
            <MiniChart points={chartPoints} />
          </Card>
        )}

        {/* Results */}
        {data.results.length > 0 && (
          <Card icon={<Medal className="size-4" style={{ color: '#1e5c97' }} />} iconBg="rgba(91,173,255,0.18)" title="Competition Results">
            <div>
              {data.results.map((r) => (
                <div key={num(r, 'ResultId')} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <p className="text-sm font-semibold text-slate-900">
                      {str(r, 'EventName')}
                      {num(r, 'FinishRank') > 0 && (
                        <span className="text-xs font-bold ml-2 rounded-full px-2 py-0.5"
                          style={{ background: num(r, 'FinishRank') <= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.15)', color: num(r, 'FinishRank') <= 3 ? '#92600A' : '#475569' }}>
                          #{num(r, 'FinishRank')}
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                      {[fmtDate(str(r, 'ResultDate')), str(r, 'CompetitionName')].filter(Boolean).join(' · ')}
                    </p>
                    {r.IsRecord === true && (
                      <span className="inline-block mt-1 text-xs font-bold rounded-full px-2 py-0.5"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#6D28D9' }}>
                        ★ {str(r, 'RecordLevel') || 'Official record'}
                      </span>
                    )}
                  </div>
                  <p className="num-stat text-base font-bold" style={{ color: '#1e5c97', flexShrink: 0 }}>{fmtMs(num(r, 'TimeMs'))}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Awards */}
        {data.awards.length > 0 && (
          <Card icon={<Trophy className="size-4" style={{ color: '#F59E0B' }} />} iconBg="rgba(245,158,11,0.16)" title="Awards & Medals">
            <div className="grid grid-cols-1 gap-2">
              {data.awards.map((a) => {
                const s = AWARD_STYLE[str(a, 'AwardType')] ?? { bg: 'rgba(148,163,184,0.12)', fg: '#475569' };
                return (
                  <div key={num(a, 'AwardId')} className="flex items-center gap-3 rounded-xl p-3" style={{ background: s.bg }}>
                    <Medal className="size-5" style={{ color: s.fg, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p className="text-sm font-bold" style={{ color: s.fg }}>{str(a, 'AwardTitle')}</p>
                      <p className="text-xs" style={{ color: s.fg, opacity: 0.75 }}>
                        {[str(a, 'CompetitionName'), fmtDate(str(a, 'AwardDate'))].filter(Boolean).join(' · ') || str(a, 'AwardType')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Upcoming competitions */}
        {data.upcomingCompetitions.length > 0 && (
          <Card icon={<CalendarDays className="size-4" style={{ color: '#8B5CF6' }} />} iconBg="rgba(139,92,246,0.16)" title="Upcoming Competitions">
            {data.upcomingCompetitions.map((c) => (
              <div key={num(c, 'CompetitionId')} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p className="text-sm font-semibold text-slate-900">{str(c, 'CompetitionName')}</p>
                  {str(c, 'Location') && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#64748B' }}>
                      <MapPin className="size-3" /> {str(c, 'Location')}
                    </p>
                  )}
                </div>
                <p className="text-xs font-bold" style={{ color: '#8B5CF6', flexShrink: 0 }}>{fmtDate(str(c, 'StartDate'))}</p>
              </div>
            ))}
          </Card>
        )}

        {/* Documents */}
        {data.documents.length > 0 && (
          <Card icon={<FileText className="size-4" style={{ color: '#64748B' }} />} iconBg="rgba(148,163,184,0.16)" title="Competition Documents">
            {data.documents.map((d) => (
              <button key={num(d, 'DocumentId')} onClick={() => window.open(str(d, 'Url'))}
                className="w-full flex items-center gap-2 py-2 text-left" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <ExternalLink className="size-4" style={{ color: '#1e5c97', flexShrink: 0 }} />
                <span className="text-sm font-semibold" style={{ color: '#1e5c97' }}>{str(d, 'Title')}</span>
                {str(d, 'CompetitionName') && (
                  <span className="text-xs" style={{ color: '#94A3B8' }}>· {str(d, 'CompetitionName')}</span>
                )}
              </button>
            ))}
          </Card>
        )}

        {/* Coach evaluations */}
        {data.evaluations.length > 0 && (
          <Card icon={<Star className="size-4" style={{ color: '#F59E0B' }} />} iconBg="rgba(245,158,11,0.16)" title="Coach Evaluations">
            {data.evaluations.map((ev) => (
              <div key={num(ev, 'EvaluationId')} className="py-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{str(ev, 'CoachName') || 'Coach'}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="size-3.5"
                          style={{ color: n <= num(ev, 'Rating') ? '#F59E0B' : '#E2E8F0', fill: n <= num(ev, 'Rating') ? '#F59E0B' : 'none' }} />
                      ))}
                    </span>
                    <span className="text-xs" style={{ color: '#94A3B8' }}>{fmtDate(str(ev, 'EvalDate'))}</span>
                  </div>
                </div>
                {str(ev, 'Comments') && <p className="text-sm mt-1" style={{ color: '#475569' }}>{str(ev, 'Comments')}</p>}
              </div>
            ))}
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

function Card({ icon, iconBg, title, children }: {
  icon: React.ReactNode; iconBg: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MiniChart({ points }: { points: { date: number; ms: number }[] }) {
  if (points.length < 2) {
    return <p className="text-xs" style={{ color: '#94A3B8' }}>At least two timed swims are needed to draw progress.</p>;
  }
  const W = 340, H = 140, PX = 40, PY = 18;
  const xs = points.map((p) => p.date);
  const ys = points.map((p) => p.ms);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const xSpan = Math.max(xMax - xMin, 1);
  const ySpan = Math.max(yMax - yMin, 1);
  const X = (v: number) => PX + ((v - xMin) / xSpan) * (W - PX * 2);
  const Y = (v: number) => PY + ((v - yMin) / ySpan) * (H - PY * 2);
  const path = points.map((p) => `${X(p.date).toFixed(1)},${Y(p.ms).toFixed(1)}`).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY} stroke="#E2E8F0" />
        <text x={PX - 5} y={PY + 4} textAnchor="end" fontSize="9" fill="#10B981">{fmtMs(yMin)}</text>
        <text x={PX - 5} y={H - PY} textAnchor="end" fontSize="9" fill="#94A3B8">{fmtMs(yMax)}</text>
        <polyline points={path} fill="none" stroke="#1e5c97" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={X(p.date)} cy={Y(p.ms)} r={i === points.length - 1 ? 4 : 2.5}
            fill={p.ms === yMin ? '#10B981' : '#1e5c97'} />
        ))}
      </svg>
      <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Lower is faster — the green dot is your best time.</p>
    </div>
  );
}

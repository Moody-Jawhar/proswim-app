import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Baby, Waves, Fish, Star, Medal, Trophy, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { t } from '../i18n';

type LevelColor = 'rose' | 'sky' | 'emerald' | 'amber' | 'violet' | 'blue';

interface SubLevel {
  name: string;
  points: string[];
}

interface Level {
  id: string;
  url: string;
  title: string;
  ageRange: string;
  color: LevelColor;
  icon: React.ReactNode;
  iconBg: string;
  description: string;
  subLevels: SubLevel[];
}

const buildLevels = (): Level[] => [
  {
    id: 'aqua-baby',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Aquababy',
    title: t('lv.ab.title'),
    ageRange: t('lv.ab.age'),
    color: 'rose',
    icon: <Baby className="size-6 text-rose-500" />,
    iconBg: 'bg-rose-50',
    description: t('lv.ab.desc'),
    subLevels: [
      {
        name: t('lv.ab.s1'),
        points: [t('lv.ab.s1p1'), t('lv.ab.s1p2'), t('lv.ab.s1p3'), t('lv.ab.s1p4'), t('lv.ab.s1p5')],
      },
      {
        name: t('lv.ab.s2'),
        points: [t('lv.ab.s2p1'), t('lv.ab.s2p2'), t('lv.ab.s2p3'), t('lv.ab.s2p4')],
      },
    ],
  },
  {
    id: 'active-start',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Active_Start',
    title: t('lv.as.title'),
    ageRange: t('lv.as.age'),
    color: 'sky',
    icon: <Waves className="size-6 text-sky-500" />,
    iconBg: 'bg-sky-50',
    description: t('lv.as.desc'),
    subLevels: [
      {
        name: t('lv.as.s1'),
        points: [t('lv.as.s1p1'), t('lv.as.s1p2'), t('lv.as.s1p3')],
      },
      {
        name: t('lv.as.s2'),
        points: [t('lv.as.s2p1'), t('lv.as.s2p2'), t('lv.as.s2p3'), t('lv.as.s2p4')],
      },
    ],
  },
  {
    id: 'learn-to-train',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Learn_to_Train',
    title: t('lv.lt.title'),
    ageRange: t('lv.lt.age'),
    color: 'emerald',
    icon: <Fish className="size-6 text-emerald-500" />,
    iconBg: 'bg-emerald-50',
    description: t('lv.lt.desc'),
    subLevels: [
      {
        name: t('lv.lt.s1'),
        points: [t('lv.lt.s1p1'), t('lv.lt.s1p2'), t('lv.lt.s1p3')],
      },
      {
        name: t('lv.lt.s2'),
        points: [t('lv.lt.s2p1'), t('lv.lt.s2p2'), t('lv.lt.s2p3')],
      },
      {
        name: t('lv.lt.s3'),
        points: [t('lv.lt.s3p1'), t('lv.lt.s3p2'), t('lv.lt.s3p3')],
      },
    ],
  },
  {
    id: 'train-to-train',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Train_to_Train',
    title: t('lv.tt.title'),
    ageRange: t('lv.tt.age'),
    color: 'amber',
    icon: <Star className="size-6 text-amber-500" />,
    iconBg: 'bg-amber-50',
    description: t('lv.tt.desc'),
    subLevels: [
      {
        name: t('lv.tt.s1'),
        points: [t('lv.tt.s1p1'), t('lv.tt.s1p2'), t('lv.tt.s1p3')],
      },
      {
        name: t('lv.tt.s2'),
        points: [t('lv.tt.s2p1'), t('lv.tt.s2p2'), t('lv.tt.s2p3')],
      },
      {
        name: t('lv.tt.s3'),
        points: [t('lv.tt.s3p1'), t('lv.tt.s3p2')],
      },
    ],
  },
  {
    id: 'train-to-compete',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Train_to_Compete',
    title: t('lv.tc.title'),
    ageRange: t('lv.tc.age'),
    color: 'violet',
    icon: <Medal className="size-6 text-violet-500" />,
    iconBg: 'bg-violet-50',
    description: t('lv.tc.desc'),
    subLevels: [
      {
        name: t('lv.tc.s1'),
        points: [t('lv.tc.s1p1'), t('lv.tc.s1p2')],
      },
      {
        name: t('lv.tc.s2'),
        points: [t('lv.tc.s2p1'), t('lv.tc.s2p2')],
      },
      {
        name: t('lv.tc.s3'),
        points: [t('lv.tc.s3p1'), t('lv.tc.s3p2')],
      },
    ],
  },
  {
    id: 'competitive-team',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=CompetitiveTeam',
    title: t('lv.ct.title'),
    ageRange: t('lv.ct.age'),
    color: 'blue',
    icon: <Trophy className="size-6 text-[#1e5c97]" />,
    iconBg: 'bg-blue-50',
    description: t('lv.ct.desc'),
    subLevels: [
      {
        name: t('lv.ct.s1'),
        points: [t('lv.ct.s1p1'), t('lv.ct.s1p2'), t('lv.ct.s1p3')],
      },
      {
        name: t('lv.ct.s2'),
        points: [t('lv.ct.s2p1'), t('lv.ct.s2p2'), t('lv.ct.s2p3'), t('lv.ct.s2p4'), t('lv.ct.s2p5')],
      },
    ],
  },
];

const colorConfig: Record<LevelColor, { border: string; check: string; tag: string }> = {
  rose:    { border: 'border-l-rose-400',    check: 'text-rose-500',    tag: 'bg-rose-100 text-rose-700' },
  sky:     { border: 'border-l-sky-400',     check: 'text-sky-600',     tag: 'bg-sky-100 text-sky-700' },
  emerald: { border: 'border-l-emerald-400', check: 'text-emerald-600', tag: 'bg-emerald-100 text-emerald-700' },
  amber:   { border: 'border-l-amber-400',   check: 'text-amber-600',   tag: 'bg-amber-100 text-amber-700' },
  violet:  { border: 'border-l-violet-400',  check: 'text-violet-600',  tag: 'bg-violet-100 text-violet-700' },
  blue:    { border: 'border-l-[#1e5c97]',   check: 'text-[#1e5c97]',   tag: 'bg-blue-100 text-[#1e5c97]' },
};

export function SwimLevelsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const LEVELS = buildLevels();

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title={t('nav.levels')} />

      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-slate-900">{t('levels.header')}</p>
          <p className="text-sm text-slate-500 mt-1">{t('levels.tagline')}</p>
        </div>

        <div className="space-y-3">
          {LEVELS.map(level => {
            const cfg = colorConfig[level.color];
            const isExpanded = expanded === level.id;
            return (
              <div key={level.id} className={`bg-white rounded-2xl border border-white shadow-sm shadow-blue-100/50 border-l-4 ${cfg.border} overflow-hidden`}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : level.id)}
                  className="w-full p-5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="text-base font-semibold text-slate-900">{level.title}</p>
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.tag}`}>{level.ageRange}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{level.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={`w-10 h-10 rounded-xl ${level.iconBg} flex items-center justify-center`}>
                        {level.icon}
                      </div>
                      <ChevronDown className={`size-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    {level.subLevels.map(sub => (
                      <div key={sub.name}>
                        <p className="text-xs font-semibold text-slate-500 mb-2">{sub.name}</p>
                        <div className="space-y-2">
                          {sub.points.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className={`${cfg.check} font-bold shrink-0`}>✓</span>
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <a href={level.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e5c97]">
                      {t('levels.more')}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

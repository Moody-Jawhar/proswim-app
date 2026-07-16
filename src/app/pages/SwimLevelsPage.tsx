import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Baby, Waves, Fish, Star, Medal, Trophy, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';

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

const LEVELS: Level[] = [
  {
    id: 'aqua-baby',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Aquababy',
    title: 'Aqua Baby',
    ageRange: '3 months – 3 years',
    color: 'rose',
    icon: <Baby className="size-6 text-rose-500" />,
    iconBg: 'bg-rose-50',
    description:
      'Introduces infants to water with parental participation — gentle water games, splashing, bobbing, and singing build comfort and confidence. Benefits include muscle development, coordination, balance, improved sleep, and social skills.',
    subLevels: [
      {
        name: 'Splashes (3 – 18 months)',
        points: [
          'One-on-one bonding and water safety education for parents',
          '3 months: happily having water gently poured over the head',
          '6 months: brief underwater passes',
          '12 months: brief underwater swimming',
          '18 months: maneuvering through the water for 3–5 seconds',
        ],
      },
      {
        name: 'Bubblers (18 months – 3 years)',
        points: [
          'Wall-holding, kicking, and bubble-blowing',
          '24 months: getting back to pool side from sitting entry',
          '30 months: swimming with face in water',
          '36 months: returning to pool side from standing entry',
        ],
      },
    ],
  },
  {
    id: 'active-start',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Active_Start',
    title: 'Active Start',
    ageRange: '3 – 12 years',
    color: 'sky',
    icon: <Waves className="size-6 text-sky-500" />,
    iconBg: 'bg-sky-50',
    description:
      'Children progress without parental attendance, organized by skill and ability. Introduces front & back floating, gliding, turning over, jumping in, rhythmic breathing, and the leg/arm coordination fundamental to the freestyle stroke.',
    subLevels: [
      {
        name: 'Ages 3 – 6',
        points: [
          'Level 1 – Sea Horse Bobbers: comfort with facial water contact and basic supported movements',
          'Level 2 – Pumpkin Floaters: pool safety, underwater exploration, advanced floating/gliding, object retrieval',
          'Level 3 – Spike Gliders: combines kicking with gliding for self-propulsion',
        ],
      },
      {
        name: 'Fundamentals (Ages 6 – 12)',
        points: [
          'Beginner 1 – Otter: pool safety, underwater submersion, front and back crawl introduction',
          'Beginner 2 – Seal: gliding, kicking, breathing coordination, front/back crawl technique',
          'Beginner 3 – Dolphin: swim-float-swim sequences, 10-meter unassisted distances',
          'Beginner 4 – Shark: 15-meter underwater streamline with side breathing techniques',
        ],
      },
    ],
  },
  {
    id: 'learn-to-train',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Learn_to_Train',
    title: 'Learn to Train',
    ageRange: '6 – 12 years',
    color: 'emerald',
    icon: <Fish className="size-6 text-emerald-500" />,
    iconBg: 'bg-emerald-50',
    description:
      'An intermediate progression for children who completed the beginner fundamentals, focused on stroke development and endurance building.',
    subLevels: [
      {
        name: 'Intermediate 1 – Whale One',
        points: ['Breaststroke kicks', 'Crawl and back swimming without any assistance', 'Endurance building'],
      },
      {
        name: 'Intermediate 2 – Whale Two',
        points: ['Crawl and back strokes for 25 meters', 'Introduction to breaststroke arm strokes and breathing', 'Continued endurance development'],
      },
      {
        name: 'Intermediate 3 – Whale Three',
        points: ['Extended distance in crawl and backstroke', 'Crawl and back flips and turns', 'Combining breaststroke kicks with arm movements'],
      },
    ],
  },
  {
    id: 'train-to-train',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Train_to_Train',
    title: 'Train to Train',
    ageRange: 'Advanced',
    color: 'amber',
    icon: <Star className="size-6 text-amber-500" />,
    iconBg: 'bg-amber-50',
    description:
      'An advanced progression where swimmers master multiple techniques and increase athletic performance across five Advanced Star stages.',
    subLevels: [
      {
        name: 'Advanced Star 1 – 2',
        points: [
          'Crawl and backstroke over long distances',
          'Breaststroke techniques and drills',
          'Sculling introduction, flips and turns, underwater swimming, pace and speed work',
        ],
      },
      {
        name: 'Advanced Star 3 – 4',
        points: [
          'Comfort with crawl, backstroke, and breaststroke with established flips and turns',
          'Dolphin kicks and side stroke introduction',
          'Learning the butterfly stroke and its drills, with notable speed and endurance gains',
        ],
      },
      {
        name: 'Advanced Star 5',
        points: [
          'Swimming all four strokes perfectly with all drills and practices',
          'Must pass the federation test to advance',
        ],
      },
    ],
  },
  {
    id: 'train-to-compete',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=Train_to_Compete',
    title: 'Train to Compete',
    ageRange: 'Pre-team',
    color: 'violet',
    icon: <Medal className="size-6 text-violet-500" />,
    iconBg: 'bg-violet-50',
    description:
      'A transitional phase preparing swimmers for entry into the ProSwim Competitive Team, in three progressive stages.',
    subLevels: [
      {
        name: 'Stage 1 – Foundation',
        points: ['Academy sessions plus 1–2 supplementary team training sessions', 'Team discipline, training protocols, swimming terminology, advanced drills'],
      },
      {
        name: 'Stage 2 – Integration',
        points: ['One academy session per week with increased team participation', 'Emphasis on proper technique during the transition'],
      },
      {
        name: 'Stage 3 – Competitive Membership',
        points: ['Formal level testing (Table assessment)', 'Full team membership and eligibility to compete under the ProSwim name'],
      },
    ],
  },
  {
    id: 'competitive-team',
    url: 'https://www.proswim-lb.com/WebsiteLevels.aspx?Page=CompetitiveTeam',
    title: 'Competitive Team',
    ageRange: 'Elite',
    color: 'blue',
    icon: <Trophy className="size-6 text-[#0B4F8C]" />,
    iconBg: 'bg-blue-50',
    description:
      'ProSwim\'s highest level — swimmers who complete all levels compete nationally & internationally, led by Head Coach Mohamad Sakr.',
    subLevels: [
      {
        name: 'Training Structure',
        points: [
          '6 sessions weekly during school periods',
          'Twice daily, 6 times weekly during summer and holiday breaks',
          'Intensive drills covering all four strokes, speed, and endurance',
        ],
      },
      {
        name: 'Support Services',
        points: [
          'Sports nutritionist with customized dietary guidance',
          'Dryland trainers strengthening swimming-specific muscle groups',
          'Physiotherapists for injury prevention',
          'Yoga instructors for breathing efficiency and mental resilience',
          'High-tech physical assessments and professional boot camps',
        ],
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
  blue:    { border: 'border-l-[#0B4F8C]',   check: 'text-[#0B4F8C]',   tag: 'bg-blue-100 text-[#0B4F8C]' },
};

export function SwimLevelsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Swim Levels" showBack />

      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-slate-900">Our Swim Levels</p>
          <p className="text-sm text-slate-500 mt-1">A clear path from first splash to competitive team</p>
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
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B4F8C]">
                      For more information
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

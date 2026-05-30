import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Baby, Users, User, Sparkles, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ProgramsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Programs" showBack />

      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-slate-900">Our Programs</p>
          <p className="text-sm text-slate-500 mt-1">All ages and skill levels</p>
        </div>

        <div className="space-y-3">
          <ProgramCard
            icon={<Baby className="size-6 text-rose-500" />}
            iconBg="bg-rose-50"
            title="Aqua Baby"
            ageRange="3 – 22 months"
            color="rose"
            description="A magical journey for babies and parents together with songs and games."
            features={['Water awareness & confidence', 'Back floating with support', 'Submersion introduction', 'Water safety training']}
            isExpanded={expandedProgram === 'aqua-baby'}
            onToggle={() => setExpandedProgram(expandedProgram === 'aqua-baby' ? null : 'aqua-baby')}
          />

          <ProgramCard
            icon={<Users className="size-6 text-sky-500" />}
            iconBg="bg-sky-50"
            title="Active Start"
            ageRange="3 – 6 years"
            color="sky"
            description="Basic swimming movements and water confidence without parents."
            features={['Floating and gliding', 'Underwater exploration', 'Kickboards & equipment', 'Rhythmic breathing basics']}
            isExpanded={expandedProgram === 'active-start'}
            onToggle={() => setExpandedProgram(expandedProgram === 'active-start' ? null : 'active-start')}
          />

          <ProgramCard
            icon={<User className="size-6 text-emerald-500" />}
            iconBg="bg-emerald-50"
            title="Fundamentals"
            ageRange="6 – 12 years"
            color="emerald"
            description="All four strokes with a strong focus on correct technique."
            features={['Front crawl & backstroke', 'Breaststroke & butterfly', 'Flip turns & streamlining', 'Endurance building']}
            isExpanded={expandedProgram === 'fundamentals'}
            onToggle={() => setExpandedProgram(expandedProgram === 'fundamentals' ? null : 'fundamentals')}
          />

          <ProgramCard
            icon={<Sparkles className="size-6 text-violet-500" />}
            iconBg="bg-violet-50"
            title="Competitive Team"
            ageRange="Advanced"
            color="violet"
            description="Structured training for national and international competitions."
            features={['6 sessions per week', 'Professional coaching', 'Boot camps & testing', 'Nutritionist support']}
            isExpanded={expandedProgram === 'competitive'}
            onToggle={() => setExpandedProgram(expandedProgram === 'competitive' ? null : 'competitive')}
          />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-base font-semibold text-slate-900">Special Programs</p>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-base font-semibold mb-1.5 text-slate-900">Private Lessons</p>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              One-on-one sessions with a customised curriculum for personalised attention.
            </p>
            <div className="space-y-1.5">
              <div className="flex gap-2 text-sm text-slate-600">
                <span className="text-[#0B4F8C] font-bold shrink-0">✓</span>
                <span>45-minute sessions</span>
              </div>
              <div className="flex gap-2 text-sm text-slate-600">
                <span className="text-[#0B4F8C] font-bold shrink-0">✓</span>
                <span>Flexible scheduling</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-base font-semibold mb-1.5 text-slate-900">Aqua Mermaid</p>
            <p className="text-sm text-slate-600 mb-3 leading-relaxed">
              Unique monofin swimming experience. Burn up to 600 calories per hour!
            </p>
            <div className="space-y-1.5">
              <div className="flex gap-2 text-sm text-slate-600">
                <span className="text-[#0B4F8C] font-bold shrink-0">✓</span>
                <span>Ages 6+ years</span>
              </div>
              <div className="flex gap-2 text-sm text-slate-600">
                <span className="text-[#0B4F8C] font-bold shrink-0">✓</span>
                <span>Photoshoots available</span>
              </div>
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-6 bg-gradient-to-br from-[#08366A] to-[#0B4F8C] rounded-2xl p-6 text-center text-white">
            <p className="text-xl font-bold mb-2">Ready to Join?</p>
            <p className="text-sm mb-5 text-white/80">Sign in to view available classes and register.</p>
            <Link
              to="/signin"
              className="inline-block w-full px-6 py-3.5 bg-white text-[#0B4F8C] rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Sign In Now
            </Link>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

type ProgramColor = 'rose' | 'sky' | 'emerald' | 'violet';

const colorConfig: Record<ProgramColor, { border: string; check: string; tag: string; tagDark: string }> = {
  rose:    { border: 'border-l-rose-400',    check: 'text-rose-500',    tag: 'bg-rose-100 text-rose-700',       tagDark: 'dark:bg-rose-900/30' },
  sky:     { border: 'border-l-sky-400',     check: 'text-sky-600',     tag: 'bg-sky-100 text-sky-700',         tagDark: 'dark:bg-sky-900/30' },
  emerald: { border: 'border-l-emerald-400', check: 'text-emerald-600', tag: 'bg-emerald-100 text-emerald-700', tagDark: 'dark:bg-emerald-900/30' },
  violet:  { border: 'border-l-violet-400',  check: 'text-violet-600',  tag: 'bg-violet-100 text-violet-700',   tagDark: 'dark:bg-violet-900/30' },
};

interface ProgramCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  ageRange: string;
  color: ProgramColor;
  description: string;
  features: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ProgramCard({ icon, iconBg, title, ageRange, color, description, features, isExpanded, onToggle }: ProgramCardProps) {
  const cfg = colorConfig[color];

  return (
    <div className={`bg-white rounded-2xl border border-white shadow-sm shadow-blue-100/50 border-l-4 ${cfg.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full p-5 text-left active:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-base font-semibold text-slate-900">{title}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.tag} ${cfg.tagDark}`}>{ageRange}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
              {icon}
            </div>
            <ChevronDown className={`size-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">Key Features</p>
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className={`${cfg.check} font-bold shrink-0`}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

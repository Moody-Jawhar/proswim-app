import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Target, Eye, Lightbulb } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="About ProSwim" />

      <div className="px-4 py-6 space-y-4">

        <div className="text-center pb-2">
          <p className="text-2xl font-bold text-slate-900">About ProSwim</p>
          <p className="text-sm text-slate-500 mt-1">Swimming academy in Lebanon since 2000</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF5FF] to-[#D4E8FF] rounded-2xl p-6">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#0B4F8C]/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#0B4F8C]/5 rounded-full pointer-events-none" />
          <p className="text-base font-semibold mb-3 relative text-black">Brand Story</p>
          <p className="text-sm leading-relaxed mb-3 relative text-black/80">
            Swimming is my passion! With 25 years as a swimmer and 20+ years as a coach,
            I believe any kid can be unstoppable with quality instruction and motivation.
          </p>
          <p className="text-sm italic relative text-black/60">"The small details make the BIG DIFFERENCE!"</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-base font-semibold mb-2 text-slate-900">Our Philosophy</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            We believe there is only one of you — and that's your superpower! We customise our
            teaching style for each individual's needs, abilities, and talents.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-base font-semibold text-slate-900">Why ProSwim?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🛡️', title: 'Safety First', desc: 'Top priority in everything we do' },
              { icon: '👥', title: 'Small Classes', desc: 'Only 6 swimmers per coach' },
              { icon: '🎓', title: 'Certified', desc: 'Trained & updated professionals' },
              { icon: '📍', title: 'Locations', desc: 'Convenient across Lebanon' },
              { icon: '🎉', title: 'Fun', desc: 'Games, toys & exciting drills' },
              { icon: '🏆', title: 'Recognition', desc: 'Certificates & medals' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-4 border border-slate-100">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-sm font-semibold text-slate-900 mt-2 mb-0.5">{f.title}</p>
                <p className="text-xs text-slate-500 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <ValueCard
          icon={<Target className="size-5 text-[#0B4F8C]" />}
          title="Mission"
          color="blue"
          content={['Teach correct techniques safely', 'Build confidence & self-esteem', 'Develop goal-setting skills', 'Promote swimming as life skill']}
        />
        <ValueCard
          icon={<Eye className="size-5 text-violet-500" />}
          title="Vision"
          color="violet"
          content={['Expand across Lebanon', 'Set new standards', 'Best staff & team', 'Lasting impact on culture']}
        />
        <ValueCard
          icon={<Lightbulb className="size-5 text-amber-500" />}
          title="Goals"
          color="amber"
          content={['Build united team', 'Teach life lessons', 'Make lifetime champions', 'Strong partnerships']}
        />

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <p className="text-base font-semibold text-slate-900">Our Logo</p>
            <p className="text-xs text-slate-500 mt-0.5">Every element has meaning</p>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { k: 'BLUE',   v: 'Sky & Sea',  desc: 'Limitless potential, depth, trust, freedom' },
              { k: 'CIRCLE', v: 'Unity',      desc: 'Wholeness, infinity, perfection, ongoing energy' },
              { k: 'WATER',  v: 'Life',       desc: 'Power, strength, flexibility, embracing change' },
              { k: 'SPLASH', v: 'Energy',     desc: 'Power, dominance, supreme energy' },
            ].map((item) => (
              <details key={item.k} className="group px-5 py-3.5 cursor-pointer">
                <summary className="flex items-center justify-between select-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B4F8C] tracking-widest">{item.k}</span>
                    <span className="text-xs text-slate-400">—</span>
                    <span className="text-sm font-medium text-slate-900">{item.v}</span>
                  </div>
                  <span className="text-slate-400 text-xs group-open:hidden">+</span>
                  <span className="text-slate-400 text-xs hidden group-open:block">−</span>
                </summary>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-base font-semibold mb-4 text-slate-900">ProSwim Stands For</p>
          <div className="space-y-2">
            {[
              ['P', 'Partnership'], ['R', 'Reliability'], ['O', 'Organization'],
              ['S', 'Synergy'],     ['W', 'Welcoming'],  ['I', 'Integrity'], ['M', 'Mutuality'],
            ].map(([letter, word]) => (
              <div key={letter} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-[#0B4F8C]/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[#0B4F8C]">{letter}</span>
                </div>
                <span className="text-sm text-slate-900">{word}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <MobileNav />
    </div>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'violet' | 'amber';
  content: string[];
}

function ValueCard({ icon, title, color, content }: ValueCardProps) {
  const iconBg = color === 'blue'
    ? 'bg-blue-50'
    : color === 'violet'
    ? 'bg-violet-50'
    : 'bg-amber-50';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
      </div>
      <ul className="space-y-2">
        {content.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-600">
            <span className="text-[#0B4F8C] font-bold shrink-0 mt-px">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

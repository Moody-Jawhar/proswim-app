import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Target, Eye, Lightbulb } from 'lucide-react';

const LETTER_COLORS = [
  { bg: 'rgba(91,173,255,0.22)',  color: '#1A6FBF' },
  { bg: 'rgba(176,138,255,0.22)', color: '#6D28D9' },
  { bg: 'rgba(52,211,153,0.22)',  color: '#065F46' },
  { bg: 'rgba(251,191,36,0.22)',  color: '#92600A' },
  { bg: 'rgba(249,115,22,0.22)',  color: '#9A3412' },
  { bg: 'rgba(236,72,153,0.22)',  color: '#9D174D' },
  { bg: 'rgba(56,189,248,0.22)',  color: '#0369A1' },
];

const FEATURE_COLORS = [
  { bg: 'rgba(239,68,68,0.13)',   icon: '🛡️', title: 'Safety First',  desc: 'Top priority in everything we do' },
  { bg: 'rgba(91,173,255,0.18)',  icon: '👥', title: 'Small Classes', desc: 'Only 6 swimmers per coach' },
  { bg: 'rgba(139,92,246,0.18)',  icon: '🎓', title: 'Certified',     desc: 'Trained & updated professionals' },
  { bg: 'rgba(52,211,153,0.18)',  icon: '📍', title: 'Locations',     desc: 'Convenient across Lebanon' },
  { bg: 'rgba(251,191,36,0.20)',  icon: '🎉', title: 'Fun',           desc: 'Games, toys & exciting drills' },
  { bg: 'rgba(249,115,22,0.18)',  icon: '🏆', title: 'Recognition',   desc: 'Certificates & medals' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="About ProSwim" />

      <div className="px-4 py-6 space-y-4">

        {/* Header */}
        <div className="text-center pb-2">
          <p className="text-2xl font-bold text-slate-900">About ProSwim</p>
          <p className="text-sm text-slate-500 mt-1">Swimming academy in Lebanon since 2000</p>
        </div>

        {/* Brand Story */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg,rgba(91,173,255,0.30) 0%,rgba(176,138,255,0.25) 100%)' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(91,173,255,0.12)' }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(176,138,255,0.12)' }} />
          <p className="text-base font-bold mb-3 relative" style={{ color: '#1A4F8C' }}>Brand Story</p>
          <p className="text-sm leading-relaxed mb-3 relative text-slate-700">
            Swimming is my passion! With 25 years as a swimmer and 20+ years as a coach,
            I believe any kid can be unstoppable with quality instruction and motivation.
          </p>
          <p className="text-sm italic relative" style={{ color: '#6D28D9' }}>"The small details make the BIG DIFFERENCE!"</p>
        </div>

        {/* Our Philosophy */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.20) 0%,rgba(56,189,248,0.18) 100%)' }}
        >
          <p className="text-base font-bold mb-2" style={{ color: '#065F46' }}>Our Philosophy</p>
          <p className="text-sm leading-relaxed text-slate-700">
            We believe there is only one of you — and that's your superpower! We customise our
            teaching style for each individual's needs, abilities, and talents.
          </p>
        </div>

        {/* Why ProSwim */}
        <div className="space-y-3">
          <p className="text-base font-bold text-slate-900">Why ProSwim?</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURE_COLORS.map((f) => (
              <div key={f.title} className="rounded-2xl p-4 border border-white/60" style={{ background: f.bg }}>
                <span className="text-2xl">{f.icon}</span>
                <p className="text-sm font-semibold text-slate-900 mt-2 mb-0.5">{f.title}</p>
                <p className="text-xs text-slate-600 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <ValueCard
          icon={<Target className="size-5" style={{ color: '#3B82F6' }} />}
          title="Mission"
          bg="linear-gradient(135deg,rgba(91,173,255,0.20) 0%,rgba(59,130,246,0.15) 100%)"
          titleColor="#1D4ED8"
          dotColor="#3B82F6"
          content={['Teach correct techniques safely', 'Build confidence & self-esteem', 'Develop goal-setting skills', 'Promote swimming as life skill']}
        />

        {/* Vision */}
        <ValueCard
          icon={<Eye className="size-5" style={{ color: '#8B5CF6' }} />}
          title="Vision"
          bg="linear-gradient(135deg,rgba(176,138,255,0.22) 0%,rgba(139,92,246,0.18) 100%)"
          titleColor="#6D28D9"
          dotColor="#8B5CF6"
          content={['Expand across Lebanon', 'Set new standards', 'Best staff & team', 'Lasting impact on culture']}
        />

        {/* Goals */}
        <ValueCard
          icon={<Lightbulb className="size-5" style={{ color: '#F59E0B' }} />}
          title="Goals"
          bg="linear-gradient(135deg,rgba(251,191,36,0.22) 0%,rgba(249,115,22,0.18) 100%)"
          titleColor="#92600A"
          dotColor="#F59E0B"
          content={['Build united team', 'Teach life lessons', 'Make lifetime champions', 'Strong partnerships']}
        />

        {/* Our Logo */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <p className="text-base font-bold text-slate-900">Our Logo</p>
            <p className="text-xs text-slate-500 mt-0.5">Every element has meaning</p>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { k: 'BLUE',   v: 'Sky & Sea',  desc: 'Limitless potential, depth, trust, freedom',      color: '#3B82F6' },
              { k: 'CIRCLE', v: 'Unity',      desc: 'Wholeness, infinity, perfection, ongoing energy', color: '#8B5CF6' },
              { k: 'WATER',  v: 'Life',       desc: 'Power, strength, flexibility, embracing change',  color: '#0EA5E9' },
              { k: 'SPLASH', v: 'Energy',     desc: 'Power, dominance, supreme energy',                color: '#10B981' },
            ].map((item) => (
              <details key={item.k} className="group px-5 py-3.5 cursor-pointer">
                <summary className="flex items-center justify-between select-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-widest" style={{ color: item.color }}>{item.k}</span>
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

        {/* ProSwim Stands For */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-base font-bold mb-4 text-slate-900">ProSwim Stands For</p>
          <div className="space-y-2">
            {(
              [['P', 'Partnership'], ['R', 'Reliability'], ['O', 'Organization'],
               ['S', 'Synergy'],     ['W', 'Welcoming'],  ['I', 'Integrity'], ['M', 'Mutuality']]
            ).map(([letter, word], i) => (
              <div key={letter} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: LETTER_COLORS[i].bg }}
                >
                  <span className="text-sm font-black" style={{ color: LETTER_COLORS[i].color }}>{letter}</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{word}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact ProSwim */}
        <button
          onClick={() => window.open('https://wa.me/96178949498?text=' + encodeURIComponent('Hello ProSwim, I would like more information.'))}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-base font-bold" style={{ color: '#ffffff' }}>Contact Us on WhatsApp</span>
        </button>

      </div>

      <MobileNav />
    </div>
  );
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  bg: string;
  titleColor: string;
  dotColor: string;
  content: string[];
}

function ValueCard({ icon, title, bg, titleColor, dotColor, content }: ValueCardProps) {
  return (
    <div className="rounded-2xl p-5" style={{ background: bg }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-base font-bold" style={{ color: titleColor }}>{title}</p>
      </div>
      <ul className="space-y-2">
        {content.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-slate-700">
            <span className="font-bold shrink-0 mt-px" style={{ color: dotColor }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

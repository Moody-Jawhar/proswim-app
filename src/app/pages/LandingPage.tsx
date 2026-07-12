import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MobileNav } from "../components/MobileNav";
import {
  ArrowRight, BadgeCheck, Calendar, ChevronRight,
  MapPin, Shield, Users, Waves
} from "lucide-react";

const proswimLogo = "https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png";
const heroImage = "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1400&q=70";

export function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );
  const [userName, setUserName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
      return (u?.name ?? "").trim().split(" ")[0] ?? "";
    } catch { return ""; }
  });

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(auth);
    if (auth) {
      try {
        const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
        setUserName((u?.name ?? "").trim().split(" ")[0] ?? "");
      } catch {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-white pb-24">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">ProSwim</p>
              <p className="text-[10px] text-slate-400">Lebanon</p>
            </div>
          </div>
          {!isAuthenticated && (
            <Link to="/signin"
              className="px-4 py-2 rounded-xl bg-[#0B4F8C] text-sm font-semibold"
              style={{ color: "#ffffff" }}>
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero image — photo inside a card, text lives below it */}
      <div className="px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden" style={{ height: 240 }}>
          <img src={heroImage} alt="Swimming" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          {/* Gradient only on bottom 45% — text is there, always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020D1A]/95 via-[#020D1A]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="size-4 shrink-0" style={{ color: "#ffffff" }} />
              <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>
                Safety-first · Certified coaches
              </span>
            </div>
            <p className="text-[28px] font-bold leading-tight" style={{ color: "#ffffff" }}>
              Swimming is a <span style={{ color: "#7DD3FC" }}>life skill.</span>
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-4 pt-3 space-y-2">
        {isAuthenticated && (
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#0B4F8C] font-bold text-2xl"
            style={{ color: "#ffffff" }}>
            Continue, {userName || "swimmer"}
            <ArrowRight className="size-6" style={{ color: "#ffffff" }} />
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/programs"
            className="flex items-center justify-center py-3 rounded-2xl bg-[#EBF3FC] font-semibold text-sm text-[#0B4F8C]">
            Programs
          </Link>
          <Link to="/locations"
            className="flex items-center justify-center py-3 rounded-2xl bg-[#EBF3FC] font-semibold text-sm text-[#0B4F8C]">
            Locations
          </Link>
        </div>
      </div>

      {/* Trust strip */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: <Users className="size-3.5" />, label: "6 per coach" },
          { icon: <BadgeCheck className="size-3.5" />, label: "Certified" },
          { icon: <Calendar className="size-3.5" />, label: "Flexible" },
        ].map(({ icon, label }) => (
          <div key={label}
            className="bg-[#F5F7FA] border border-slate-100 rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            <span className="text-[#0B4F8C]">{icon}</span>
            <span className="text-xs font-medium text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Programs */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-slate-900">Programs</p>
          <Link to="/programs" className="flex items-center gap-0.5 text-sm font-medium text-[#0B4F8C]">
            See all <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          <ProgramRow
            icon={<Waves className="size-5 text-sky-500" />}
            iconBg="bg-sky-100"
            title="Learn-to-Swim (Kids)"
            sub="Ages 4+ · Beginner to intermediate"
          />
          <ProgramRow
            icon={<BadgeCheck className="size-5 text-emerald-500" />}
            iconBg="bg-emerald-100"
            title="Teen & Adult"
            sub="All levels · Technique focus"
          />
          <ProgramRow
            icon={<Shield className="size-5 text-violet-500" />}
            iconBg="bg-violet-100"
            title="Competitive Team"
            sub="Advanced · Performance training"
          />
        </div>
      </section>

      {/* Why it matters — blue card */}
      <section className="px-4 mt-6">
        <div className="bg-[#0B4F8C] rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>Why swimming matters</p>
          </div>
          <div className="grid grid-cols-3 divide-x pb-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <StatCell value="360K" label="Annual deaths" />
            <StatCell value="1–14" label="High-risk ages" />
            <StatCell value="100%" label="Preventable" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 mt-6">
        <p className="text-base font-bold text-slate-900 mb-3">How it works</p>
        <div className="space-y-2">
          <StepRow n={1} title="Choose a program & location" desc="Pick what fits your age and skill level." />
          <StepRow n={2} title="Get placed in the right group" desc="Small groups of 6, matched to your level." />
          <StepRow n={3} title="Track your milestones" desc="Structured levels, real progress, real confidence." />
        </div>
      </section>

      {/* Find a location */}
      <section className="px-4 mt-6">
        <div className="bg-[#F5F7FA] border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="size-4 text-[#0B4F8C] shrink-0" />
            <p className="text-sm font-semibold text-slate-900">Multiple locations across Lebanon</p>
          </div>
          <p className="text-sm text-slate-500 mb-4 ml-6">View pools, schedules, and availability.</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/locations"
              className="py-3 rounded-xl bg-[#0B4F8C] text-center text-sm font-semibold"
              style={{ color: "#ffffff" }}>
              View locations
            </Link>
            <Link to="/signin"
              className="py-3 rounded-xl bg-white border border-slate-200 text-center text-sm font-semibold text-slate-700">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Contact ProSwim */}
      <section className="px-4 mt-4 pb-2">
        <button
          onClick={() => window.open('https://wa.me/96170916503?text=Hello%20ProSwim%2C%20I%20would%20like%20more%20information.')}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{ backgroundColor: '#25D366' }}
        >
          {/* WhatsApp SVG icon inline */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-base font-bold" style={{ color: '#ffffff' }}>Contact ProSwim on WhatsApp</span>
        </button>
      </section>

      <MobileNav />
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center py-3 px-2">
      <p className="text-xl font-bold" style={{ color: "#ffffff" }}>{value}</p>
      <p className="text-[10px] mt-0.5 text-center" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</p>
    </div>
  );
}

function ProgramRow({
  icon, iconBg, title, sub,
}: { icon: React.ReactNode; iconBg: string; title: string; sub: string }) {
  return (
    <Link to="/programs"
      className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 active:scale-[0.98] transition-transform">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
      <ChevronRight className="size-4 text-slate-300 shrink-0" />
    </Link>
  );
}

function StepRow({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4">
      <div className="size-8 rounded-full bg-[#0B4F8C] flex items-center justify-center font-bold text-xs shrink-0"
        style={{ color: "#ffffff" }}>
        {n}
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

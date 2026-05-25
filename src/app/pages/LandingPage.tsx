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
    <div className="min-h-screen bg-white dark:bg-[#0D1B2A] pb-24">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-[#162032] border-b border-slate-100 dark:border-[#1E2F45]"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900 dark:text-white">ProSwim</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Lebanon</p>
            </div>
          </div>
          <Link to={isAuthenticated ? "/dashboard" : "/signin"}
            className="px-4 py-2 rounded-xl bg-[#0B4F8C] text-sm font-semibold"
            style={{ color: "#ffffff" }}>
            {isAuthenticated ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* Hero image — photo inside a card, text lives below it */}
      <div className="px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden" style={{ height: 240 }}>
          <img src={heroImage} alt="Swimming" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          {/* Gradient only on bottom 45% — text is there, always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020D1A]/95 via-[#020D1A]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="size-3 shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
              <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                Safety-first · Certified coaches
              </span>
            </div>
            <p className="text-[22px] font-bold leading-tight" style={{ color: "#ffffff" }}>
              Swimming is a <span style={{ color: "#7DD3FC" }}>life skill.</span>
            </p>
          </div>
        </div>
      </div>

      {/* CTAs — below the image, on white bg = no contrast problem */}
      <div className="px-4 pt-3 space-y-2">
        <Link
          to={isAuthenticated ? "/dashboard" : "/signin"}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0B4F8C] font-semibold text-sm"
          style={{ color: "#ffffff" }}>
          {isAuthenticated ? `Continue, ${userName || "swimmer"}` : "Get started"}
          <ArrowRight className="size-4" style={{ color: "#ffffff" }} />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/programs"
            className="flex items-center justify-center py-3 rounded-2xl bg-[#EBF3FC] dark:bg-[#162032] font-semibold text-sm text-[#0B4F8C] dark:text-blue-400">
            Programs
          </Link>
          <Link to="/locations"
            className="flex items-center justify-center py-3 rounded-2xl bg-[#EBF3FC] dark:bg-[#162032] font-semibold text-sm text-[#0B4F8C] dark:text-blue-400">
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
            className="bg-[#F5F7FA] dark:bg-[#162032] border border-slate-100 dark:border-[#1E2F45] rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            <span className="text-[#0B4F8C] dark:text-blue-400">{icon}</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
          </div>
        ))}
      </div>

      {/* Programs */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-slate-900 dark:text-white">Programs</p>
          <Link to="/programs" className="flex items-center gap-0.5 text-sm font-medium text-[#0B4F8C] dark:text-blue-400">
            See all <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          <ProgramRow
            icon={<Waves className="size-5 text-sky-500" />}
            iconBg="bg-sky-100 dark:bg-sky-900/20"
            title="Learn-to-Swim (Kids)"
            sub="Ages 4+ · Beginner to intermediate"
          />
          <ProgramRow
            icon={<BadgeCheck className="size-5 text-emerald-500" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/20"
            title="Teen & Adult"
            sub="All levels · Technique focus"
          />
          <ProgramRow
            icon={<Shield className="size-5 text-violet-500" />}
            iconBg="bg-violet-100 dark:bg-violet-900/20"
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
        <p className="text-base font-bold text-slate-900 dark:text-white mb-3">How it works</p>
        <div className="space-y-2">
          <StepRow n={1} title="Choose a program & location" desc="Pick what fits your age and skill level." />
          <StepRow n={2} title="Get placed in the right group" desc="Small groups of 6, matched to your level." />
          <StepRow n={3} title="Track your milestones" desc="Structured levels, real progress, real confidence." />
        </div>
      </section>

      {/* Find a location */}
      <section className="px-4 mt-6">
        <div className="bg-[#F5F7FA] dark:bg-[#162032] border border-slate-100 dark:border-[#1E2F45] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="size-4 text-[#0B4F8C] dark:text-blue-400 shrink-0" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Multiple locations across Lebanon</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 ml-6">View pools, schedules, and availability.</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/locations"
              className="py-3 rounded-xl bg-[#0B4F8C] text-center text-sm font-semibold"
              style={{ color: "#ffffff" }}>
              View locations
            </Link>
            <Link to="/signin"
              className="py-3 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-[#1E2F45] text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sign in
            </Link>
          </div>
        </div>
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
      className="flex items-center gap-3 bg-white dark:bg-[#162032] border border-slate-100 dark:border-[#1E2F45] rounded-2xl p-4 active:scale-[0.98] transition-transform">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
      <ChevronRight className="size-4 text-slate-300 dark:text-slate-600 shrink-0" />
    </Link>
  );
}

function StepRow({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 bg-white dark:bg-[#162032] border border-slate-100 dark:border-[#1E2F45] rounded-2xl p-4">
      <div className="size-8 rounded-full bg-[#0B4F8C] flex items-center justify-center font-bold text-xs shrink-0"
        style={{ color: "#ffffff" }}>
        {n}
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

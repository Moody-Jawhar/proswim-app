import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MobileNav } from "../components/MobileNav";
import { LanguageButton } from "../components/LanguageButton";
import { t } from "../i18n";
import {
  ArrowRight, BadgeCheck, Calendar,
  MapPin, Users, LogOut,
} from "lucide-react";
import { unsubscribeFromStudentTopic } from "../utils/notifications";

const proswimLogo = "https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png";
const SLIDE = (n: number) => `https://www.proswim-lb.com/Gallery/_Website/Main/Slide${n}.jpg`;

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
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)", paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center">
            <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageButton />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  try {
                    const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
                    if (u.studentId) unsubscribeFromStudentTopic(u.studentId);
                  } catch { /* ignore */ }
                  localStorage.removeItem("isAuthenticated");
                  localStorage.removeItem("currentUser");
                  localStorage.removeItem("authToken");
                  setIsAuthenticated(false);
                }}
                className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="size-5 text-slate-400" />
              </button>
            ) : (
              <Link to="/signin"
                className="px-4 py-2 rounded-xl bg-[#1e5c97] text-sm font-semibold"
                style={{ color: "#ffffff" }}>
                {t('nav.signin')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero image, photo inside a card, text lives below it */}
      <div className="px-4 pt-4">
        <div className="relative rounded-3xl overflow-hidden" style={{ height: 240 }}>
          <img src={SLIDE(1)} alt="Swimming" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: 'rgba(220,235,255,0.55)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020D1A]/95 via-[#020D1A]/50 to-transparent" />
        </div>
        <div className="pt-4 px-1">
          <h1 className="text-xl font-bold text-slate-900 leading-snug">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {t('landing.heroBody')}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-4 pt-3 space-y-2">
        {isAuthenticated && (
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(30,92,151,0.60)', color: '#ffffff', fontFamily: "'Abadi MT Condensed Extra Bold', 'Abadi MT Condensed', 'Abadi', 'Century Gothic', 'Futura', sans-serif", letterSpacing: '0.04em' }}>
            {t('landing.continue', { name: userName || t('landing.swimmer') })}
            <ArrowRight className="size-6" style={{ color: "#ffffff" }} />
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/levels"
            className="flex items-center justify-center py-3 rounded-2xl font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,rgba(167,139,250,0.55) 0%,rgba(139,92,246,0.55) 100%)' }}>
            {t('landing.viewLevels')}
          </Link>
          <a href="https://www.proswim-lb.com/"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-3 rounded-2xl font-semibold text-sm text-white"
            style={{ background: 'rgba(30,92,151,0.60)' }}>
            {t('landing.moreInfo')}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      {/* Trust strip */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: <Users className="size-3.5" />, label: t('landing.perCoach') },
          { icon: <BadgeCheck className="size-3.5" />, label: t('landing.certified') },
          { icon: <Calendar className="size-3.5" />, label: t('landing.flexible') },
        ].map(({ icon, label }) => (
          <div key={label}
            className="bg-transparent border border-slate-100 rounded-xl py-2.5 flex items-center justify-center gap-1.5">
            <span className="text-[#1e5c97]">{icon}</span>
            <span className="text-xs font-medium text-slate-600">{label}</span>
          </div>
        ))}
      </div>


      {/* ProSwim Photo Gallery */}
      <section className="mt-6">
        <p className="text-base font-bold text-slate-900 mb-3 px-4">{t('landing.gallery')}</p>
        <div
          className="flex gap-3 pl-4 overflow-x-auto"
          style={{ paddingRight: 16, paddingBottom: 4, scrollbarWidth: 'none' }}
        >
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              className="rounded-2xl overflow-hidden shrink-0"
              style={{ width: 200, height: 130 }}
            >
              <img
                src={SLIDE(n)}
                alt={`ProSwim photo ${n}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Welcome to ProSwim */}
      <section className="px-4 mt-3">
        <div className="rounded-2xl border border-slate-100 p-5" style={{ background: 'rgba(91,173,255,0.10)' }}>
          <p className="text-base font-bold text-slate-900 mb-1.5">{t('landing.welcome')}</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t('landing.welcomeBody')}
          </p>
          <a href="https://www.proswim-lb.com/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1e5c97] mt-3">
            {t('landing.visitSite')}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>


      {/* Find a location */}
      <section className="px-4 mt-6">
        <div className="bg-transparent border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="size-4 text-[#1e5c97] shrink-0" />
            <p className="text-sm font-semibold text-slate-900">{t('landing.locations')}</p>
          </div>
          <p className="text-sm text-slate-500 mb-4 ml-6">{t('landing.locationsHint')}</p>
          <Link to="/locations"
            className="block py-3 rounded-xl text-center text-sm font-semibold"
            style={{ background: 'rgba(91,173,255,0.55)', color: '#ffffff' }}>
            {t('landing.viewLocations')}
          </Link>
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
          <span className="text-base font-bold" style={{ color: '#ffffff' }}>{t('landing.whatsapp')}</span>
        </button>
      </section>

      <MobileNav />
    </div>
  );
}




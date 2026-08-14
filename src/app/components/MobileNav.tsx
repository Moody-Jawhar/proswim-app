import { Link, useLocation } from 'react-router-dom';
import { Home, Waves, User, Info, Users, GraduationCap, Newspaper, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { t } from '../i18n';
import { getStudentById } from '../api/pswmApi';

export function MobileNav() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  // Competitive-team swimmers get an extra Portfolio tab. The flag is cached
  // so the tab renders instantly; a background fetch keeps it current (and
  // follows family-switcher changes, which swap the studentId).
  const [isElite, setIsElite] = useState(() => localStorage.getItem('isElite') === 'true');

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.studentId) {
        getStudentById(user.studentId).then((s) => {
          const elite = s.studentEliteSwimmer === true;
          localStorage.setItem('isElite', elite ? 'true' : 'false');
          setIsElite(elite);
        }).catch(() => {});
      }
    } catch { /* ignore */ }
  }, [location.pathname]);

  // Signed in: the swimmer's world (Home first, Portfolio for team swimmers).
  // Signed out: the public-facing pages.
  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', icon: Home, label: t('nav.home') },
        { path: '/registrations', icon: Users, label: t('nav.group') },
        { path: '/private', icon: GraduationCap, label: t('nav.private') },
        ...(isElite ? [{ path: '/profile/portfolio', icon: Trophy, label: t('nav.portfolio') }] : []),
        { path: '/news', icon: Newspaper, label: t('nav.news') },
        { path: '/profile', icon: User, label: t('nav.profile') },
      ]
    : [
        { path: '/', icon: Home, label: t('nav.home') },
        { path: '/levels', icon: Waves, label: t('nav.levels') },
        { path: '/news', icon: Newspaper, label: t('nav.news') },
        { path: '/about', icon: Info, label: t('nav.about') },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-100 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 -2px 16px rgba(30,60,100,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      <div className="flex items-stretch h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 gap-1 active:opacity-60 transition-opacity"
            >
              <div
                className="flex items-center justify-center h-8 rounded-full transition-all"
                style={isActive ? {
                  // With 6 tabs each slot is ~62px on small phones — a 72px
                  // pill would collide with its neighbours.
                  width: navItems.length >= 6 ? 54 : 72,
                  backgroundImage: 'linear-gradient(120deg, #2d7dc4, #1e5c97)',
                  boxShadow: '0 4px 10px -4px rgba(30,92,151,0.6)',
                } : undefined}
              >
                <Icon
                  className={`size-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </div>
              <span className={`text-[10px] leading-none transition-colors ${
                isActive ? 'font-bold text-[#1e5c97]' : 'font-medium text-slate-400'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

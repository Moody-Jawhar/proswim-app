import { Link, useLocation } from 'react-router-dom';
import { Home, Waves, User, Info, Users, GraduationCap, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { t } from '../i18n';

export function MobileNav() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, [location.pathname]);

  // Signed in: the swimmer's world (5 tabs, Home first).
  // Signed out: the public-facing pages.
  const navItems = isAuthenticated
    ? [
        { path: '/dashboard', icon: Home, label: t('nav.home') },
        { path: '/registrations', icon: Users, label: t('nav.group') },
        { path: '/private', icon: GraduationCap, label: t('nav.private') },
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
                className="flex items-center justify-center w-16 h-8 rounded-full transition-all"
                style={isActive ? {
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

import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadCount, unsubscribeFromStudentTopic } from '../utils/notifications';
import { LanguageButton } from './LanguageButton';
import { t } from '../i18n';

const proswimLogo = 'https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSignOut?: boolean;
  showBack?: boolean;
  showBell?: boolean;
  /** When set, the back arrow always goes to this route instead of history-back. */
  backTo?: string;
}

export function MobileHeader({
  title,
  showLogo = false,
  showSignOut = false,
  showBack = true,
  showBell = false,
  backTo,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  // Sign-out is always available while signed in, on every screen.
  const authed = localStorage.getItem('isAuthenticated') === 'true';
  const canSignOut = showSignOut || authed;

  useEffect(() => {
    if (!showBell) return;
    setUnreadCount(getUnreadCount());
    const interval = setInterval(() => setUnreadCount(getUnreadCount()), 10000);
    return () => clearInterval(interval);
  }, [showBell]);

  const handleSignOut = () => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.studentId) unsubscribeFromStudentTopic(user.studentId);
    } catch { /* ignore */ }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-100"
      style={{
        background: 'rgba(255,255,255,0.86)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 1px 12px rgba(30,60,100,0.06)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <>
            <Link to="/" className="flex items-center">
              <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-1">
              <LanguageButton />
              {canSignOut ? (
                <button onClick={handleSignOut} className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors" aria-label="Sign Out">
                  <LogOut className="size-5 text-slate-400" />
                </button>
              ) : (
                <Link to="/signin" className="px-3 py-1.5 rounded-xl bg-[#1e5c97] text-xs font-semibold" style={{ color: '#ffffff' }}>
                  {t('nav.signin')}
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-10 flex items-center">
              {/* Every page can get back home in one tap: the arrow targets
                  the dashboard (or the welcome page when signed out) unless
                  a page passes an explicit backTo. Home itself opts out. */}
              {showBack && (
                <button
                  onClick={() => navigate(backTo || (authed ? '/dashboard' : '/'))}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="size-5 text-[#1e5c97]" />
                </button>
              )}
            </div>

            <p className="font-display flex-1 text-center text-xl font-semibold" style={{ color: '#242c43' }}>
              {title || 'ProSwim'}
            </p>

            <div className="flex items-center gap-0.5">
              <LanguageButton />
              {showBell && (
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="size-5 text-slate-500" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: '#ef4444' }}
                    />
                  )}
                </Link>
              )}
              {canSignOut ? (
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  aria-label="Sign Out"
                >
                  <LogOut className="size-5 text-slate-400" />
                </button>
              ) : (
                <Link to="/signin" className="px-3 py-1.5 rounded-xl bg-[#1e5c97] text-xs font-semibold" style={{ color: '#ffffff' }}>
                  {t('nav.signin')}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

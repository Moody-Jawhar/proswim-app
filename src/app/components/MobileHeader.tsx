import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Moon, Sun } from 'lucide-react';
const proswimLogo = 'https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png';
import { useTheme } from '../contexts/ThemeContext';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSignOut?: boolean;
  showBack?: boolean;
}

export function MobileHeader({ title, showLogo = false, showSignOut = false, showBack = false }: MobileHeaderProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white dark:bg-[#162032] border-b border-slate-100 dark:border-[#1E2F45]"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <>
            <Link to="/" className="flex items-center gap-2.5">
              <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-900 dark:text-white">ProSwim</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Swim. Safe. Strong.</p>
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-[#1E2F45] active:bg-slate-100 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light'
                ? <Moon className="size-5 text-slate-400" />
                : <Sun className="size-5 text-slate-400" />}
            </button>
          </>
        ) : (
          <>
            <div className="w-10 flex items-center">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-[#1E2F45] active:bg-slate-100 transition-colors"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="size-5 text-slate-500 dark:text-slate-400" />
                </button>
              )}
            </div>

            <p className="flex-1 text-center text-base font-semibold text-slate-900 dark:text-white">
              {title || 'ProSwim'}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-[#1E2F45] active:bg-slate-100 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light'
                  ? <Moon className="size-5 text-slate-400" />
                  : <Sun className="size-5 text-slate-400" />}
              </button>
              {showSignOut && (
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-[#1E2F45] active:bg-slate-100 transition-colors"
                  aria-label="Sign Out"
                >
                  <LogOut className="size-5 text-slate-400" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

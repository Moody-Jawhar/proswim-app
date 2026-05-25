import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
const proswimLogo = 'https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSignOut?: boolean;
  showBack?: boolean;
}

export function MobileHeader({ title, showLogo = false, showSignOut = false, showBack = false }: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white border-b border-slate-100"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {showLogo ? (
          <Link to="/" className="flex items-center gap-2.5">
            <img src={proswimLogo} alt="ProSwim" className="h-8 w-auto" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">ProSwim</p>
              <p className="text-[10px] text-slate-400">Swim. Safe. Strong.</p>
            </div>
          </Link>
        ) : (
          <>
            <div className="w-10 flex items-center">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="size-5 text-slate-500" />
                </button>
              )}
            </div>

            <p className="flex-1 text-center text-base font-semibold text-slate-900">
              {title || 'ProSwim'}
            </p>

            <div className="flex items-center gap-1">
              {showSignOut && (
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  aria-label="Sign Out"
                >
                  <LogOut className="size-5 text-slate-400" />
                </button>
              )}
              {!showSignOut && <div className="w-10" />}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

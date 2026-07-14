import { Link, useLocation } from 'react-router-dom';
import { Home, Waves, User, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileNav() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/levels', icon: Waves, label: 'Swim Levels' },
    { path: isAuthenticated ? '/profile' : '/signin', icon: User, label: isAuthenticated ? 'Profile' : 'Sign In' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50"
      style={{ boxShadow: '0 -1px 12px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
              <div className={`flex items-center justify-center w-10 h-7 rounded-full transition-all ${isActive ? 'bg-[#EBF3FC]' : ''}`}>
                <Icon
                  className={`size-5 transition-colors ${isActive ? 'text-[#0B4F8C]' : 'text-slate-400'}`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${
                isActive ? 'text-[#0B4F8C]' : 'text-slate-400'
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

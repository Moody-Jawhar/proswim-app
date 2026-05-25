import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { login, setStoredToken } from '../api/pswmApi';

const proswimLogo = 'https://www.proswim-lb.com/Gallery/_Website/Logo/ProSwimLogo.png';

const MOCK_USERS = [
  { email: 'admin@proswim.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'coach.sarah@proswim.com', password: 'coach123', name: 'Coach Sarah', role: 'coach' },
  { email: 'parent@example.com', password: 'parent123', name: 'Rania Khalil', role: 'parent' },
];

export function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const mockUser = MOCK_USERS.find((u) => u.email === username && u.password === password);
    if (mockUser) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    try {
      const res = await login(username, password);
      if (res.success && res.token) {
        setStoredToken(res.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          name: res.studentFullName, email: username, role: 'student', studentId: res.studentId,
        }));
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">

      {/* Top brand area */}
      <div className="bg-white px-6 pt-14 pb-10 text-center border-b border-slate-100">
        <img src={proswimLogo} alt="ProSwim" className="h-16 w-auto mx-auto mb-6" />
        <p className="text-2xl font-bold text-slate-900">Welcome back</p>
        <p className="text-sm text-slate-500 mt-1.5">Sign in to view your courses and progress</p>
      </div>

      <div className="flex-1 px-4 pt-6 space-y-3">

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-2">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoComplete="username" placeholder="Enter your username"
                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#0B4F8C] focus:ring-2 focus:ring-[#0B4F8C]/10 outline-none transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password" placeholder="Enter your password"
                  className="w-full px-4 py-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#0B4F8C] focus:ring-2 focus:ring-[#0B4F8C]/10 outline-none transition-all text-base"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#0B4F8C] text-white rounded-xl font-semibold text-base disabled:opacity-50 active:scale-[0.98] transition-transform">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <details className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-medium text-slate-600">Demo accounts</span>
            <ChevronDown className="size-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="border-t border-slate-100 divide-y divide-slate-50">
            {MOCK_USERS.map((u) => (
              <button key={u.email} type="button"
                onClick={() => { setUsername(u.email); setPassword(u.password); }}
                className="w-full flex items-center justify-between px-5 py-3.5 active:bg-slate-50 transition-colors">
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900 capitalize">{u.role}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                </div>
                <span className="text-xs text-[#0B4F8C] font-semibold">Use →</span>
              </button>
            ))}
          </div>
        </details>

      </div>
      <MobileNav />
    </div>
  );
}

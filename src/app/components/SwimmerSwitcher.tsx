import { useEffect, useState } from 'react';
import { ChevronDown, Check, Loader2, Users } from 'lucide-react';
import { getFamily, switchStudent, type FamilyMemberDto } from '../api/pswmApi';

function initialsOf(name: string | null): string {
  return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
}

function Avatar({ m, size }: { m: FamilyMemberDto; size: number }) {
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.6)', flexShrink: 0 }}>
      {m.studentPhotoUrl ? (
        <img src={m.studentPhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span className="font-display" style={{ color: '#1e5c97', fontSize: size * 0.36 }}>{initialsOf(m.studentFullName)}</span>
      )}
    </div>
  );
}

// One parent account, several swimmers: shows the active swimmer and lets the
// parent switch in two taps. Renders nothing for single-swimmer families.
export function SwimmerSwitcher() {
  const [family, setFamily] = useState<FamilyMemberDto[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  useEffect(() => {
    getFamily().then(setFamily).catch(() => setFamily([]));
  }, []);

  if (family.length < 2) return null;
  const current = family.find((f) => f.isCurrent) ?? family[0];

  async function pick(m: FamilyMemberDto) {
    if (m.isCurrent || switching != null) return;
    setSwitching(m.studentId);
    try {
      await switchStudent(m.studentId);
      window.location.reload();   // every screen re-fetches as the new swimmer
    } catch {
      setSwitching(null);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 active:scale-[0.97] transition-transform"
        style={{ background: 'rgba(255,255,255,0.14)' }}
      >
        <Avatar m={current} size={26} />
        <span className="text-xs font-bold" style={{ color: '#fff' }}>Switch swimmer</span>
        <ChevronDown className="size-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
      </button>

      {open && (
        <div
          onClick={() => switching == null && setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(9,20,38,0.55)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full p-5"
            style={{ borderRadius: '20px 20px 0 0', maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,92,151,0.10)' }}>
                <Users className="size-4" style={{ color: '#1e5c97' }} />
              </div>
              <p className="font-display text-base text-slate-900">My swimmers</p>
            </div>
            {family.map((m) => (
              <button
                key={m.studentId}
                onClick={() => pick(m)}
                className="w-full flex items-center gap-3 py-3 text-left"
                style={{ borderBottom: '1px solid #F1F5F9', opacity: switching != null && switching !== m.studentId ? 0.5 : 1 }}
              >
                <div className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{ width: 44, height: 44, background: 'rgba(30,92,151,0.08)', flexShrink: 0 }}>
                  {m.studentPhotoUrl ? (
                    <img src={m.studentPhotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="font-display text-sm" style={{ color: '#1e5c97' }}>{initialsOf(m.studentFullName)}</span>
                  )}
                </div>
                <div className="flex-1" style={{ minWidth: 0 }}>
                  <p className="text-sm font-bold text-slate-900">{m.studentFullName}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    {[m.studentLatestLevelName, m.locationNickName].filter(Boolean).join(' · ') || 'Swimmer'}
                  </p>
                </div>
                {switching === m.studentId ? (
                  <Loader2 className="size-4 animate-spin" style={{ color: '#1e5c97', flexShrink: 0 }} />
                ) : m.isCurrent ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#047857', flexShrink: 0 }}>
                    <Check className="size-3" /> Active
                  </span>
                ) : (
                  <span className="text-xs font-bold" style={{ color: '#1e5c97', flexShrink: 0 }}>Switch</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { getChecklist, type ChecklistItemDto } from '../api/pswmApi';
import { PageHero } from '../components/PageHero';

function getStudentId(): number | null {
  try {
    const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const id = parseInt(u.studentId);
    return Number.isFinite(id) ? id : null;
  } catch { return null; }
}

export function SkillsChecklistPage() {
  const [items, setItems] = useState<ChecklistItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const studentId = getStudentId();
    if (!studentId) {
      setError('Could not determine student ID.');
      setLoading(false);
      return;
    }
    getChecklist(studentId)
      .then(setItems)
      .catch(() => setError('Could not load checklist.'))
      .finally(() => setLoading(false));
  }, []);

  const totalChecked = items.filter(i => i.isChecked).length;

  // Group by level name, preserving order
  const groups: { level: string; items: ChecklistItemDto[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.level === item.checklistItemLevelName) {
      last.items.push(item);
    } else {
      groups.push({ level: item.checklistItemLevelName, items: [item] });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="Skills Checklist" showBack />
        <PageLoader label="Loading checklist…" />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="Skills Checklist" showBack />
      <PageHero title="Skills Checklist" subtitle="Track your swimming progress" slide={3} tint="linear-gradient(120deg, rgba(36,44,67,0.85), rgba(5,120,90,0.72))" />
      <div className="px-4 pt-3 pb-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Overall progress */}
        {items.length > 0 && (
          <div className="rounded-2xl px-5 py-5" style={{ background: 'rgba(91,173,255,0.18)' }}>
            <p className="text-xs font-semibold text-slate-500">Overall Progress</p>
            <div className="flex items-end justify-between mt-1 mb-3">
              <p className="num-stat text-3xl font-extrabold text-[#1e5c97]">
                {totalChecked} <span className="text-lg font-semibold text-slate-400">/ {items.length}</span>
              </p>
              <p className="num-stat text-sm font-semibold mb-0.5 text-slate-500">
                {Math.round((totalChecked / items.length) * 100)}% complete
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(30,92,151,0.12)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.round((totalChecked / items.length) * 100)}%`,
                  backgroundColor: '#1e5c97',
                }}
              />
            </div>
          </div>
        )}

        {items.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400 text-sm">No checklist items found.</div>
        )}

        {/* Groups */}
        {groups.map((group) => {
          const groupChecked = group.items.filter(i => i.isChecked).length;
          return (
            <div key={group.level}>
              {/* Level header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-sm font-bold text-slate-900">{group.level}</p>
                <p className="num-stat text-xs font-semibold text-[#1e5c97]">{groupChecked} / {group.items.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {group.items.map((item, idx) => (
                  <div
                    key={item.checklistItemId}
                    className={`flex items-start gap-3 px-4 py-3.5 ${
                      idx < group.items.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    {item.isChecked
                      ? <CheckSquare className="size-5 text-[#1e5c97] shrink-0 mt-0.5" />
                      : <Square className="size-5 text-slate-300 shrink-0 mt-0.5" />
                    }
                    <p className={`text-sm leading-snug flex-1 ${
                      item.isChecked ? 'text-slate-900 font-medium' : 'text-slate-400'
                    }`}>
                      {item.checklistItemText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <MobileNav />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { getChecklist, type ChecklistItemDto } from '../api/pswmApi';

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
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Skills Checklist" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading checklist…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title="Skills Checklist" showBack />
      <div className="px-4 pt-4 pb-4 space-y-4">

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Overall progress */}
        {items.length > 0 && (
          <div className="bg-[#0B4F8C] rounded-2xl px-5 py-5">
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Overall Progress</p>
            <div className="flex items-end justify-between mt-1 mb-3">
              <p className="text-3xl font-extrabold" style={{ color: '#ffffff' }}>
                {totalChecked} <span className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>/ {items.length}</span>
              </p>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {Math.round((totalChecked / items.length) * 100)}% complete
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${Math.round((totalChecked / items.length) * 100)}%`,
                  backgroundColor: '#7DD3FC',
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
                <p className="text-xs font-semibold text-[#0B4F8C]">{groupChecked} / {group.items.length}</p>
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
                      ? <CheckSquare className="size-5 text-[#0B4F8C] shrink-0 mt-0.5" />
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

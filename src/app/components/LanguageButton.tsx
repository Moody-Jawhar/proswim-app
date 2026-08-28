import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Languages, Check } from 'lucide-react';
import { getLocale, setLocale, LOCALES, t } from '../i18n';

// Globe button in the header, on every screen. Tapping opens a bottom sheet;
// picking a language saves it (web + native store) and reloads the app in it.
//
// The sheet is rendered through a PORTAL into <body>: the header uses
// backdrop-filter, which turns it into the containing block for
// position:fixed children, without the portal the sheet gets clamped
// inside the header bar (cut off at the top of the screen).
export function LanguageButton() {
  const [open, setOpen] = useState(false);
  const current = getLocale();

  const sheet = open ? createPortal(
    <div
      onClick={() => setOpen(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(9,20,38,0.55)', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full p-5"
        style={{ borderRadius: '20px 20px 0 0', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,92,151,0.10)' }}>
            <Languages className="size-4" style={{ color: '#1e5c97' }} />
          </div>
          <p className="font-display text-base text-slate-900">{t('profile.language')}</p>
        </div>
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => (l.code === current ? setOpen(false) : setLocale(l.code))}
            className="w-full flex items-center justify-between py-3.5 text-left"
            style={{ borderBottom: '1px solid #F1F5F9' }}
          >
            <span className="text-base font-bold" style={{ color: l.code === current ? '#1e5c97' : '#0F172A' }}>
              {l.label}
            </span>
            {l.code === current && <Check className="size-5" style={{ color: '#1e5c97' }} />}
          </button>
        ))}
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl bg-transparent hover:bg-slate-50 active:bg-slate-100 transition-colors"
        aria-label="Language"
      >
        <Languages className="size-5 text-slate-500" />
      </button>
      {sheet}
    </>
  );
}

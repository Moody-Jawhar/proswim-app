import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { t } from '../i18n';
import logoUrl from '../../assets/proswim-logo.png';

export interface ReceiptLine {
  label: string;
  value: string;
  strong?: boolean;
  tone?: 'paid' | 'due';
}

interface PaperReceiptProps {
  serial: string;
  location?: string | null;
  lines: ReceiptLine[];
}

const toneColor = (l: ReceiptLine) =>
  l.tone === 'paid' ? '#047857' : l.tone === 'due' ? '#DC2626' : l.strong ? '#047857' : '#0f172a';

/** The on-screen receipt: styled like the printed ProSwim receipt —
 *  logo header, dashed rules, label/value lines, thank-you footer. */
export function PaperReceipt({ serial, location, lines }: PaperReceiptProps) {
  const [busy, setBusy] = useState(false);

  return (
    <div>
      {/* The paper scrolls if tall; the download button below stays visible. */}
      <div className="rounded-2xl" style={{ border: '1px solid #E2E8F0', background: '#FDFDFB', maxHeight: '52vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col items-center pt-5 pb-3 px-4">
          <img src={logoUrl} alt="ProSwim" style={{ height: 34, width: 'auto' }} />
          <p className="text-[11px] mt-1.5" style={{ color: '#64748B' }}>
            {location ? `ProSwim — ${location}` : 'ProSwim Swimming Academy'}
          </p>
          <p className="text-[11px] font-bold mt-0.5" style={{ color: '#334155', letterSpacing: '0.08em' }}>
            {t('receipt.heading')} {serial}
          </p>
        </div>
        <div style={{ borderTop: '2px dashed #CBD5E1' }} />
        <div className="px-4 py-2">
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between items-baseline gap-3 py-1.5"
              style={{ borderBottom: i < lines.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <span className="text-xs shrink-0" style={{ color: '#94A3B8' }}>{l.label}</span>
              <span className={`text-right ${l.strong ? 'text-base font-extrabold' : 'text-sm font-semibold'}`}
                style={{ color: toneColor(l), overflowWrap: 'anywhere' }}>
                {l.value}
              </span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px dashed #CBD5E1' }} />
        <p className="text-center text-[11px] py-3" style={{ color: '#94A3B8' }}>{t('receipt.thanks')}</p>
      </div>

      <button
        onClick={async () => {
          setBusy(true);
          try { await downloadReceiptImage(serial, location ?? null, lines); } finally { setBusy(false); }
        }}
        disabled={busy}
        className="btn-grad w-full mt-3 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {t('receipt.download')}
      </button>
    </div>
  );
}

/** Renders the same receipt on a canvas and hands the PNG to the user —
 *  the iOS share sheet when available (Save to Files/Photos, WhatsApp…),
 *  otherwise a plain browser download. */
async function downloadReceiptImage(serial: string, location: string | null, lines: ReceiptLine[]) {
  const scale = 3;
  const W = 380;
  const headH = 96;
  const lineH = 30;
  const footH = 56;
  const H = headH + 18 + lines.length * lineH + 14 + footH;

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // logo (bundled asset — same origin, canvas stays clean)
  const logo = new Image();
  await new Promise<void>((resolve, reject) => {
    logo.onload = () => resolve();
    logo.onerror = () => reject(new Error('logo'));
    logo.src = logoUrl;
  });
  const logoH = 30;
  const logoW = (logo.width / logo.height) * logoH;
  ctx.drawImage(logo, (W - logoW) / 2, 16, logoW, logoH);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B';
  ctx.font = '11px -apple-system, Helvetica, Arial';
  ctx.fillText(location ? `ProSwim — ${location}` : 'ProSwim Swimming Academy', W / 2, 62);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px -apple-system, Helvetica, Arial';
  ctx.fillText(`${t('receipt.heading')} ${serial}`, W / 2, 80);

  const dash = (y: number) => {
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 16, y); ctx.stroke();
    ctx.setLineDash([]);
  };
  dash(headH);

  let y = headH + 18 + 8;
  for (const l of lines) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px -apple-system, Helvetica, Arial';
    ctx.fillText(l.label, 20, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = toneColor(l);
    ctx.font = l.strong ? 'bold 15px -apple-system, Helvetica, Arial' : 'bold 12px -apple-system, Helvetica, Arial';
    ctx.fillText(l.value, W - 20, y);
    y += lineH;
  }
  dash(y - 12);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'italic 11px -apple-system, Helvetica, Arial';
  ctx.fillText(t('receipt.thanks'), W / 2, y + 16);

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png'));
  const fileName = `ProSwim-Receipt-${serial.replace(/[^A-Za-z0-9-]/g, '')}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'ProSwim Receipt' });
      return;
    } catch { /* user closed the sheet or share failed — fall through */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

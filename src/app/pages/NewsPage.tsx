import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageLoader } from '../components/PageLoader';
import { PageHero } from '../components/PageHero';
import { Newspaper, AlertCircle, ChevronRight, X } from 'lucide-react';
import { getNews, type NewsItemDto } from '../api/pswmApi';

// Brand logo paths (24x24 viewBox) — same set as the About page.
const SOCIAL_BUTTONS = [
  {
    key: 'newsWhatsappURL' as const, label: 'WhatsApp', color: '#25D366',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
  {
    key: 'newsYoutubeURL' as const, label: 'YouTube', color: '#FF0000',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    key: 'newsFacebookURL' as const, label: 'Facebook', color: '#1877F2',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isPdf(url: string | null): boolean {
  return !!url && url.toLowerCase().split('?')[0].endsWith('.pdf');
}

/** Full-screen article reader — big image, full text. */
function NewsReader({ item, onClose }: { item: NewsItemDto; onClose: () => void }) {
  // The reader owns the screen; keep the page behind it from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 100, background: '#f5f8fb', WebkitOverflowScrolling: 'touch' }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="fixed flex items-center justify-center rounded-full active:scale-95 transition-transform"
        style={{
          top: 'calc(env(safe-area-inset-top) + 12px)',
          right: 16,
          width: 40,
          height: 40,
          zIndex: 101,
          background: 'rgba(255,255,255,0.92)',
          boxShadow: '0 4px 14px rgba(30,60,100,0.22)',
        }}
      >
        <X className="size-5" style={{ color: '#242c43' }} />
      </button>

      {item.newsImageURL && !isPdf(item.newsImageURL) && (
        <img src={item.newsImageURL} alt="" className="w-full" style={{ display: 'block' }} />
      )}

      <div className="px-5 pt-5" style={{ paddingBottom: 'calc(48px + env(safe-area-inset-bottom))' }}>
        <p className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{formatDate(item.newsDate)}</p>
        <h1 className="font-display text-2xl mt-1.5" style={{ color: '#242c43' }}>{item.newsTitle}</h1>

        {isPdf(item.newsImageURL) && (
          <button
            onClick={() => window.open(item.newsImageURL!)}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.08)' }}
          >
            <span className="text-sm font-bold" style={{ color: '#B91C1C' }}>📄 View document (PDF)</span>
          </button>
        )}

        <p className="text-base mt-4 whitespace-pre-line" style={{ color: '#3f4a5f', lineHeight: 1.65 }}>
          {item.newsBody}
        </p>

        {SOCIAL_BUTTONS.some(({ key }) => item[key]) && (
          <div className="flex flex-wrap gap-2 mt-6">
            {SOCIAL_BUTTONS.map(({ key, label, color, path }) => {
              const url = item[key];
              return url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full text-xs font-bold px-3.5 py-2 active:scale-95 transition-transform"
                  style={{ background: `${color}1A`, border: `1px solid ${color}33`, color }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
                    <path d={path} />
                  </svg>
                  {label}
                </a>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function NewsPage() {
  const [items, setItems] = useState<NewsItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<NewsItemDto | null>(null);

  useEffect(() => {
    getNews()
      .then(setItems)
      .catch(() => setError('Could not load news.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-nav">
        <MobileHeader title="News" />
        <PageLoader label="Loading…" />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-nav">
      <MobileHeader title="News" />
      <PageHero title="News" subtitle="What's happening at ProSwim" slide={3} />
      <div className="px-4 pt-3 pb-4 space-y-3">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl p-4">
            <AlertCircle className="size-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {items.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Newspaper className="size-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400">No news yet</p>
            <p className="text-xs text-slate-300 text-center px-8">
              Announcements, events and updates from ProSwim will appear here
            </p>
          </div>
        )}

        {items.map((n) => (
          <article
            key={n.newsId}
            onClick={() => setSelected(n)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:opacity-70 transition-opacity cursor-pointer"
          >
            {n.newsImageURL && (
              isPdf(n.newsImageURL) ? (
                <div
                  className="w-full flex items-center justify-center gap-2 py-3"
                  style={{ background: 'rgba(239,68,68,0.08)' }}
                >
                  <span className="text-sm font-bold" style={{ color: '#B91C1C' }}>📄 Document (PDF)</span>
                </div>
              ) : (
                <img
                  src={n.newsImageURL}
                  alt=""
                  className="w-full object-cover"
                  style={{ maxHeight: 180 }}
                  loading="lazy"
                />
              )
            )}
            <div className="p-4">
              <p className="text-xs text-slate-400">{formatDate(n.newsDate)}</p>
              <h2 className="text-sm font-bold text-slate-900 mt-1">{n.newsTitle}</h2>
              <p
                className="text-sm text-slate-500 mt-1.5 leading-snug whitespace-pre-line"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {n.newsBody}
              </p>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#1e5c97] mt-2">
                Read more
                <ChevronRight className="size-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {selected && <NewsReader item={selected} onClose={() => setSelected(null)} />}

      <MobileNav />
    </div>
  );
}
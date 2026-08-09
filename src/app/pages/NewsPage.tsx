import { useState, useEffect } from 'react';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { PageHero } from '../components/PageHero';
import { Newspaper, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { getNews, type NewsItemDto } from '../api/pswmApi';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function NewsPage() {
  const [items, setItems] = useState<NewsItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    getNews()
      .then(setItems)
      .catch(() => setError('Could not load news.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent pb-20">
        <MobileHeader title="News" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#1e5c97] animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <MobileHeader title="News" showBack />
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

        {items.map((n) => {
          const open = expanded.has(n.newsId);
          const long = n.newsBody.length > 180;
          return (
            <article
              key={n.newsId}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {n.newsImageURL && (
                <img
                  src={n.newsImageURL}
                  alt=""
                  className="w-full object-cover"
                  style={{ maxHeight: 180 }}
                  loading="lazy"
                />
              )}
              <div className="p-4">
                <p className="text-xs text-slate-400">{formatDate(n.newsDate)}</p>
                <h2 className="text-sm font-bold text-slate-900 mt-1">{n.newsTitle}</h2>
                <p
                  className="text-sm text-slate-500 mt-1.5 leading-snug whitespace-pre-line"
                  style={!open && long ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  } : undefined}
                >
                  {n.newsBody}
                </p>
                {long && (
                  <button
                    onClick={() => toggle(n.newsId)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1e5c97] mt-2"
                  >
                    {open ? 'Show less' : 'Read more'}
                    <ChevronDown
                      className="size-3.5 transition-transform"
                      style={open ? { transform: 'rotate(180deg)' } : undefined}
                    />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <MobileNav />
    </div>
  );
}
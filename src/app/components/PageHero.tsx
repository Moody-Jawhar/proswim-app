const SLIDE = (n: number) =>
  `https://www.proswim-lb.com/Gallery/_Website/Main/Slide${n}.jpg`;

interface PageHeroProps {
  title: string;
  subtitle?: string;
  slide?: 1 | 2 | 3 | 4;
  tint?: string;
  height?: number;
}

export function PageHero({
  title,
  subtitle,
  slide = 1,
  tint,
  height = 110,
}: PageHeroProps) {
  // Default overlay: the portal's brand gradient rather than a flat wash.
  const overlay = tint
    ?? 'linear-gradient(120deg, rgba(36,44,67,0.78) 0%, rgba(30,92,151,0.62) 55%, rgba(45,125,196,0.5) 100%)';
  return (
    <div className="hero-shell" style={{ height, position: 'relative', overflow: 'hidden' }}>
      <img
        src={SLIDE(slide)}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
      <div style={{ position: 'absolute', inset: 0, background: overlay }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 20px 14px',
      }}>
        <h1 className="font-display" style={{
          margin: 0, fontSize: 28, fontWeight: 600,
          color: '#fff', lineHeight: 1.1,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

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
  tint = 'rgba(11,79,140,0.58)',
  height = 110,
}: PageHeroProps) {
  return (
    <div style={{ height, position: 'relative', overflow: 'hidden' }}>
      <img
        src={SLIDE(slide)}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
      <div style={{ position: 'absolute', inset: 0, background: tint }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 20px 16px',
      }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 900,
          color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

// A one-shot bubble burst when the app opens: renders for ~2.4s, then unmounts
// completely so nothing keeps animating on content screens.
export function SplashBubbles() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), 2400);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    left: `${(i * 83) % 100}%`,
    size: 14 + ((i * 37) % 34),
    delay: `${(i % 6) * 0.12}s`,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60, overflow: 'hidden' }} aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="splash-bubble"
          style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay }}
        />
      ))}
    </div>
  );
}

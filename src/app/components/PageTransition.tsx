import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Bubble {
  id: number;
  left: number;
  bottom: number;
  size: number;
  delay: number;
  duration: number;
  alpha: number;
}

function makeBubbles(): Bubble[] {
  return Array.from({ length: 200 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    bottom: Math.random() * 60,
    size: 8 + Math.random() * 30,
    delay: Math.random() * 1200,
    duration: 1800 + Math.random() * 1200,
    alpha: 0.18 + Math.random() * 0.30,
  }));
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>(makeBubbles);

  useEffect(() => {
    // Re-trigger page-in animation without unmounting children
    const el = wrapperRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight; // force reflow
    el.style.animation = 'psPageIn 300ms cubic-bezier(0.22,1,0.36,1) both';
    // Clear the animation when done — a lingering transform on this wrapper
    // turns it into the containing block for position:fixed children,
    // un-pinning the bottom nav from the viewport.
    const clear = () => { el.style.animation = 'none'; };
    el.addEventListener('animationend', clear, { once: true });
    setBubbles(makeBubbles());
    setBubbleKey(k => k + 1);
    return () => el.removeEventListener('animationend', clear);
  }, [location.key]);

  return (
    <>
      {/* Bubble overlay — sits above everything, never blocks taps */}
      <div
        key={bubbleKey}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}
      >
        {bubbles.map(b => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              bottom: b.bottom,
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              borderRadius: '50%',
              background: `rgba(100,190,255,${(b.alpha * 0.5).toFixed(3)})`,
              border: `1.5px solid rgba(100,190,255,${b.alpha.toFixed(3)})`,
              animation: `psBubble ${b.duration}ms ease-out ${b.delay}ms both`,
            }}
          />
        ))}
      </div>

      {/* Page content */}
      <div ref={wrapperRef}>
        {children}
      </div>
    </>
  );
}

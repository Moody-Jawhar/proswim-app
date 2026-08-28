import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-trigger page-in animation without unmounting children
    const el = wrapperRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight; // force reflow
    el.style.animation = 'psPageIn 300ms cubic-bezier(0.22,1,0.36,1) both';
    // Clear the animation when done, a lingering transform on this wrapper
    // turns it into the containing block for position:fixed children,
    // un-pinning the bottom nav from the viewport.
    const clear = () => { el.style.animation = 'none'; };
    el.addEventListener('animationend', clear, { once: true });
    return () => el.removeEventListener('animationend', clear);
  }, [location.key]);

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  );
}
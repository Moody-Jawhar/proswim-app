import { Loader2 } from 'lucide-react';

// One loading treatment for every page: big spinner, vertically centered.
export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: '65vh' }}>
      <Loader2 className="animate-spin" style={{ width: 56, height: 56, color: '#1e5c97' }} />
      {label && <p className="text-sm font-semibold" style={{ color: '#64748B' }}>{label}</p>}
    </div>
  );
}

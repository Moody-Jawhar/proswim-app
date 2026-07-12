import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Loader2, AlertCircle, MapPin, Phone, Mail, Globe, Navigation } from 'lucide-react';
import { getLocationById, type LocationDetailDto } from '../api/pswmApi';

export function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<LocationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const lid = id ? parseInt(id) : NaN;
    if (!Number.isFinite(lid)) { setError('Invalid location.'); setLoading(false); return; }
    getLocationById(lid)
      .then(setLocation)
      .catch(() => setError('Could not load location details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Location" showBack />
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="size-8 text-[#0B4F8C] animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] pb-20">
        <MobileHeader title="Location" showBack />
        <div className="flex items-center gap-2 m-4 bg-red-50 border border-red-100 rounded-2xl p-4">
          <AlertCircle className="size-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error || 'Not found'}</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  const handleMap = () => {
    if (location.locationLatitude && location.locationLongitude) {
      window.open(`https://maps.google.com/?q=${location.locationLatitude},${location.locationLongitude}`);
    } else if (location.locationFullName) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(location.locationFullName + ' Lebanon')}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <MobileHeader title={location.locationNickName || 'Location'} showBack />

      <div className="px-4 pt-4 pb-4 space-y-3">
        {/* Header card */}
        <div className="bg-[#0B4F8C] rounded-2xl px-5 py-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-bold" style={{ color: '#ffffff' }}>{location.locationNickName}</p>
              {location.locationFullName && (
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{location.locationFullName}</p>
              )}
              {location.locationCity && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="size-3.5" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{location.locationCity}</p>
                </div>
              )}
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
              backgroundColor: location.locationActive ? '#22c55e' : '#64748b',
              color: '#ffffff'
            }}>
              {location.locationActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {location.locationAddress && (
            <DetailRow icon={<MapPin className="size-4 text-[#0B4F8C]" />} label="Address" value={location.locationAddress} />
          )}
          {location.locationPhone1 && (
            <DetailRow
              icon={<Phone className="size-4 text-[#0B4F8C]" />}
              label="Phone"
              value={location.locationPhone1}
              onTap={() => handleCall(location.locationPhone1!)}
              tapLabel="Call"
            />
          )}
          {location.locationPhone2 && (
            <DetailRow
              icon={<Phone className="size-4 text-[#0B4F8C]" />}
              label="Phone 2"
              value={location.locationPhone2}
              onTap={() => handleCall(location.locationPhone2!)}
              tapLabel="Call"
            />
          )}
          {location.locationEmail && (
            <DetailRow
              icon={<Mail className="size-4 text-[#0B4F8C]" />}
              label="Email"
              value={location.locationEmail}
              onTap={() => handleEmail(location.locationEmail!)}
              tapLabel="Email"
            />
          )}
        </div>

        {/* Get directions */}
        <button
          onClick={handleMap}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm py-4 active:bg-slate-50 transition-colors"
        >
          <Navigation className="size-4 text-[#0B4F8C]" />
          <span className="text-sm font-semibold text-[#0B4F8C]">Get Directions</span>
        </button>
      </div>

      <MobileNav />
    </div>
  );
}

function DetailRow({ icon, label, value, onTap, tapLabel }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onTap?: () => void;
  tapLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-b-0">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
      </div>
      {onTap && (
        <button
          onClick={onTap}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: '#EBF3FC', color: '#0B4F8C' }}
        >
          {tapLabel}
        </button>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MobileHeader } from "../components/MobileHeader";
import { MobileNav } from "../components/MobileNav";
import { Search, RefreshCw } from "lucide-react";
import { PageHero } from "../components/PageHero";
import { getLocations, type LocationDto } from "../api/pswmApi";

export function ViewAllLocations() {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return locations.filter((l) => {
      if (!l.locationActive) return false;

      return (
        !q ||
        (l.locationNickName || "").toLowerCase().includes(q) ||
        (l.locationFullName || "").toLowerCase().includes(q) ||
        (l.locationCity || "").toLowerCase().includes(q) ||
        String(l.locationId).includes(q)
      );
    });
  }, [locations, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="All Locations" showBack />
      <PageHero title="Our Locations" subtitle="Find a ProSwim pool near you" slide={2} tint="rgba(11,100,180,0.58)" />
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Search + Refresh */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white"
          />
          <button
            onClick={load}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className={`size-5 ${loading ? "animate-spin" : ""} text-gray-500`} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-white border border-red-100 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="text-sm text-gray-600">
          {filtered.length} location{filtered.length === 1 ? "" : "s"}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((l) => (
            <Link key={l.locationId} to={`/locations/${l.locationId}`} className="block active:scale-[0.98] transition-transform bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <div>
                <div className="text-base text-gray-900">{l.locationNickName}</div>
                <div className="text-sm text-gray-600">{l.locationFullName}</div>
                <div className="text-xs text-gray-500 mt-1">{l.locationCity}</div>
              </div>
            </Link>
          ))}
        </div>

        {loading && <div className="text-sm text-gray-500">Loading...</div>}
      </div>

      <MobileNav />
    </div>
  );
}

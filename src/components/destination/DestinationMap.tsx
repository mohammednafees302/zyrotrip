'use client';
import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: '100%', width: '100%' }}
      className="flex items-center justify-center bg-gray-900 animate-pulse"
    >
      <span className="text-gray-600 text-sm">Loading map…</span>
    </div>
  ),
});

interface DestinationMapProps {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

export default function DestinationMap(props: DestinationMapProps) {
  const { latitude, longitude } = props;

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
            Map
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white flex items-center gap-2">
            📍 Location
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-mono">
            {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
          </p>
        </div>

        {/* Map container */}
        <div className="rounded-3xl overflow-hidden shadow-2xl h-[420px] w-full border border-white/10">
          <MapInner {...props} />
        </div>
      </div>
    </section>
  );
}

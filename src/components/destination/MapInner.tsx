'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default marker icon in Next.js (Webpack breaks asset URLs)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom amber/gold pin marker icon
const customIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #D4AF37, #F5D66C);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 20px rgba(212,175,55,0.6), 0 0 0 4px rgba(212,175,55,0.2);
  "></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -45],
});

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
  type?: 'hotel' | 'experience' | 'attraction' | 'destination';
}

interface MapInnerProps {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  markers?: MapMarker[];
}

function BoundsFitter({ markers }: { markers: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, markers]);
  return null;
}

export default function MapInner({ latitude, longitude, name, country, markers = [] }: MapInnerProps) {
  // Always include the main destination marker
  const allMarkers = [
    { id: 'main', latitude, longitude, title: name, subtitle: country, type: 'destination' },
    ...markers
  ];
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={11}
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <BoundsFitter markers={allMarkers} />
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      {allMarkers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={customIcon}>
          <Popup
            closeButton={false}
            className="zyrotrip-popup"
          >
            <div style={{
              background: 'linear-gradient(135deg, #1a1917, #242320)',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid rgba(212,175,55,0.3)',
              minWidth: '140px',
            }}>
              {m.type && m.type !== 'destination' && (
                <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>
                  {m.type}
                </span>
              )}
              <p style={{
                color: '#D4AF37',
                fontWeight: 700,
                fontSize: '15px',
                margin: '0 0 4px 0',
                fontFamily: 'Inter, sans-serif',
              }}>
                {m.title}
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '12px',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}>
                {m.subtitle}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { formatPercent, formatTemp } from '../utils/format';

// Leaflet's default marker images are bundled as assets; point them at the CDN
// copies loaded in index.html so no bundler asset juggling is needed.
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.setView([latitude, longitude], map.getZoom() < 8 ? 9 : map.getZoom());
    }
  }, [latitude, longitude, map]);
  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      if (onPick) onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapView({ location, current, onPick, height = '28rem' }) {
  if (!location || !Number.isFinite(Number(location.latitude))) return null;
  const lat = Number(location.latitude);
  const lon = Number(location.longitude);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10" style={{ height }}>
      <MapContainer center={[lat, lon]} zoom={9} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Recenter latitude={lat} longitude={lon} />
        <ClickHandler onPick={onPick} />
        <Marker position={[lat, lon]} icon={icon}>
          <Popup>
            <p className="font-semibold">{location.label || location.name}</p>
            <p className="text-xs opacity-80">
              {lat.toFixed(4)}, {lon.toFixed(4)}
            </p>
            {current ? (
              <p className="mt-1 text-sm">
                {formatTemp(current.temperature, current.units?.temperature || '°C')} · {current.condition}
                <br />
                Rain chance {formatPercent(current.rainProbability)}
              </p>
            ) : (
              <p className="mt-1 text-sm opacity-80">Loading weather…</p>
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

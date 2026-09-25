import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

function conditionToEmoji(condition = '') {
  const value = String(condition).toLowerCase();
  if (/rain|drizzle|shower/.test(value)) return '🌧️';
  if (/thunder|storm/.test(value)) return '⛈️';
  if (/cloud|overcast/.test(value)) return '☁️';
  if (/mist|fog|haze/.test(value)) return '🌫️';
  if (/wind/.test(value)) return '💨';
  if (/snow|ice/.test(value)) return '❄️';
  if (/clear|sun|fair/.test(value)) return '☀️';
  return '🌤️';
}

function getMarkerColor(condition = '') {
  const value = String(condition).toLowerCase();
  if (/rain|drizzle|shower/.test(value)) return '#1d4ed8';
  if (/thunder|storm/.test(value)) return '#7c3aed';
  if (/cloud|overcast/.test(value)) return '#475569';
  if (/mist|fog|haze/.test(value)) return '#64748b';
  if (/wind/.test(value)) return '#0f766e';
  if (/snow|ice/.test(value)) return '#38bdf8';
  if (/clear|sun|fair/.test(value)) return '#f59e0b';
  return '#ef4444';
}

function getWeatherIcon(condition) {
  const pinColor = getMarkerColor(condition);

  return L.divIcon({
    className: 'weather-map-marker',
    html: `
      <div style="position:relative;width:34px;height:34px;transform:rotate(-45deg);border-radius:50% 50% 50% 0;border:3px solid rgba(255,255,255,0.96);background:${pinColor};box-shadow:0 6px 14px rgba(15,23,42,0.25);">
        <div style="position:absolute;inset:7px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.18);transform:rotate(45deg);font-size:14px;line-height:1;">${conditionToEmoji(condition)}</div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 30],
    popupAnchor: [0, -24],
  });
}

function FitMarkers({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(markers) || markers.length === 0) return;

    const valid = markers.filter(
      (place) => Number.isFinite(Number(place?.latitude)) && Number.isFinite(Number(place?.longitude))
    );

    if (!valid.length) return;

    const bounds = L.latLngBounds(valid.map((place) => [Number(place.latitude), Number(place.longitude)]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.45), { animate: true, duration: 0.8 });
    }
  }, [map, markers]);

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

export default function MapView({ location, current, onPick, height = '28rem', featuredLocations = [] }) {
  const { t } = useLanguage();

  const markers = useMemo(() => {
    const list = [...featuredLocations].filter(
      (place) => Number.isFinite(Number(place?.latitude)) && Number.isFinite(Number(place?.longitude))
    );

    if (location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))) {
      const alreadySelected = list.some(
        (place) => Number(place.latitude) === Number(location.latitude) && Number(place.longitude) === Number(location.longitude)
      );
      if (!alreadySelected) list.push(location);
    }

    return list;
  }, [featuredLocations, location]);

  const defaultCenter = markers.length ? [Number(markers[0].latitude), Number(markers[0].longitude)] : [20, 0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10" style={{ height }}>
      <MapContainer center={defaultCenter} zoom={2} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitMarkers markers={markers} />
        {onPick ? <ClickHandler onPick={onPick} /> : null}

        {markers.map((item, index) => {
          const lat = Number(item.latitude);
          const lon = Number(item.longitude);
          const isSelectedLocation =
            location &&
            Number.isFinite(Number(location.latitude)) &&
            Number.isFinite(Number(location.longitude)) &&
            Number(item.latitude) === Number(location.latitude) &&
            Number(item.longitude) === Number(location.longitude);
          const itemCurrent = item.current ?? (isSelectedLocation ? current : null);
          const emoji = conditionToEmoji(itemCurrent?.condition);

          return (
            <Marker
              key={`${item.name || item.city || 'place'}-${index}`}
              position={[lat, lon]}
              icon={getWeatherIcon(itemCurrent?.condition || 'clear')}
            >
              <Popup>
                <p className="font-semibold">{item.label || item.name || item.city}</p>
                <p className="mt-1 text-sm">
                  {emoji} {itemCurrent ? itemCurrent.condition : t('map.loading')}
                </p>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import LocationSearch from '../components/LocationSearch';
import RiskBadge from '../components/RiskBadge';
import { LoadingBlock } from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import weatherService from '../services/weatherService';
import { formatPercent, formatTemp, locationLabel } from '../utils/format';

export default function MapPage() {
  const { t } = useLanguage();
  const { location, setLocation } = useLocation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!location) return undefined;
    setLoading(true);
    weatherService
      .forecast(location.latitude, location.longitude, location.name)
      .then((data) => !cancelled && setWeather(data))
      .catch(() => !cancelled && setWeather(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [location]);

  // Clicking the map picks a point; we name it by reverse geocoding.
  const pickPoint = async (lat, lon) => {
    try {
      const place = await weatherService.reverseGeocode(lat, lon);
      setLocation(place);
    } catch {
      setLocation({ name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, latitude: lat, longitude: lon });
    }
  };

  const current = weather?.current;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white">{t('nav.map')}</h1>
      <p className="mt-1 text-mist-300">Search for a place, or tap anywhere on the map to read its weather.</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <div className="mb-3 max-w-md">
            <LocationSearch onSelect={setLocation} />
          </div>
          <MapView
            latitude={location?.latitude}
            longitude={location?.longitude}
            onPick={pickPoint}
            popup={
              <div>
                <p className="font-semibold">{locationLabel(location)}</p>
                {current ? (
                  <p className="mt-1 text-sm">
                    {formatTemp(current.temperature)} · {current.condition}
                  </p>
                ) : (
                  <p className="mt-1 text-sm">Loading weather…</p>
                )}
              </div>
            }
          />
        </div>

        <aside className="panel h-fit p-5">
          <p className="text-sm text-mist-300">Selected location</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">{locationLabel(location)}</h2>
          <p className="mt-1 text-xs text-mist-400">
            {Number(location?.latitude).toFixed(4)}, {Number(location?.longitude).toFixed(4)}
          </p>

          {loading ? (
            <div className="mt-4"><LoadingBlock label={t('loading.weather')} /></div>
          ) : current ? (
            <>
              <p className="mt-4 font-display text-4xl font-extrabold text-white">{formatTemp(current.temperature)}</p>
              <p className="text-mist-200">{current.condition}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="panel-tight p-3">
                  <dt className="text-mist-400">{t('weather.feelsLike')}</dt>
                  <dd className="mt-1 font-semibold text-white">{formatTemp(current.feelsLike)}</dd>
                </div>
                <div className="panel-tight p-3">
                  <dt className="text-mist-400">{t('weather.rainChance')}</dt>
                  <dd className="mt-1 font-semibold text-white">{formatPercent(current.rainProbability)}</dd>
                </div>
                <div className="panel-tight p-3">
                  <dt className="text-mist-400">{t('weather.humidity')}</dt>
                  <dd className="mt-1 font-semibold text-white">{formatPercent(current.humidity)}</dd>
                </div>
                <div className="panel-tight p-3">
                  <dt className="text-mist-400">{t('weather.wind')}</dt>
                  <dd className="mt-1 font-semibold text-white">{current.windSpeed} {current.units?.wind || 'km/h'}</dd>
                </div>
              </dl>
              {weather?.risk ? (
                <div className="mt-4 flex items-center gap-2">
                  <RiskBadge level={weather.risk.level} />
                  <span className="text-sm text-mist-300">{weather.risk.type}</span>
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-4 text-sm text-mist-300">{t('empty.weather')}</p>
          )}

          <Link to="/weather-gpt" className="btn-ghost mt-5 w-full">Ask about this place</Link>
          <p className="mt-3 text-xs text-mist-400">Map tiles © OpenStreetMap contributors. Weather: Open-Meteo.</p>
        </aside>
      </div>
    </div>
  );
}

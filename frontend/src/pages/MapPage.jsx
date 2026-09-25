import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../components/MapView';
import LocationSearch from '../components/LocationSearch';
import RiskBadge from '../components/RiskBadge';
import { LoadingBlock } from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import weatherService from '../services/weatherService';
import { formatPercent, formatTemp, locationLabel } from '../utils/format';
import { translateWeatherCondition } from '../i18n/localeData';

const FEATURED_LOCATIONS = [
  { name: 'Delhi', city: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Mumbai', city: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Bengaluru', city: 'Bengaluru', country: 'India', latitude: 12.9719, longitude: 77.5937 },
  { name: 'Kolkata', city: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Chennai', city: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Hyderabad', city: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867 },
  { name: 'Jaipur', city: 'Jaipur', country: 'India', latitude: 26.9124, longitude: 75.7873 },
];

export default function MapPage() {
  const { t, language } = useLanguage();
  const { location, setLocation } = useLocation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [featuredWeather, setFeaturedWeather] = useState({});

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

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      FEATURED_LOCATIONS.map(async (place) => {
        try {
          const data = await weatherService.forecast(place.latitude, place.longitude, place.name);
          return { ...place, current: data?.current || null, label: `${place.city}, ${place.country}` };
        } catch {
          return { ...place, current: null, label: `${place.city}, ${place.country}` };
        }
      })
    )
      .then((results) => {
        if (!cancelled) {
          setFeaturedWeather(Object.fromEntries(results.map((place) => [place.name, place])));
        }
      })
      .catch(() => {
        if (!cancelled) setFeaturedWeather({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredLocations = useMemo(
    () => FEATURED_LOCATIONS.map((place) => ({ ...place, ...(featuredWeather[place.name] || {}) })),
    [featuredWeather]
  );

  const normalizePlace = (next) => {
    if (!next) return null;
    return {
      ...next,
      name: next.name || next.city || 'Selected location',
      label: next.label || [next.name || next.city, next.state, next.country].filter(Boolean).join(', '),
      latitude: Number(next.latitude),
      longitude: Number(next.longitude),
    };
  };

  const loadForecastForPlace = async (nextPlace) => {
    const place = normalizePlace(nextPlace);
    if (!place || !Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;

    setLocation(place);
    setLoading(true);
    try {
      const data = await weatherService.forecast(place.latitude, place.longitude, place.name);
      setWeather(data);
    } catch {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const pickPoint = async (lat, lon) => {
    try {
      const place = await weatherService.reverseGeocode(lat, lon);
      loadForecastForPlace(place);
    } catch {
      loadForecastForPlace({ name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, latitude: lat, longitude: lon });
    }
  };

  const current = weather?.current;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white">{t('nav.map')}</h1>
      <p className="mt-1 text-mist-300">{t('map.description')}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <div className="mb-3 max-w-md">
            <LocationSearch onSelect={loadForecastForPlace} />
          </div>
          <MapView
            location={location}
            current={current}
            featuredLocations={featuredLocations}
            onPick={pickPoint}
          />
        </div>

        <aside className="panel h-fit p-5">
          <p className="text-sm text-mist-300">{t('map.selected')}</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">{locationLabel(location)}</h2>
          <p className="mt-1 text-xs text-mist-400">
            {Number(location?.latitude).toFixed(4)}, {Number(location?.longitude).toFixed(4)}
          </p>

          {loading ? (
            <div className="mt-4"><LoadingBlock label={t('loading.weather')} /></div>
          ) : current ? (
            <>
              <p className="mt-4 font-display text-4xl font-extrabold text-white">{formatTemp(current.temperature)}</p>
              <p className="text-mist-200">{translateWeatherCondition(language, current.condition)}</p>
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

          <Link to="/weather-gpt" className="btn-ghost mt-5 w-full">{t('map.ask')}</Link>
          <p className="mt-3 text-xs text-mist-400">{t('map.attribution')}</p>
        </aside>
      </div>
    </div>
  );
}

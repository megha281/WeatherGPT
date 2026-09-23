import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, Star } from 'lucide-react';
import CurrentWeather from '../components/CurrentWeather';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import WeatherCharts from '../components/WeatherCharts';
import RiskPanel from '../components/RiskPanel';
import AlertCard from '../components/AlertCard';
import LocationSearch from '../components/LocationSearch';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { LoadingBlock, SkeletonCard } from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import useWeather from '../hooks/useWeather';
import userService from '../services/userService';
import chatService from '../services/chatService';
import weatherService from '../services/weatherService';
import { locationLabel, relativeTime } from '../utils/format';

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.morning';
  if (hour < 17) return 'dashboard.afternoon';
  return 'dashboard.evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { location, setLocation } = useLocation();
  const unit = user?.preferences?.temperatureUnit || 'celsius';
  const { data, loading, error, reload } = useWeather(location, { unit });

  const [saved, setSaved] = useState([]);
  const [recent, setRecent] = useState([]);
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    userService.locations().then(setSaved).catch(() => setSaved([]));
    chatService.history().then((list) => setRecent(list.slice(0, 5))).catch(() => setRecent([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAlerts(null);
    if (!location) return undefined;
    weatherService
      .alerts(location.latitude, location.longitude, location.name)
      .then((res) => !cancelled && setAlerts(res))
      .catch(() => !cancelled && setAlerts(null));
    return () => {
      cancelled = true;
    };
  }, [location]);

  const activeAlerts = [...(alerts?.official || []), ...(alerts?.stored || []), ...(alerts?.generated || [])].slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-signal-400">{t(greetingKey())}</p>
          <h1 className="font-display text-3xl font-bold text-white">
            {t('dashboard.greeting')}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-mist-300">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {locationLabel(location)}
          </p>
        </div>
        <Link to="/weather-gpt" className="btn-primary">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {t('nav.chat')}
        </Link>
      </div>

      <div className="mt-5 max-w-xl">
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <>
              <LoadingBlock label={t('loading.weather')} />
              <SkeletonCard lines={4} />
            </>
          ) : data ? (
            <>
              <CurrentWeather current={data.current} location={location} />
              <HourlyForecast hourly={data.hourly} />
              <WeatherCharts hourly={data.hourly} />
              <DailyForecast daily={data.daily} />
            </>
          ) : (
            <EmptyState title={t('empty.weather')} description="Search for a place to start." />
          )}
        </div>

        <aside className="space-y-6">
          {data?.risk ? <RiskPanel risk={data.risk} /> : null}

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">{t('nav.alerts')}</h2>
              <Link to="/alerts" className="text-sm text-signal-400 hover:underline">See all</Link>
            </div>
            <div className="mt-3 space-y-3">
              {alerts === null ? (
                <LoadingBlock label={t('loading.alerts')} />
              ) : activeAlerts.length ? (
                activeAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              ) : (
                <p className="text-sm text-mist-300">{t('empty.alerts')}</p>
              )}
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">{t('dashboard.savedLocations')}</h2>
              <Link to="/saved-locations" className="text-sm text-signal-400 hover:underline">Manage</Link>
            </div>
            {saved.length ? (
              <ul className="mt-3 space-y-2">
                {saved.slice(0, 6).map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => setLocation(place)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-mist-200 hover:bg-night-700 hover:text-white"
                    >
                      <Star className="h-4 w-4 text-signal-400" aria-hidden="true" />
                      <span className="truncate">{place.name}</span>
                      <span className="ml-auto truncate text-xs text-mist-400">{place.city || place.state}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-mist-300">{t('empty.savedLocations')}</p>
            )}
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="section-title">{t('dashboard.recentQuestions')}</h2>
              <Link to="/chat-history" className="text-sm text-signal-400 hover:underline">All</Link>
            </div>
            {recent.length ? (
              <ul className="mt-3 space-y-2">
                {recent.map((chat) => (
                  <li key={chat.id}>
                    <Link
                      to={`/chat-history/${chat.id}`}
                      className="block rounded-xl px-3 py-2 text-sm text-mist-200 hover:bg-night-700 hover:text-white"
                    >
                      <span className="line-clamp-1">{chat.title}</span>
                      <span className="text-xs text-mist-400">{relativeTime(chat.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-mist-300">{t('empty.conversations')}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

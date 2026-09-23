import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, RefreshCw } from 'lucide-react';
import LocationSearch from '../components/LocationSearch';
import CurrentWeather from '../components/CurrentWeather';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import WeatherCharts from '../components/WeatherCharts';
import RiskPanel from '../components/RiskPanel';
import ModelComparison from '../components/ModelComparison';
import SourceList from '../components/SourceList';
import ErrorState from '../components/ErrorState';
import { LoadingBlock, SkeletonCard } from '../components/Loading';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import useWeather from '../hooks/useWeather';
import weatherService from '../services/weatherService';
import { locationLabel } from '../utils/format';

export default function Weather() {
  const { location, setLocation } = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const unit = user?.preferences?.temperatureUnit || 'celsius';
  const { data, loading, error, reload } = useWeather(location, { unit });
  const [models, setModels] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setModels(null);
    if (!location) return undefined;
    weatherService
      .models(location.latitude, location.longitude, 3)
      .then((res) => !cancelled && setModels(res))
      .catch(() => {
        /* Model comparison is optional; the page works without it. */
      });
    return () => {
      cancelled = true;
    };
  }, [location]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{t('weather.current')}</h1>
          <p className="mt-1 text-mist-300">{locationLabel(location)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reload} className="btn-ghost">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t('common.refresh')}
          </button>
          <Link to="/weather-gpt" className="btn-primary">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            {t('nav.chat')}
          </Link>
        </div>
      </div>

      <div className="mt-5 max-w-xl">
        <LocationSearch onSelect={setLocation} />
      </div>

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading ? (
        <div className="mt-8 space-y-4">
          <LoadingBlock label={t('loading.weather')} />
          <SkeletonCard lines={4} />
        </div>
      ) : data ? (
        <div className="mt-8 space-y-6">
          <CurrentWeather current={data.current} location={location} />
          <RiskPanel risk={data.risk} />
          <HourlyForecast hourly={data.hourly} />
          <WeatherCharts hourly={data.hourly} />
          <DailyForecast daily={data.daily} />
          <ModelComparison data={models?.data} note={models?.note} />
          <SourceList
            sources={[
              { kind: t('weather.sourceData'), name: 'Open-Meteo', url: 'https://open-meteo.com' },
              { kind: t('weather.riskAnalysis'), name: t('weather.riskEngine') },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

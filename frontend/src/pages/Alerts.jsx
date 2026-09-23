import { useEffect, useState } from 'react';
import { BadgeCheck, Bot, ShieldAlert } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import LocationSearch from '../components/LocationSearch';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { LoadingBlock } from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import weatherService from '../services/weatherService';
import { formatTime, locationLabel } from '../utils/format';

export default function Alerts() {
  const { t } = useLanguage();
  const { location, setLocation } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    weatherService
      .alerts(location.latitude, location.longitude, location.name)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [location]);

  const official = [...(data?.official || []), ...(data?.stored || []).filter((a) => a.sourceType === 'official')];
  const generated = [...(data?.generated || []), ...(data?.stored || []).filter((a) => a.sourceType !== 'official')];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white">{t('nav.alerts')}</h1>
      <p className="mt-1 text-mist-300">{locationLabel(location)}</p>

      <div className="mt-5 max-w-xl">
        <LocationSearch onSelect={setLocation} />
      </div>

      {error ? (
        <div className="mt-8"><ErrorState message={error} onRetry={load} /></div>
      ) : loading ? (
        <div className="mt-8"><LoadingBlock label={t('loading.alerts')} /></div>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <BadgeCheck className="h-5 w-5 text-risk-severe" aria-hidden="true" />
              {t('alerts.official')}
            </h2>
            <p className="mt-1 text-sm text-mist-300">{data?.officialCoverage}</p>
            <div className="mt-4 space-y-4">
              {official.length ? (
                official.map((alert) => <AlertCard key={alert.id} alert={{ ...alert, sourceType: 'official' }} />)
              ) : (
                <EmptyState
                  icon={ShieldAlert}
                  title="No official warning is in force here"
                  description="Nothing has been published for this point through the feeds this build can read."
                />
              )}
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <Bot className="h-5 w-5 text-signal-400" aria-hidden="true" />
              {t('alerts.generated')}
            </h2>
            <p className="mt-1 text-sm text-mist-300">{t('risk.notOfficial')}</p>
            <div className="mt-4 space-y-4">
              {generated.length ? (
                generated.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              ) : (
                <EmptyState title={t('empty.alerts')} description="Nothing in the next seven days crosses a risk threshold here." />
              )}
            </div>
          </section>

          {data?.checkedAt ? (
            <p className="text-xs text-mist-400">Checked {formatTime(data.checkedAt, { withDate: true })}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

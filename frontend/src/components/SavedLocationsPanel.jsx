import { useCallback, useEffect, useState } from 'react';
import { Bookmark, MapPin, Plus, Trash2 } from 'lucide-react';
import userService from '../services/userService';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import LocationSearch from './LocationSearch';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { LoadingBlock, Spinner } from './Loading';

/**
 * Saved places for the signed-in user. Used on the dashboard (compact) and on
 * the /saved-locations page (with the add form).
 */
export default function SavedLocationsPanel({ allowAdd = true, compact = false }) {
  const { t } = useLanguage();
  const { setLocation, location: active } = useLocation();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const [picked, setPicked] = useState(null);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLocations(await userService.locations());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!picked) return;
    setPending('add');
    setMessage(null);
    try {
      await userService.addLocation({
        name: label.trim() || picked.name,
        city: picked.city || picked.name,
        state: picked.state || '',
        country: picked.country || '',
        latitude: picked.latitude,
        longitude: picked.longitude,
      });
      setPicked(null);
      setLabel('');
      setMessage(t('locations.saved'));
      await load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPending(null);
    }
  };

  const remove = async (id) => {
    setPending(id);
    try {
      await userService.deleteLocation(id);
      setLocations((list) => list.filter((l) => l.id !== id));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPending(null);
    }
  };

  if (loading) return <LoadingBlock label="Loading saved locations…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="panel p-5">
      <h2 className="section-title flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-signal-400" aria-hidden="true" />
        {t('dashboard.savedLocations')}
      </h2>

      {allowAdd ? (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-night-900/40 p-4">
          <LocationSearch showMyLocation={false} onSelect={(place) => setPicked(place)} />
          {picked ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[12rem] flex-1">
                <label className="label" htmlFor="saved-label">
                  {t('locations.label')}
                </label>
                <input
                  id="saved-label"
                  className="field"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t('locations.labelPlaceholder', { name: picked.name })}
                />
              </div>
              <button type="button" onClick={add} className="btn-primary" disabled={pending === 'add'}>
                {pending === 'add' ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {t('common.save')}
              </button>
            </div>
          ) : null}
          {message ? <p className="text-sm text-mist-300">{message}</p> : null}
        </div>
      ) : null}

      {locations.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={MapPin} title={t('empty.savedLocations')} description={t('locations.saveHint')} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-2">
          {locations.slice(0, compact ? 5 : locations.length).map((place) => {
            const isActive =
              active && Math.abs(active.latitude - place.latitude) < 0.01 && Math.abs(active.longitude - place.longitude) < 0.01;
            return (
              <li
                key={place.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  isActive ? 'border-signal-500/60 bg-signal-500/5' : 'border-white/10 bg-night-900/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLocation({ ...place, label: [place.city, place.state, place.country].filter(Boolean).join(', ') })}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-signal-400" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-mist-100">{place.name}</span>
                    <span className="block truncate text-xs text-mist-400">
                      {[place.city, place.state, place.country].filter(Boolean).join(', ')}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(place.id)}
                  className="btn-quiet px-2"
                  aria-label={`${t('common.delete')} ${place.name}`}
                  disabled={pending === place.id}
                >
                  {pending === place.id ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

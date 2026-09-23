import { useEffect, useRef, useState } from 'react';
import { Crosshair, MapPin, Search } from 'lucide-react';
import weatherService from '../services/weatherService';
import useDebounce from '../hooks/useDebounce';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { Spinner } from './Loading';

/** Type-ahead search over the Open-Meteo geocoding API. */
export default function LocationSearch({ onSelect, autoFocus = false, showMyLocation = true, className = '' }) {
  const { t } = useLanguage();
  const { setLocation, useMyLocation, locating, locationError } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounced = useDebounce(query, 350);
  const boxRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (debounced.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    setError(null);
    weatherService
      .searchLocations(debounced.trim())
      .then((found) => {
        if (cancelled) return;
        setResults(found);
        setOpen(true);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const onClickAway = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const choose = (place) => {
    setLocation(place);
    setQuery('');
    setResults([]);
    setOpen(false);
    if (onSelect) onSelect(place);
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            placeholder={t('common.searchPlaceholder')}
            className="field pl-10"
            aria-label={t('common.searchPlaceholder')}
          />
          {loading ? (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-signal-400">
              <Spinner />
            </span>
          ) : null}
        </div>
        {showMyLocation ? (
          <button type="button" onClick={useMyLocation} className="btn-ghost shrink-0" disabled={locating}>
            {locating ? <Spinner /> : <Crosshair className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{t('common.useMyLocation')}</span>
          </button>
        ) : null}
      </div>

      {locationError ? <p className="mt-2 text-sm text-risk-moderate">{locationError}</p> : null}
      {error ? <p className="mt-2 text-sm text-risk-severe">{error}</p> : null}

      {open ? (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-night-800 shadow-panel">
          {results.length === 0 && !loading ? (
            <li className="px-4 py-3 text-sm text-mist-300">
              {t('locations.noMatch', { query: debounced })}
            </li>
          ) : null}
          {results.map((place) => (
            <li key={`${place.id || place.name}-${place.latitude}`}>
              <button
                type="button"
                onClick={() => choose(place)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-night-700"
              >
                <MapPin className="h-4 w-4 shrink-0 text-signal-400" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-mist-100">{place.name}</span>
                  <span className="block truncate text-xs text-mist-400">
                    {[place.state, place.district, place.country].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-xs text-mist-400">
                  {Number(place.latitude).toFixed(2)}, {Number(place.longitude).toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

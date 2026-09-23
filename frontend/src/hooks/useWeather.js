import { useCallback, useEffect, useState } from 'react';
import weatherService from '../services/weatherService';

/**
 * Loads the full forecast bundle (current + hourly + daily + risk) for a
 * location and keeps loading and error states for the UI.
 */
export default function useWeather(location, { unit = 'celsius' } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(location));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!location || !Number.isFinite(Number(location.latitude))) return;
    setLoading(true);
    setError(null);
    try {
      const result = await weatherService.forecast(location.latitude, location.longitude, location.name, unit);
      setData(result);
    } catch (err) {
      setError(err.message || 'Could not load weather for this location.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [location, unit]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import weatherService from '../services/weatherService';
import { formatDay, formatNumber, formatPercent, formatTemp } from '../utils/format';
import { LoadingBlock } from './Loading';

/**
 * Side-by-side view of the forecast models Open-Meteo publishes for this point.
 * Models with no data are skipped rather than filled in.
 */
export default function ModelComparison({ location }) {
  const [state, setState] = useState({ loading: true, data: null, note: '', error: null });

  useEffect(() => {
    let cancelled = false;
    if (!location) return undefined;
    setState((s) => ({ ...s, loading: true, error: null }));
    weatherService
      .models(location.latitude, location.longitude, 3)
      .then((res) => !cancelled && setState({ loading: false, data: res.data, note: res.note, error: null }))
      .catch((err) => !cancelled && setState({ loading: false, data: null, note: '', error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [location]);

  if (state.loading) return <LoadingBlock label="Comparing forecast models…" />;
  if (state.error || !state.data?.models?.length) return null;

  const dates = state.data.models[0].days.map((d) => d.date);

  return (
    <section className="panel p-5">
      <h2 className="section-title flex items-center gap-2">
        <Layers className="h-5 w-5 text-signal-400" aria-hidden="true" />
        Multi-model comparison
      </h2>
      <p className="mt-1 text-sm text-mist-400">{state.note}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-mist-400">
              <th className="py-2 pr-4">Model</th>
              {dates.map((date) => (
                <th key={date} className="py-2 pr-4">{formatDay(date)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.data.models.map((model) => (
              <tr key={model.modelId} className="border-t border-white/10">
                <td className="py-3 pr-4 text-mist-100">{model.model}</td>
                {model.days.map((day) => (
                  <td key={day.date} className="py-3 pr-4 text-mist-200">
                    <span className="block text-white">
                      {formatTemp(day.maxTemp)} / {formatTemp(day.minTemp)}
                    </span>
                    <span className="block text-xs text-mist-400">
                      {formatPercent(day.rainProbability)} · {formatNumber(day.precipitationSum)} mm
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-mist-400">
        Source: Open-Meteo. Values are each model’s own output for this point — where they disagree, confidence is lower.
      </p>
    </section>
  );
}

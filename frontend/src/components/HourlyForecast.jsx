import { useLanguage } from '../context/LanguageContext';
import { formatHour, formatNumber, formatPercent, formatTemp } from '../utils/format';
import { weatherIcon } from '../utils/weatherVisuals';

export default function HourlyForecast({ hourly }) {
  const { t } = useLanguage();
  const hours = hourly?.hours || [];
  if (!hours.length) return null;

  const unit = hourly.units?.temperature || '°C';

  return (
    <section className="panel p-5">
      <h2 className="section-title">{t('weather.hourly')}</h2>
      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto pb-2">
        {hours.map((hour, index) => {
          const Icon = weatherIcon(hour.icon);
          return (
            <div
              key={hour.time}
              className="min-w-[84px] flex-1 rounded-xl border border-white/10 bg-night-900/40 px-3 py-3 text-center"
            >
              <p className="text-xs text-mist-400">{index === 0 ? t('common.now') : formatHour(hour.time)}</p>
              <Icon className="mx-auto my-2 h-5 w-5 text-signal-400" aria-hidden="true" />
              <p className="font-display text-base font-bold text-white">{formatTemp(hour.temperature, unit)}</p>
              <p className="mt-1 text-xs text-signal-400">{formatPercent(hour.rainProbability)}</p>
              <p className="text-[11px] text-mist-400">{formatNumber(hour.windSpeed)} km/h</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-mist-400">Scroll for the full 24 hours. Rain chance is the percentage under each hour.</p>
    </section>
  );
}

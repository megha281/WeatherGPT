import { useLanguage } from '../context/LanguageContext';
import { formatDay, formatNumber, formatPercent, formatTemp } from '../utils/format';
import { weatherIcon } from '../utils/weatherVisuals';
import { translateWeatherCondition } from '../i18n/localeData';

export default function DailyForecast({ daily, onSelectDay }) {
  const { t, locale, language } = useLanguage();
  const days = daily?.days || [];
  if (!days.length) return null;

  const unit = daily.units?.temperature || '°C';
  const allMin = Math.min(...days.map((d) => d.minTemp ?? 0));
  const allMax = Math.max(...days.map((d) => d.maxTemp ?? 0));
  const span = Math.max(1, allMax - allMin);

  return (
    <section className="panel p-5">
      <h2 className="section-title">{t('weather.daily')}</h2>
      <ul className="mt-3 divide-y divide-white/5">
        {days.map((day) => {
          const Icon = weatherIcon(day.icon);
          const left = ((day.minTemp - allMin) / span) * 100;
          const width = Math.max(6, ((day.maxTemp - day.minTemp) / span) * 100);
          return (
            <li key={day.date}>
              <button
                type="button"
                onClick={() => onSelectDay && onSelectDay(day)}
                className="grid w-full grid-cols-[86px_28px_1fr_auto] items-center gap-3 py-3 text-left hover:bg-white/5"
              >
                <span className="text-sm text-mist-200">{formatDay(day.date, { locale: locale.locale, todayLabel: t('common.today'), tomorrowLabel: t('common.tomorrow') })}</span>
                <Icon className="h-5 w-5 text-signal-400" aria-hidden="true" />
                <span className="flex items-center gap-3">
                  <span className="hidden text-xs text-mist-400 sm:inline">{formatTemp(day.minTemp, '')}</span>
                  <span className="relative h-1.5 w-full max-w-[160px] rounded-full bg-white/10">
                    <span
                      className="absolute h-1.5 rounded-full bg-gradient-to-r from-signal-500 to-risk-moderate"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </span>
                  <span className="hidden text-xs text-mist-100 sm:inline">{formatTemp(day.maxTemp, '')}</span>
                </span>
                <span className="text-right">
                  <span className="block text-sm text-signal-400">{formatPercent(day.rainProbability)}</span>
                  <span className="block text-xs text-mist-400">{formatNumber(day.precipitationSum)} mm</span>
                </span>
              </button>
              <p className="pb-3 text-xs text-mist-400 sm:hidden">
                {translateWeatherCondition(language, day.condition)} · {formatTemp(day.minTemp, unit)} – {formatTemp(day.maxTemp, unit)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

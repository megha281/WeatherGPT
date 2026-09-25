import { Droplets, Eye, Gauge, Sunrise, Sunset, Sun, Thermometer, Umbrella, Wind } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatNumber, formatPercent, formatTemp, formatTime, windDirectionLabel } from '../utils/format';
import { skyGradient, uvLabel, weatherIcon } from '../utils/weatherVisuals';
import { translateWeatherCondition } from '../i18n/localeData';

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 px-3.5 py-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold text-slate-900">{value}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

/** The dashboard hero: one big reading, everything else quiet around it. */
export default function CurrentWeather({ current, location }) {
  const { t, language, locale } = useLanguage();
  if (!current) return null;

  const Icon = weatherIcon(current.icon);
  const unit = current.units?.temperature || '°C';
  const windUnit = current.units?.wind || 'km/h';

  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b ${skyGradient(current.icon, current.isDay)} shadow-[0_16px_45px_rgba(15,23,42,0.08)]`}>
      <div className="flex flex-wrap items-start justify-between gap-6 p-6">
        <div>
          <p className="text-sm text-slate-700">{location?.label || location?.name || t('weather.current')}</p>
          <div className="mt-2 flex items-end gap-4">
            <span className="font-display text-6xl font-extrabold leading-none text-slate-900">
              {formatTemp(current.temperature, unit)}
            </span>
            <span className="pb-2">
              <Icon className="h-10 w-10 text-sky-600" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-slate-700">{translateWeatherCondition(language, current.condition)}</p>
          <p className="text-sm text-slate-600">
            {t('weather.feelsLike')} {formatTemp(current.feelsLike, unit)} · {t('weather.high')}{' '}
            {formatTemp(current.maxTemp, unit)} · {t('weather.low')} {formatTemp(current.minTemp, unit)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-sky-600" aria-hidden="true" />
            {t('weather.sunrise')} {formatTime(current.sunrise)}
          </p>
          <p className="mt-1.5 flex items-center gap-2">
            <Sunset className="h-4 w-4 text-sky-600" aria-hidden="true" />
            {t('weather.sunset')} {formatTime(current.sunset)}
          </p>
          <p className="mt-2 text-xs text-slate-500">{t('weather.observed')} {formatTime(current.time, { locale: locale.locale })} · {current.timezone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white/40 p-4 sm:grid-cols-3 lg:grid-cols-4">
        <Metric icon={Thermometer} label={t('weather.feelsLike')} value={formatTemp(current.feelsLike, unit)} />
        <Metric icon={Droplets} label={t('weather.humidity')} value={formatPercent(current.humidity)} />
        <Metric
          icon={Wind}
          label={t('weather.wind')}
          value={`${formatNumber(current.windSpeed)} ${windUnit}`}
          hint={`${windDirectionLabel(current.windDirection)} · ${t('weather.gusts')} ${formatNumber(current.windGusts)}`}
        />
        <Metric icon={Umbrella} label={t('weather.rainChance')} value={formatPercent(current.rainProbability)} />
        <Metric icon={Droplets} label={t('weather.precipitation')} value={`${formatNumber(current.precipitation)} mm`} />
        <Metric icon={Gauge} label={t('weather.pressure')} value={`${formatNumber(current.pressure)} hPa`} />
        <Metric
          icon={Sun}
          label={t('weather.uvIndex')}
          value={current.uvIndexMax ?? current.uvIndex ?? '—'}
          hint={uvLabel(current.uvIndexMax ?? current.uvIndex, language)}
        />
        <Metric
          icon={Eye}
          label={t('weather.visibility')}
          value={current.visibility ? `${formatNumber(Math.round(current.visibility / 100) / 10)} km` : '—'}
        />
      </div>
    </section>
  );
}

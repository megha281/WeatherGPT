import { BadgeCheck, Bot, Clock } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { useLanguage } from '../context/LanguageContext';
import { formatTime } from '../utils/format';
import { riskStyle } from '../utils/weatherVisuals';
import { translateAlertType } from '../i18n/localeData';

/**
 * One card type, two clearly different labels: an official warning from a
 * weather authority, or our own deterministic assessment.
 */
export default function AlertCard({ alert }) {
  const { t, locale, language } = useLanguage();
  const official = alert.sourceType === 'official';
  const style = riskStyle(alert.severity);

  return (
    <article className={`panel border-l-4 p-5 ${official ? 'border-l-risk-severe' : 'border-l-signal-500'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`flex items-center gap-1.5 text-xs font-semibold ${official ? 'text-risk-severe' : 'text-signal-400'}`}>
            {official ? <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bot className="h-3.5 w-3.5" aria-hidden="true" />}
            {official ? t('alerts.official') : t('alerts.generated')}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">{translateAlertType(language, alert.type)}</h3>
          {alert.area ? <p className="text-sm text-mist-300">{alert.area}</p> : null}
        </div>
        <RiskBadge level={alert.severity} />
      </div>

      {alert.headline && alert.headline !== alert.type ? (
        <p className="mt-3 text-sm text-mist-100">{alert.headline}</p>
      ) : null}
      {alert.description ? <p className="mt-2 text-sm text-mist-200">{alert.description}</p> : null}

      {alert.advisory ? (
        <div className={`mt-3 rounded-xl border ${style.border} ${style.bg} px-4 py-3 text-sm text-mist-100`}>
          {alert.advisory}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mist-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatTime(alert.validFrom, { withDate: true, locale: locale.locale })}
          {alert.validUntil ? ` → ${formatTime(alert.validUntil, { withDate: true, locale: locale.locale })}` : ''}
        </span>
        <span>
          {t('common.source')}:{' '}
          {alert.sourceUrl ? (
            <a href={alert.sourceUrl} target="_blank" rel="noreferrer" className="text-signal-400 hover:underline">
              {alert.source}
            </a>
          ) : (
            alert.source
          )}
        </span>
      </div>
    </article>
  );
}

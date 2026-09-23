import { ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';
import { useLanguage } from '../context/LanguageContext';
import { riskStyle } from '../utils/weatherVisuals';

export default function RiskPanel({ risk, compact = false }) {
  const { t } = useLanguage();
  if (!risk) return null;
  const style = riskStyle(risk.level);

  return (
    <section className={`panel border ${style.border} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title flex items-center gap-2">
          <ShieldAlert className={`h-5 w-5 ${style.text}`} aria-hidden="true" />
          {t('risk.title')}
        </h2>
        <RiskBadge level={risk.level} />
      </div>

      <p className="mt-3 font-display text-xl font-bold text-white">{risk.type}</p>
      <p className="mt-1 text-sm text-mist-200">{risk.reason}</p>

      {risk.advisory ? (
        <div className={`mt-4 rounded-xl border ${style.border} ${style.bg} px-4 py-3`}>
          <p className="text-xs uppercase tracking-wide text-mist-300">{t('risk.advisory')}</p>
          <p className="mt-1 text-sm text-mist-100">{risk.advisory}</p>
        </div>
      ) : null}

      {!compact && risk.risks?.length > 1 ? (
        <ul className="mt-4 space-y-2">
          {risk.risks.slice(1).map((item) => (
            <li key={item.type} className="flex items-start gap-3 rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
              <RiskBadge level={item.level} size="sm" />
              <span className="min-w-0">
                <span className="block text-sm text-mist-100">{item.type}</span>
                <span className="block text-xs text-mist-400">{item.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-4 text-xs text-mist-400">{t('risk.notOfficial')}</p>
    </section>
  );
}

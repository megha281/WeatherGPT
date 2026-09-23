import { useLanguage } from '../context/LanguageContext';
import { riskStyle } from '../utils/weatherVisuals';

export default function RiskBadge({ level = 'LOW', size = 'md' }) {
  const { t } = useLanguage();
  const style = riskStyle(level);
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border font-semibold ${style.border} ${style.bg} ${style.text} ${padding}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden="true" />
      {t(`risk.${String(level).toUpperCase()}`, level)}
    </span>
  );
}

import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`${className} animate-spin`} aria-hidden="true" />;
}

export function LoadingBlock({ label, className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-white/10 bg-night-800/60 px-4 py-6 text-mist-300 ${className}`}>
      <Spinner className="h-5 w-5 text-signal-400" />
      <span>{label || t('common.loading')}</span>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="panel animate-pulse p-5">
      <div className="mb-4 h-5 w-32 rounded bg-white/10" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-2 h-3 rounded bg-white/5" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  );
}

export default LoadingBlock;

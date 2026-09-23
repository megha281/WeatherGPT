import { Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TypingIndicator({ label }) {
  const { t } = useLanguage();
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-500/20 text-signal-400">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-night-800/80 px-4 py-3">
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-signal-400" />
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-signal-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-signal-400 [animation-delay:300ms]" />
        </span>
        <span className="text-sm text-mist-300">{label || t('loading.thinking')}</span>
      </div>
    </div>
  );
}

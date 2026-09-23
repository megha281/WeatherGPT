import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getSuggestedQuestions } from '../utils/suggestions';

export default function SuggestedQuestions({ onPick, questions, limit = 8 }) {
  const { t } = useLanguage();
  const localizedQuestions = questions || getSuggestedQuestions(t);
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm text-mist-300">
        <Sparkles className="h-4 w-4 text-signal-400" aria-hidden="true" />
        {t('chat.suggestions')}
      </p>
      <div className="flex flex-wrap gap-2">
        {localizedQuestions.slice(0, limit).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-white/10 bg-night-800 px-3.5 py-2 text-left text-sm text-mist-200 transition hover:border-signal-500/60 hover:text-white"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

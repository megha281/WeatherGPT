import { Bot, User } from 'lucide-react';
import RiskBadge from './RiskBadge';
import SourceList from './SourceList';
import { formatPercent, formatTemp, formatTime } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

/** Renders **bold** and line breaks without pulling in a Markdown dependency. */
function RichText({ text }) {
  const lines = String(text || '').split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={li} className="text-sm leading-relaxed text-mist-100">
            {parts.map((part, pi) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={pi} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={pi}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const { t } = useLanguage();
  const isUser = message.role === 'user';
  const data = message.structured || null;

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-signal-500 px-4 py-3 text-sm text-night-900">
          {message.content}
        </div>
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-night-700 text-mist-200">
          <User className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal-500/20 text-signal-400">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0 max-w-[90%] space-y-3">
        <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-night-800/80 px-4 py-3">
          <RichText text={message.content} />
        </div>

        {data?.weather ? (
          <div className="flex flex-wrap gap-2">
            {data.location?.name ? <span className="chip">{data.location.name}</span> : null}
            <span className="chip">
              {formatTemp(data.weather.temperature, data.weather.units?.temperature || '°C')} · {data.weather.condition}
            </span>
            {data.weather.rainProbability !== null && data.weather.rainProbability !== undefined ? (
              <span className="chip">{t('weather.rainChance')} {formatPercent(data.weather.rainProbability)}</span>
            ) : null}
            {data.weather.observedAt ? <span className="chip">{formatTime(data.weather.observedAt)}</span> : null}
          </div>
        ) : null}

        {data?.risk ? (
          <div className="rounded-xl border border-white/10 bg-night-900/50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-mist-400">{data.risk.label || t('risk.title')}</span>
              <RiskBadge level={data.risk.level} size="sm" />
              <span className="text-sm text-mist-100">{data.risk.type}</span>
            </div>
            {data.risk.reason ? <p className="mt-1.5 text-sm text-mist-300">{data.risk.reason}</p> : null}
            {data.advisory ? <p className="mt-2 text-sm text-mist-100">{data.advisory}</p> : null}
          </div>
        ) : null}

        {data?.sources?.length ? (
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wide text-mist-400">{t('common.sources')}</p>
            <SourceList sources={data.sources} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

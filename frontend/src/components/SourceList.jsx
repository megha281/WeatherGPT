import { Database, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

const ICONS = {
  'Weather data': Database,
  'Climate data': Database,
  Knowledge: BookOpen,
  'Risk analysis': ShieldCheck,
  AI: Sparkles,
};

/**
 * Source transparency: the weather values, the knowledge and the model are
 * listed separately, so nobody reads the answer as if the model produced the data.
 */
export default function SourceList({ sources = [], compact = false }) {
  if (!sources.length) return null;

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid gap-2 sm:grid-cols-2'}>
      {sources.map((source, i) => {
        const Icon = ICONS[source.kind] || Database;
        return (
          <div key={`${source.kind}-${i}`} className="flex items-start gap-2 rounded-xl border border-white/10 bg-night-900/50 px-3 py-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-mist-400">{source.kind}</p>
              <p className="truncate text-sm text-mist-100">
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer" className="hover:text-signal-400">
                    {source.name}
                  </a>
                ) : (
                  source.name
                )}
              </p>
              {source.detail ? <p className="truncate text-xs text-mist-400">{source.detail}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

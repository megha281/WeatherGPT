import { AlertTriangle, RefreshCw } from 'lucide-react';

/** Errors say what happened and what to do, in the interface's voice. */
export default function ErrorState({ title = 'That did not load', message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="panel border-risk-severe/30 bg-risk-severe/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-risk-severe" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-display font-bold text-white">{title}</p>
          {message ? <p className="mt-1 text-sm text-mist-200">{message}</p> : null}
          {onRetry ? (
            <button type="button" onClick={onRetry} className="btn-ghost mt-3">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

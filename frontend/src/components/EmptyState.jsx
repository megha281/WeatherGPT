import { Link } from 'react-router-dom';

/** An empty screen is an invitation to act, so every one of these offers a next step. */
export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      {Icon ? (
        <span className="rounded-2xl border border-white/10 bg-night-700 p-3 text-signal-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-display text-lg font-bold text-white">{title}</p>
      {description ? <p className="max-w-sm text-sm text-mist-300">{description}</p> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="btn-primary mt-2">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function FormMessage({ error, success }) {
  if (!error && !success) return null;
  const isError = Boolean(error);
  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? 'border-risk-severe/40 bg-risk-severe/10 text-risk-severe'
          : 'border-risk-low/40 bg-risk-low/10 text-risk-low'
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{error || success}</span>
    </p>
  );
}

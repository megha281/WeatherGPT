import { Link } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';

/** Shared frame for every account page, so the flow feels like one place. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_1fr]">
      <div className="hidden lg:block">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-signal-500 text-night-900">
            <CloudLightning className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-extrabold text-white">WeatherGPT</span>
        </Link>
        <p className="mt-8 max-w-sm font-display text-3xl font-bold leading-tight text-white">
          Ask about the weather the way you would ask a person.
        </p>
        <p className="mt-4 max-w-sm text-mist-300">
          An account keeps your saved places, your conversations and your language and unit settings together.
        </p>
      </div>

      <div className="panel w-full p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-mist-300">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 border-t border-white/10 pt-4 text-sm text-mist-300">{footer}</div> : null}
      </div>
    </div>
  );
}

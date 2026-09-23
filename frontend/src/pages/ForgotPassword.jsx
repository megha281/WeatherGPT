import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { Spinner } from '../components/Loading';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t('auth.validEmail'));
      return;
    }
    setBusy(true);
    try {
      setResult(await authService.forgotPassword(email.trim().toLowerCase()));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('auth.forgot')}</h1>
      <p className="mt-2 text-mist-300">
        {t('forgot.instructions')}
      </p>

      <form onSubmit={submit} className="panel mt-6 space-y-4 p-6" noValidate>
        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {error ? <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm">{error}</p> : null}

        {result ? (
          <div className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm">
            <p>{result.message}</p>
            {result.dev?.resetUrl ? (
              <p className="mt-2 break-all">
                Development mode: email is not configured, so use this link directly —{' '}
                <Link to={new URL(result.dev.resetUrl).pathname} className="text-signal-400 underline">
                  {new URL(result.dev.resetUrl).pathname}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <KeyRound className="h-4 w-4" aria-hidden="true" />}
          {busy ? t('forgot.sending') : t('forgot.send')}
        </button>

        <p className="text-sm text-mist-400">
          <Link to="/login" className="text-signal-400 hover:text-signal-300">
            {t('forgot.back', { signIn: t('auth.signIn').toLowerCase() })}
          </Link>
        </p>
      </form>
    </div>
  );
}

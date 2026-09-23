import { useState } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Spinner } from '../components/Loading';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.email.trim() || !form.password) {
      setError(t('auth.enterCredentials'));
      return;
    }
    setBusy(true);
    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password });
      navigate(routerLocation.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('auth.signIn')}</h1>
      <p className="mt-2 text-mist-300">{t('auth.welcome')}</p>

      <form onSubmit={submit} className="panel mt-6 space-y-4 p-6" noValidate>
        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" autoComplete="email" className="field" value={form.email} onChange={change('email')} />
        </div>

        <div>
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <div className="relative">
            <input
              id="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              className="field pr-12"
              value={form.password}
              onChange={change('password')}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-400 hover:text-white"
              aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {error ? <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {busy ? t('auth.signingIn') : t('auth.signIn')}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-signal-400 hover:text-signal-300">
            {t('auth.forgot')}
          </Link>
          <span className="text-mist-400">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-signal-400 hover:text-signal-300">
              {t('auth.signUp')}
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}

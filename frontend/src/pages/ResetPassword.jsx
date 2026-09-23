import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { Spinner } from '../components/Loading';

function passwordProblem(password) {
  if (password.length < 8) return 'auth.passwordLength';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'auth.passwordRequirements';
  return null;
}

export default function ResetPassword() {
  const { token } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const change = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const problem = passwordProblem(form.password);
    if (problem) return setError(t(problem));
    if (form.password !== form.confirmPassword) return setError(t('auth.passwordMismatch'));

    setBusy(true);
    try {
      await authService.resetPassword({ token, password: form.password });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('auth.resetPassword')}</h1>
      <p className="mt-2 text-mist-300">{t('auth.newPasswordDescription')}</p>

      {done ? (
        <div className="panel mt-6 p-6">
          <p className="text-mist-100">{t('auth.passwordUpdated')}</p>
          <Link to="/login" className="btn-primary mt-4">
            {t('auth.signIn')}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="panel mt-6 space-y-4 p-6" noValidate>
          <div>
            <label className="label" htmlFor="password">{t('auth.newPassword')}</label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                className="field pr-12"
                autoComplete="new-password"
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

          <div>
            <label className="label" htmlFor="confirm">{t('auth.confirmPassword')}</label>
            <input
              id="confirm"
              type={show ? 'text' : 'password'}
              className="field"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={change('confirmPassword')}
            />
          </div>

          {error ? <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm">{error}</p> : null}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? <Spinner /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
            {busy ? t('auth.updating') : t('auth.resetPassword')}
          </button>
        </form>
      )}
    </div>
  );
}

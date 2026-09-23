import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import LocationSearch from '../components/LocationSearch';
import { Spinner } from '../components/Loading';

/** Mirrors the backend rule: 8+ characters with a letter and a number. */
function passwordProblem(password) {
  if (password.length < 8) return 'auth.passwordLength';
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return 'auth.passwordRequirements';
  return null;
}

export default function Register() {
  const { register } = useAuth();
  const { t, languages } = useLanguage();
  const { location } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en',
  });
  const [place, setPlace] = useState(location || null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError(t('auth.nameRequired'));
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError(t('auth.validEmail'));
    const problem = passwordProblem(form.password);
    if (problem) return setError(t(problem));
    if (form.password !== form.confirmPassword) return setError(t('auth.passwordMismatch'));

    setBusy(true);
    try {
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        preferredLanguage: form.preferredLanguage,
        defaultLocation: place
          ? {
              name: place.name,
              city: place.city || place.name,
              state: place.state || '',
              country: place.country || '',
              latitude: place.latitude,
              longitude: place.longitude,
            }
          : undefined,
      });

      if (data.emailVerification && !data.emailVerification.sent) {
        setNotice(data.emailVerification.note);
        setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('auth.signUp')}</h1>
      <p className="mt-2 text-mist-300">{t('auth.registerDescription')}</p>

      <form onSubmit={submit} className="panel mt-6 space-y-4 p-6" noValidate>
        <div>
          <label className="label" htmlFor="name">{t('auth.fullName')}</label>
          <input id="name" className="field" autoComplete="name" value={form.name} onChange={change('name')} />
        </div>

        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" className="field" autoComplete="email" value={form.email} onChange={change('email')} />
        </div>

        <div>
          <label className="label" htmlFor="password">{t('auth.password')}</label>
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
          <p className="mt-1 text-xs text-mist-400">{t('auth.passwordHint')}</p>
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

        <div>
          <label className="label" htmlFor="language">{t('auth.language')}</label>
          <select id="language" className="field" value={form.preferredLanguage} onChange={change('preferredLanguage')}>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">{t('auth.defaultLocation')}</span>
          <LocationSearch showMyLocation={false} onSelect={(p) => setPlace(p)} />
          <p className="mt-1.5 text-xs text-mist-400">
            {place ? `Selected: ${place.label || place.name}` : 'Optional — you can set this later in Settings.'}
          </p>
        </div>

        {error ? <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm">{error}</p> : null}
        {notice ? <p className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm">{notice}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {busy ? 'Creating your account…' : t('auth.signUp')}
        </button>

        <p className="text-sm text-mist-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-signal-400 hover:text-signal-300">
            {t('auth.signIn')}
          </Link>
        </p>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { BadgeCheck, MailWarning, Save } from 'lucide-react';
import userService from '../services/userService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LocationSearch from '../components/LocationSearch';
import { Spinner } from '../components/Loading';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { t, languages } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');
  const [place, setPlace] = useState(user?.defaultLocation?.latitude ? user.defaultLocation : null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resend, setResend] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!name.trim()) return setError('Your name cannot be empty.');
    setBusy(true);
    try {
      const data = await userService.updateProfile({
        name: name.trim(),
        preferredLanguage,
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
      setUser(data.user);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const resendVerification = async () => {
    try {
      const data = await authService.resendVerification(user.email);
      setResend(data.dev?.verifyUrl ? `${data.message} Development link: ${data.dev.verifyUrl}` : data.message);
    } catch (err) {
      setResend(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('nav.profile')}</h1>

      <section className="panel mt-6 p-5">
        <h2 className="section-title">Account</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
            <dt className="text-xs text-mist-400">{t('auth.email')}</dt>
            <dd className="text-sm text-mist-100">{user?.email}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
            <dt className="text-xs text-mist-400">Email status</dt>
            <dd className="flex items-center gap-1.5 text-sm text-mist-100">
              {user?.isEmailVerified ? (
                <>
                  <BadgeCheck className="h-4 w-4 text-risk-low" aria-hidden="true" /> Verified
                </>
              ) : (
                <>
                  <MailWarning className="h-4 w-4 text-risk-moderate" aria-hidden="true" /> Not verified
                </>
              )}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
            <dt className="text-xs text-mist-400">Member since</dt>
            <dd className="text-sm text-mist-100">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
            <dt className="text-xs text-mist-400">Last sign-in</dt>
            <dd className="text-sm text-mist-100">
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'This session'}
            </dd>
          </div>
        </dl>

        {!user?.isEmailVerified ? (
          <div className="mt-4">
            <button type="button" onClick={resendVerification} className="btn-ghost">
              Resend verification email
            </button>
            {resend ? <p className="mt-2 break-all text-sm text-mist-300">{resend}</p> : null}
          </div>
        ) : null}
      </section>

      <form onSubmit={save} className="panel mt-6 space-y-4 p-5" noValidate>
        <h2 className="section-title">Details</h2>

        <div>
          <label className="label" htmlFor="name">{t('auth.fullName')}</label>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="language">{t('auth.language')}</label>
          <select id="language" className="field" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}>
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
            {place ? `Selected: ${place.label || place.name}` : 'No default location set.'}
          </p>
        </div>

        {error ? <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm">{error}</p> : null}
        {message ? <p className="rounded-xl border border-signal-500/40 bg-signal-500/10 px-4 py-3 text-sm">{message}</p> : null}

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? <Spinner /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {busy ? t('common.saving') : t('common.save')}
        </button>
      </form>
    </div>
  );
}

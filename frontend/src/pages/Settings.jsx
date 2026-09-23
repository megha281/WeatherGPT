import { useState } from 'react';
import { Save } from 'lucide-react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LocationSearch from '../components/LocationSearch';
import { Spinner } from '../components/Loading';

const SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'SEVERE'];

export default function Settings() {
  const { user, setUser } = useAuth();
  const { t, languages, setLanguage } = useLanguage();
  const prefs = user?.preferences || {};

  const [form, setForm] = useState({
    preferredLanguage: user?.preferredLanguage || 'en',
    temperatureUnit: prefs.temperatureUnit || 'celsius',
    windUnit: prefs.windUnit || 'kmh',
    alertMinimumSeverity: prefs.alertMinimumSeverity || 'MODERATE',
    emailNotifications: prefs.notifications?.email ?? false,
    severeWeatherOnly: prefs.notifications?.severeWeatherOnly ?? true,
  });
  const [place, setPlace] = useState(user?.defaultLocation?.latitude ? user.defaultLocation : null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setBusy(true);
    try {
      const data = await userService.updatePreferences({
        preferredLanguage: form.preferredLanguage,
        temperatureUnit: form.temperatureUnit,
        windUnit: form.windUnit,
        alertMinimumSeverity: form.alertMinimumSeverity,
        notifications: { email: form.emailNotifications, severeWeatherOnly: form.severeWeatherOnly },
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
      setLanguage(form.preferredLanguage);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold text-white">{t('nav.settings')}</h1>
      <p className="mt-1 text-mist-300">{t('settings.description')}</p>

      <form onSubmit={save} className="panel mt-6 space-y-5 p-5">
        <div>
          <label className="label" htmlFor="language">{t('auth.language')}</label>
          <select id="language" className="field" value={form.preferredLanguage} onChange={(e) => set('preferredLanguage', e.target.value)}>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.native} ({lang.label})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-mist-400">
            {t('settings.unitsDigits')}
          </p>
        </div>

        <div>
          <span className="label">{t('auth.defaultLocation')}</span>
          <LocationSearch showMyLocation={false} onSelect={(p) => setPlace(p)} />
          <p className="mt-1.5 text-xs text-mist-400">
            {place ? t('settings.selectedLocation', { name: place.label || place.name }) : t('settings.noLocation')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="unit">{t('settings.temperature')}</label>
            <select id="unit" className="field" value={form.temperatureUnit} onChange={(e) => set('temperatureUnit', e.target.value)}>
              <option value="celsius">{t('settings.celsius')}</option>
              <option value="fahrenheit">{t('settings.fahrenheit')}</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="wind">{t('settings.wind')}</label>
            <select id="wind" className="field" value={form.windUnit} onChange={(e) => set('windUnit', e.target.value)}>
              <option value="kmh">km/h</option>
              <option value="ms">m/s</option>
              <option value="mph">mph</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="severity">{t('settings.alertSeverity')}</label>
          <select
            id="severity"
            className="field"
            value={form.alertMinimumSeverity}
            onChange={(e) => set('alertMinimumSeverity', e.target.value)}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {t('settings.andAbove', { level: t(`risk.${s}`) })}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-3">
          <legend className="label">{t('settings.notifications')}</legend>
          <label className="flex items-center gap-3 text-sm text-mist-200">
            <input
              type="checkbox"
              className="h-4 w-4 accent-signal-500"
              checked={form.emailNotifications}
              onChange={(e) => set('emailNotifications', e.target.checked)}
            />
            {t('settings.emailAlerts')}
          </label>
          <label className="flex items-center gap-3 text-sm text-mist-200">
            <input
              type="checkbox"
              className="h-4 w-4 accent-signal-500"
              checked={form.severeWeatherOnly}
              onChange={(e) => set('severeWeatherOnly', e.target.checked)}
            />
            {t('settings.severeOnly')}
          </label>
          <p className="text-xs text-mist-400">
            {t('settings.smtp')}
          </p>
        </fieldset>

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

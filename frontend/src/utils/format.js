export const NUMBER_LOCALE = 'en-IN';

export function formatTemp(value, unit = '°C') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Math.round(Number(value))}${unit}`;
}

export function formatNumber(value, suffix = '', locale = NUMBER_LOCALE) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toLocaleString(locale)}${suffix}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${Math.round(Number(value))}%`;
}

export function formatTime(iso, { withDate = false, locale = NUMBER_LOCALE } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
  if (!withDate) return time;
  return `${d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}, ${time}`;
}

export function formatHour(iso, locale = NUMBER_LOCALE) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString(locale, { hour: 'numeric', hour12: true }).replace(' ', '');
}

export function formatDay(iso, { style = 'short', locale = NUMBER_LOCALE, todayLabel = 'Today', tomorrowLabel = 'Tomorrow' } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 86400000);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  if (style === 'short' && isToday) return todayLabel;
  if (style === 'short' && isTomorrow) return tomorrowLabel;
  return d.toLocaleDateString(locale, { weekday: style === 'long' ? 'long' : 'short', day: 'numeric', month: 'short' });
}

export function windDirectionLabel(degrees) {
  if (degrees === null || degrees === undefined) return '';
  const points = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return points[Math.round(Number(degrees) / 22.5) % 16];
}

export function relativeTime(iso, locale = NUMBER_LOCALE, labels = { justNow: 'just now', minutes: 'min ago', hours: 'h ago' }) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return labels.justNow;
  if (minutes < 60) return `${minutes} ${labels.minutes}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${labels.hours}`;
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export function locationLabel(location) {
  if (!location) return '';
  return location.label || [location.name || location.city, location.state, location.country].filter(Boolean).join(', ');
}

import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Wind,
} from 'lucide-react';
import { weatherTerm } from '../i18n/localeData';

const ICONS = {
  sun: Sun,
  'sun-cloud': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudRain,
  sleet: CloudSnow,
  snow: CloudSnow,
  storm: CloudLightning,
  wind: Wind,
};

export function weatherIcon(name) {
  return ICONS[name] || Cloud;
}

export const RISK_STYLES = {
  LOW: { text: 'text-risk-low', bg: 'bg-risk-low/10', border: 'border-risk-low/40', dot: 'bg-risk-low' },
  MODERATE: { text: 'text-risk-moderate', bg: 'bg-risk-moderate/10', border: 'border-risk-moderate/40', dot: 'bg-risk-moderate' },
  HIGH: { text: 'text-risk-high', bg: 'bg-risk-high/10', border: 'border-risk-high/40', dot: 'bg-risk-high' },
  SEVERE: { text: 'text-risk-severe', bg: 'bg-risk-severe/10', border: 'border-risk-severe/50', dot: 'bg-risk-severe' },
};

export function riskStyle(level) {
  return RISK_STYLES[String(level || 'LOW').toUpperCase()] || RISK_STYLES.LOW;
}

export function uvLabel(uv, language = 'en') {
  const v = Number(uv);
  if (!Number.isFinite(v)) return '—';
  if (v < 3) return weatherTerm(language, 'uvLow');
  if (v < 6) return weatherTerm(language, 'uvModerate');
  if (v < 8) return weatherTerm(language, 'uvHigh');
  if (v < 11) return weatherTerm(language, 'uvVeryHigh');
  return weatherTerm(language, 'uvExtreme');
}

/** Sky tint for the hero, based on the current condition and day/night. */
export function skyGradient(icon, isDay = true) {
  if (!isDay) return 'from-slate-100 via-slate-50 to-white';
  switch (icon) {
    case 'sun':
      return 'from-sky-100 via-white to-amber-50';
    case 'rain':
    case 'showers':
    case 'drizzle':
      return 'from-slate-100 via-sky-50 to-white';
    case 'storm':
      return 'from-slate-200 via-sky-100 to-white';
    default:
      return 'from-sky-100 via-white to-slate-50';
  }
}

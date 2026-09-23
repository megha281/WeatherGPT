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
  if (!isDay) return 'from-[#0B1E2E] via-[#10293B] to-[#061320]';
  switch (icon) {
    case 'sun':
      return 'from-[#1D5C77] via-[#12405A] to-[#061320]';
    case 'rain':
    case 'showers':
    case 'drizzle':
      return 'from-[#1A4655] via-[#123544] to-[#061320]';
    case 'storm':
      return 'from-[#2A3E5C] via-[#172B42] to-[#061320]';
    default:
      return 'from-[#17475C] via-[#0F3245] to-[#061320]';
  }
}

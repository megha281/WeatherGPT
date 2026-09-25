import { Link } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-16 border-t border-white/10 bg-night-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal-500 text-night-900">
              <CloudLightning className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-extrabold text-white">WeatherGPT</span>
          </div>
          <p className="mt-3 text-sm text-mist-400">{t('footer.description')}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t('footer.explore')}</p>
          <ul className="mt-3 space-y-2 text-sm text-mist-400">
            <li><Link to="/weather" className="hover:text-signal-400">{t('nav.weather')}</Link></li>
            <li><Link to="/weather-gpt" className="hover:text-signal-400">{t('chat.title')}</Link></li>
            <li><Link to="/alerts" className="hover:text-signal-400">{t('nav.alerts')}</Link></li>
            <li><Link to="/map" className="hover:text-signal-400">{t('nav.map')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t('footer.sources')}</p>
          <ul className="mt-3 space-y-2 text-sm text-mist-400">
            <li>
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="hover:text-signal-400">
                {t('footer.weatherData')}: Open-Meteo
              </a>
            </li>
            <li>
              <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer" className="hover:text-signal-400">
                {t('footer.climateData')}
              </a>
            </li>
            <li>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-signal-400">
                {t('footer.maps')}: OpenStreetMap contributors
              </a>
            </li>
            <li>{t('footer.knowledge')}: WeatherGPT Knowledge Base</li>
            <li>{t('footer.ai')}: {t('footer.aiDetail')}</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t('footer.safety')}</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mist-400">
            <li>{t('footer.safetyAutomated')}</li>
            <li>{t('footer.safetyAuthorities')}</li>
            <li>{t('footer.safetyIndia')}</li>
          </ul>
          <Link to="/about" className="mt-3 inline-block text-sm text-signal-400 hover:text-signal-300">
            {t('common.aboutProject')}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="mx-auto max-w-7xl text-xs text-mist-400">
          {t('footer.disclaimer')}
        </p>
      </div>
    </footer>
  );
}

import { useLanguage } from '../context/LanguageContext';

const FEATURES = [
  ['🌦️', 'about.forecasts', 'about.forecastsBody'],
  ['🤖', 'about.questions', 'about.questionsBody'],
  ['📍', 'about.locations', 'about.locationsBody'],
  ['⚠️', 'about.alerts', 'about.alertsBody'],
  ['🗺️', 'about.maps', 'about.mapsBody'],
  ['🌍', 'about.climate', 'about.climateBody'],
];

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="max-w-3xl">
        <span className="chip">{t('about.badge')}</span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          {t('about.title')}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mist-200">
          {t('about.intro')}
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          {t('about.detail')}
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{t('about.what')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(([icon, title, body]) => (
            <article key={title} className="panel p-5">
              <span className="text-3xl" role="img" aria-label="">{icon}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{t(title)}</h3>
              <p className="mt-2 leading-relaxed text-mist-300">{t(body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel mt-12 p-6 sm:p-8">
        <h2 className="section-title">{t('about.designed')}</h2>
        <p className="mt-4 leading-relaxed text-mist-200">
          {t('about.designedBody')}
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          {t('about.designedBody2')}
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{t('about.vision')}</h2>
        <p className="mt-4 text-xl font-semibold leading-relaxed text-signal-400">
          {t('about.visionQuote')}
        </p>
        <p className="mt-4 leading-relaxed text-mist-300">
          {t('about.visionBody')}
        </p>
      </section>

      <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-mist-400">
        {t('about.footer')}
      </footer>
    </div>
  );
}

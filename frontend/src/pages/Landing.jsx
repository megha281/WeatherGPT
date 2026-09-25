import { Link } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Bot, CloudSun, Languages, Map, Mic, ShieldAlert, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSuggestedQuestions } from '../utils/suggestions';

const FEATURES = [
  {
    icon: Bot,
    title: 'landing.featureAssistantTitle',
    body: 'landing.featureAssistantBody',
  },
  {
    icon: CloudSun,
    title: 'landing.featureWeatherTitle',
    body: 'landing.featureWeatherBody',
  },
  {
    icon: AlertTriangle,
    title: 'landing.featureAlertsTitle',
    body: 'landing.featureAlertsBody',
  },
  {
    icon: ShieldAlert,
    title: 'landing.featureRiskTitle',
    body: 'landing.featureRiskBody',
  },
  {
    icon: Map,
    title: 'landing.featureMapTitle',
    body: 'landing.featureMapBody',
  },
  {
    icon: Languages,
    title: 'landing.featureLanguageTitle',
    body: 'landing.featureLanguageBody',
  },
  {
    icon: BarChart3,
    title: 'landing.featureClimateTitle',
    body: 'landing.featureClimateBody',
  },
  {
    icon: Mic,
    title: 'landing.featureVoiceTitle',
    body: 'landing.featureVoiceBody',
  },
];

const STEPS = [
  { n: '01', title: 'landing.stepAskTitle', body: 'landing.stepAskBody' },
  { n: '02', title: 'landing.stepResolveTitle', body: 'landing.stepResolveBody' },
  { n: '03', title: 'landing.stepDataTitle', body: 'landing.stepDataBody' },
  { n: '04', title: 'landing.stepRiskTitle', body: 'landing.stepRiskBody' },
  { n: '05', title: 'landing.stepAnswerTitle', body: 'landing.stepAnswerBody' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const suggestedQuestions = getSuggestedQuestions(t);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-sky-200 bg-gradient-to-b from-sky-100 via-white to-sky-50">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t('landing.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            {t('landing.description')}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/weather" className="btn-primary px-6 py-3 text-base">
              {t('landing.explore')}
            </Link>
            <Link to="/weather-gpt" className="btn-ghost px-6 py-3 text-base">
              {t('landing.ask')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-sm text-slate-500">{t('chat.suggestions')}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {suggestedQuestions.slice(0, 4).map((q) => (
                <Link key={q} to="/weather-gpt" state={{ question: q }} className="chip hover:border-signal-500/60">
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-extrabold text-slate-900">{t('landing.everythingTitle')}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          {t('landing.everythingBody')}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="panel p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal-500/15 text-signal-400">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{t(feature.title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t(feature.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl font-extrabold text-slate-900">{t('landing.howTitle')}</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {STEPS.map((step) => (
              <div key={step.n} className="panel p-5">
                <span className="font-display text-sm font-bold text-signal-400">{step.n}</span>
                <h3 className="mt-2 font-display text-base font-bold text-slate-900">{t(step.title)}</h3>
                <p className="mt-2 text-sm text-slate-600">{t(step.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-extrabold text-slate-900">{t('landing.readyTitle')}</h2>
          <p className="mt-3 text-slate-600">{t('landing.readyBody')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              {t('auth.signUp')}
            </Link>
            <Link to="/login" className="btn-ghost px-6 py-3 text-base">
              {t('auth.signIn')}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

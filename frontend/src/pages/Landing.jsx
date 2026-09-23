import { Link } from 'react-router-dom';
import {
  AlertTriangle, BarChart3, Bot, CloudSun, Languages, Map, Mic, ShieldAlert, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SUGGESTED_QUESTIONS from '../utils/suggestions';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Weather Assistant',
    body: 'Ask in plain language. WeatherGPT works out the place, the day and the time you meant, fetches the real forecast and explains it.',
  },
  {
    icon: CloudSun,
    title: 'Real-Time Weather',
    body: 'Current conditions, 24-hour and 7-day forecasts straight from Open-Meteo. Every number on screen comes from the API, never from the model.',
  },
  {
    icon: AlertTriangle,
    title: 'Smart Alerts',
    body: 'Official warnings and our own assessments are shown side by side and always labelled separately, so nothing of ours is mistaken for a government warning.',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Analysis',
    body: 'A deterministic rule engine scores rainfall, heat, wind, flooding, lightning and UV as LOW, MODERATE, HIGH or SEVERE using published thresholds.',
  },
  {
    icon: Map,
    title: 'Interactive Maps',
    body: 'Pick any point on an OpenStreetMap layer and read the live conditions there, with the coordinates shown.',
  },
  {
    icon: BarChart3,
    title: 'Climate Insights',
    body: 'Monthly normals and annual series built from the ERA5 reanalysis archive, with the trend computed from the data, not guessed.',
  },
  {
    icon: Languages,
    title: 'Multilingual Support',
    body: 'English, Hindi, Kannada, Tamil and Telugu. Temperatures, percentages and wind speeds stay as digits in every language.',
  },
  {
    icon: Mic,
    title: 'Voice Queries',
    body: 'Speak your question in Chrome or Edge. Where speech recognition is missing, the app says so instead of failing silently.',
  },
];

const STEPS = [
  { n: '01', title: 'You ask', body: '“Will it rain tomorrow evening in Bellary?” — typed or spoken, in any supported language.' },
  { n: '02', title: 'We resolve the question', body: 'Gemini picks the tools it needs: the place is geocoded, the day and time window are parsed.' },
  { n: '03', title: 'Real data is fetched', body: 'Open-Meteo returns the current conditions and the hourly and daily forecast for exactly that point.' },
  { n: '04', title: 'Risk and knowledge are added', body: 'The rule engine scores the conditions and the knowledge base supplies the meteorology behind them.' },
  { n: '05', title: 'You get an answer you can act on', body: 'A grounded reply with the numbers, the risk level, what to do and every source listed.' },
];

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#12405A] via-[#0B2536] to-night-900">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <span className="chip mx-auto">Smart India Hackathon 2026 · SIH26068 · Disaster Management</span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            WeatherGPT — Understand Weather. Make Better Decisions.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-mist-200">
            Conversational AI for weather forecasting, alerts, climate information and actionable insights.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/weather" className="btn-primary px-6 py-3 text-base">
              Explore Weather
            </Link>
            <Link to="/weather-gpt" className="btn-ghost px-6 py-3 text-base">
              Ask WeatherGPT
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10">
            <p className="text-sm text-mist-400">{t('chat.suggestions')}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <Link key={q} to="/weather-gpt" state={{ question: q }} className="chip hover:border-signal-500/60">
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-extrabold text-white">Everything in one place</h2>
        <p className="mt-2 max-w-2xl text-mist-300">
          Eight capabilities, built around one rule: real data for anything measurable, explanation only on top of it.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="panel p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal-500/15 text-signal-400">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-night-800/40">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl font-extrabold text-white">How it works</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {STEPS.map((step) => (
              <div key={step.n} className="panel p-5">
                <span className="font-display text-sm font-bold text-signal-400">{step.n}</span>
                <h3 className="mt-2 font-display text-base font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-mist-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-extrabold text-white">Ready to ask?</h2>
        <p className="mt-3 text-mist-300">
          Create an account to save locations, keep your conversations and set your language and default place.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            {t('auth.signUp')}
          </Link>
          <Link to="/login" className="btn-ghost px-6 py-3 text-base">
            {t('auth.signIn')}
          </Link>
        </div>
      </section>
    </div>
  );
}

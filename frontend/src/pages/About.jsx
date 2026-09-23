import { Link } from 'react-router-dom';
import { Bot, CloudSun, Database, Languages, ShieldAlert, Siren } from 'lucide-react';

const PILLARS = [
  {
    icon: Bot,
    title: 'Conversational AI',
    body: 'Google Gemini interprets the question and selects tools. It never supplies the measurements — every value in an answer is fetched from a weather API first and handed to the model as grounded context.',
  },
  {
    icon: CloudSun,
    title: 'Real weather data',
    body: 'Open-Meteo provides current conditions, hourly and daily forecasts, multi-model comparison and the ERA5 historical archive behind the climate page. No key is required and no value is synthesised.',
  },
  {
    icon: Database,
    title: 'Weather RAG',
    body: 'A local knowledge base of 16 documents drawn from IMD, WMO, NDMA and WHO public guidance is chunked, embedded and searched, so explanations of thresholds and safety advice rest on published material.',
  },
  {
    icon: ShieldAlert,
    title: 'Deterministic risk engine',
    body: 'Rainfall, heat, cold, wind, flooding, lightning, UV and visibility are scored LOW, MODERATE, HIGH or SEVERE by fixed rules using IMD and Beaufort thresholds — the same input always yields the same level.',
  },
  {
    icon: Siren,
    title: 'Alerts, clearly labelled',
    body: 'Warnings from official meteorological feeds are labelled Official Weather Alert. Anything our engine produces is labelled WeatherGPT Risk Assessment. The two are never merged.',
  },
  {
    icon: Languages,
    title: 'Multilingual access',
    body: 'The interface and answers are available in English, Hindi, Kannada, Tamil and Telugu, while numbers and units remain untranslated so no reading can be misinterpreted.',
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header>
        <span className="chip">SMART INDIA HACKATHON 2026</span>
        <h1 className="mt-5 font-display text-4xl font-extrabold text-white">About WeatherGPT</h1>
        <p className="mt-3 text-lg text-mist-200">
          A conversational weather platform built for the Disaster Management theme, so that a forecast becomes a
          decision someone can act on.
        </p>
      </header>

      <section className="panel mt-8 p-6">
        <h2 className="section-title">The problem</h2>
        <p className="mt-3 text-mist-200">
          Problem Statement <strong className="text-white">SIH26068</strong> asks for a conversational AI for weather
          forecasting, alerts and climate information. Weather data is published openly and continuously, yet most
          people cannot act on it: raw tables of millimetres and wind speeds do not answer “should I travel this
          evening?”, official bulletins are in languages and formats many cannot read quickly, and a chatbot that
          guesses at numbers is more dangerous than no chatbot at all during a disaster.
        </p>
        <p className="mt-3 text-mist-200">
          WeatherGPT answers the question people actually ask, in their language, using real data, and it is explicit
          about which part of the answer is a government warning and which part is our own automated assessment.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <article key={pillar.title} className="panel p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-signal-500/15 text-signal-400">
              <pillar.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-white">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist-300">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="section-title">Why it matters for disaster management</h2>
        <ul className="mt-3 space-y-2 text-mist-200">
          <li>• Heavy rainfall and urban flooding are often survivable with a few hours of warning and one changed decision.</li>
          <li>• Heatwave advice — hydration, avoiding the afternoon sun — saves lives, but only if it reaches people in their own language.</li>
          <li>• Lightning kills more people in India annually than most other weather hazards, and the safety rules are simple and teachable.</li>
          <li>• Clear separation between official warnings and automated assessments protects the credibility of the official warning system.</li>
        </ul>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="section-title">Project details</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ['Problem Statement ID', 'SIH26068'],
            ['Theme', 'Disaster Management'],
            ['Category', 'Software'],
            ['Team ID', 'KU40'],
            ['Team Name', 'Binary Brains'],
            ['Event', 'Smart India Hackathon 2026'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-night-900/40 px-3 py-2">
              <dt className="text-xs text-mist-400">{label}</dt>
              <dd className="text-sm text-mist-100">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="section-title">Sources we rely on</h2>
        <ul className="mt-3 space-y-2 text-sm text-mist-300">
          <li>
            Weather and climate data:{' '}
            <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-signal-400 hover:underline">
              Open-Meteo
            </a>{' '}
            (forecast models and the ERA5 reanalysis archive)
          </li>
          <li>
            Maps:{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-signal-400 hover:underline">
              OpenStreetMap contributors
            </a>
          </li>
          <li>Knowledge base: public guidance from IMD, WMO, NDMA and WHO, cited inside each document</li>
          <li>Language model: Google Gemini, used for understanding and explanation only</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/weather-gpt" className="btn-primary">Ask WeatherGPT</Link>
        <Link to="/weather" className="btn-ghost">Explore weather</Link>
      </div>
    </div>
  );
}

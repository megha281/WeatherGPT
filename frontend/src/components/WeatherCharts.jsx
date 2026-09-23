import { useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { formatHour } from '../utils/format';

const axisProps = { stroke: '#7092A5', fontSize: 12, tickLine: false, axisLine: false };

export default function WeatherCharts({ hourly }) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'temperature', label: t('charts.temperature') },
    { id: 'rain', label: t('charts.rainChance') },
    { id: 'precipitation', label: t('charts.rainfall') },
    { id: 'wind', label: t('charts.wind') },
  ];
  const [tab, setTab] = useState('temperature');
  const hours = hourly?.hours || [];
  if (!hours.length) return null;

  const data = hours.map((h) => ({
    time: formatHour(h.time),
    temperature: h.temperature,
    feelsLike: h.feelsLike,
    rain: h.rainProbability,
    precipitation: h.precipitation,
    wind: h.windSpeed,
    gusts: h.windGusts,
  }));

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">{t('weather.charts')}</h2>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                tab === item.id ? 'bg-signal-500 text-night-900' : 'border border-white/10 text-mist-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {tab === 'temperature' ? (
            <LineChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis dataKey="time" interval={2} {...axisProps} />
              <YAxis unit="°" {...axisProps} />
              <Tooltip contentStyle={{ background: '#0F2836', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Line type="monotone" dataKey="temperature" stroke="#5AD7FB" strokeWidth={2.5} dot={false} name={t('charts.temperature')} />
              <Line type="monotone" dataKey="feelsLike" stroke="#F2B544" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name={t('charts.feelsLike')} />
            </LineChart>
          ) : tab === 'rain' ? (
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2FC2F0" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#2FC2F0" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis dataKey="time" interval={2} {...axisProps} />
              <YAxis unit="%" domain={[0, 100]} {...axisProps} />
              <Tooltip contentStyle={{ background: '#0F2836', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Area type="monotone" dataKey="rain" stroke="#2FC2F0" fill="url(#rainFill)" strokeWidth={2} name={t('charts.rainChance')} />
            </AreaChart>
          ) : tab === 'precipitation' ? (
            <BarChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis dataKey="time" interval={2} {...axisProps} />
              <YAxis unit="mm" {...axisProps} />
              <Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={{ background: '#0F2836', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Bar dataKey="precipitation" fill="#5AD7FB" radius={[4, 4, 0, 0]} name={t('charts.rainfall')} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#ffffff12" vertical={false} />
              <XAxis dataKey="time" interval={2} {...axisProps} />
              <YAxis unit=" km/h" {...axisProps} />
              <Tooltip contentStyle={{ background: '#0F2836', border: '1px solid #ffffff20', borderRadius: 12 }} />
              <Line type="monotone" dataKey="wind" stroke="#49CFA1" strokeWidth={2.5} dot={false} name={t('charts.wind')} />
              <Line type="monotone" dataKey="gusts" stroke="#F07E3C" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name={t('charts.gusts')} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-mist-400">{t('charts.note')}</p>
    </section>
  );
}

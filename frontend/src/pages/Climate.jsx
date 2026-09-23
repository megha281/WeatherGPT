import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LocationSearch from '../components/LocationSearch';
import ErrorState from '../components/ErrorState';
import SourceList from '../components/SourceList';
import { LoadingBlock } from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import weatherService from '../services/weatherService';
import { formatNumber, formatTemp, locationLabel } from '../utils/format';

const axis = { stroke: '#7092A5', fontSize: 12 };

export default function Climate() {
  const { t } = useLanguage();
  const { location, setLocation } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    weatherService
      .climate(location.latitude, location.longitude, 10)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [location]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-white">{t('nav.climate')}</h1>
      <p className="mt-1 text-mist-300">{locationLabel(location)}</p>

      <section className="panel mt-6 p-6">
        <h2 className="section-title">Weather is not climate</h2>
        <p className="mt-2 text-mist-200">
          Weather is what the atmosphere is doing now and over the next few days: today&apos;s rain, tomorrow&apos;s
          temperature, this week&apos;s wind. Climate is the statistics of that weather over decades — what a place is
          usually like in June, how much rain a normal year brings, and how those averages are shifting. A cold week
          says nothing about climate, and a warm decade says nothing about whether you need an umbrella tomorrow.
        </p>
        {data?.explainer?.length ? (
          <div className="mt-4 space-y-3">
            {data.explainer.map((item, i) => (
              <div key={i} className="panel-tight p-4">
                <p className="text-sm font-semibold text-mist-100">{item.heading || item.title}</p>
                <p className="mt-1 text-sm text-mist-300">{item.text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mt-6 max-w-xl">
        <LocationSearch onSelect={setLocation} />
      </div>

      {error ? (
        <div className="mt-8"><ErrorState message={error} onRetry={load} /></div>
      ) : loading ? (
        <div className="mt-8"><LoadingBlock label={t('loading.climate')} /></div>
      ) : data ? (
        <div className="mt-8 space-y-6">
          <section className="panel p-5">
            <h2 className="section-title">
              Averages for {data.period.startYear}–{data.period.endYear}
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="panel-tight p-4">
                <dt className="text-sm text-mist-400">Wettest month</dt>
                <dd className="metric-value mt-1">{data.summary.wettestMonth || '—'}</dd>
                <p className="text-xs text-mist-400">{formatNumber(data.summary.wettestMonthRainfall, ' mm')} on average</p>
              </div>
              <div className="panel-tight p-4">
                <dt className="text-sm text-mist-400">Hottest month</dt>
                <dd className="metric-value mt-1">{data.summary.hottestMonth || '—'}</dd>
                <p className="text-xs text-mist-400">{formatTemp(data.summary.hottestMonthMaxTemp)} average high</p>
              </div>
              <div className="panel-tight p-4">
                <dt className="text-sm text-mist-400">Coolest month</dt>
                <dd className="metric-value mt-1">{data.summary.coolestMonth || '—'}</dd>
                <p className="text-xs text-mist-400">{formatTemp(data.summary.coolestMonthMinTemp)} average low</p>
              </div>
              <div className="panel-tight p-4">
                <dt className="text-sm text-mist-400">Annual rainfall</dt>
                <dd className="metric-value mt-1">{formatNumber(data.summary.annualRainfall, ' mm')}</dd>
                <p className="text-xs text-mist-400">Mean of {data.period.years} years</p>
              </div>
            </dl>
          </section>

          <section className="panel p-5">
            <h2 className="section-title">Monthly normals</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyNormals}>
                  <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} unit=" mm" width={60} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,.05)' }} />
                  <Bar dataKey="avgPrecipitation" name="Rainfall" fill="#2FC2F0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyNormals}>
                  <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis {...axis} unit="°" width={50} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgMaxTemp" name="Average high" stroke="#F07E3C" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avgMinTemp" name="Average low" stroke="#5AD7FB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="section-title">Annual mean temperature</h2>
            <p className="mt-1 text-sm text-mist-300">{data.summary.trendNote}</p>
            {data.summary.temperatureTrendPerDecade !== null ? (
              <p className="mt-2 text-sm text-mist-200">
                Measured trend over this period: {data.summary.temperatureTrendPerDecade > 0 ? '+' : ''}
                {data.summary.temperatureTrendPerDecade} °C per decade.
              </p>
            ) : null}
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.annualSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
                  <XAxis dataKey="year" {...axis} />
                  <YAxis {...axis} unit="°" width={50} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgTemp" name="Annual mean" stroke="#49CFA1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <SourceList sources={[{ kind: 'Climate data', name: data.source.name, url: data.source.url }]} />
        </div>
      ) : null}
    </div>
  );
}

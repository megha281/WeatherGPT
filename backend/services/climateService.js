const weatherService = require('./weatherService');
const cache = require('./cache');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function mean(values) {
  const v = values.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

/** Least-squares slope of y against x (used for the annual temperature trend). */
function linearSlope(points) {
  if (points.length < 3) return null;
  const n = points.length;
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  const sxy = points.reduce((s, p) => s + p.x * p.y, 0);
  const sxx = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sxx - sx * sx;
  if (!denom) return null;
  return (n * sxy - sx * sy) / denom;
}

/**
 * Climate summary computed from the ERA5 reanalysis archive (Open-Meteo).
 * Every number returned here is calculated from downloaded observations -
 * nothing is estimated or invented. If the archive is unavailable the caller
 * receives an error rather than placeholder data.
 */
async function getClimateInformation(latitude, longitude, { years = 10 } = {}) {
  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - (years - 1);
  const key = `climate:${Number(latitude).toFixed(2)}:${Number(longitude).toFixed(2)}:${startYear}-${endYear}`;

  return cache.wrap(key, 60 * 60 * 24, async () => {
    const daily = await weatherService.getHistoricalDaily(
      latitude,
      longitude,
      `${startYear}-01-01`,
      `${endYear}-12-31`
    );
    if (!daily || !Array.isArray(daily.time)) {
      throw new Error('Historical data unavailable for this location');
    }

    const monthly = MONTHS.map(() => ({ tmax: [], tmin: [], tmean: [], precip: [] }));
    const annual = new Map();

    daily.time.forEach((date, i) => {
      const d = new Date(date);
      const m = d.getMonth();
      const y = d.getFullYear();
      const tmax = daily.temperature_2m_max?.[i];
      const tmin = daily.temperature_2m_min?.[i];
      const tmean = daily.temperature_2m_mean?.[i];
      const precip = daily.precipitation_sum?.[i];

      if (Number.isFinite(tmax)) monthly[m].tmax.push(tmax);
      if (Number.isFinite(tmin)) monthly[m].tmin.push(tmin);
      if (Number.isFinite(tmean)) monthly[m].tmean.push(tmean);
      if (Number.isFinite(precip)) monthly[m].precip.push(precip);

      if (!annual.has(y)) annual.set(y, { temps: [], precip: 0 });
      const a = annual.get(y);
      if (Number.isFinite(tmean)) a.temps.push(tmean);
      if (Number.isFinite(precip)) a.precip += precip;
    });

    const monthlyNormals = MONTHS.map((label, i) => ({
      month: label,
      avgMaxTemp: monthly[i].tmax.length ? Number(mean(monthly[i].tmax).toFixed(1)) : null,
      avgMinTemp: monthly[i].tmin.length ? Number(mean(monthly[i].tmin).toFixed(1)) : null,
      avgTemp: monthly[i].tmean.length ? Number(mean(monthly[i].tmean).toFixed(1)) : null,
      // Average monthly rainfall total = sum of daily rain / number of years covered
      avgPrecipitation: monthly[i].precip.length
        ? Number((monthly[i].precip.reduce((a, b) => a + b, 0) / (endYear - startYear + 1)).toFixed(1))
        : null,
    }));

    const annualSeries = Array.from(annual.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, v]) => ({
        year,
        avgTemp: v.temps.length ? Number(mean(v.temps).toFixed(2)) : null,
        totalPrecipitation: Number(v.precip.toFixed(1)),
      }));

    const slope = linearSlope(
      annualSeries.filter((a) => a.avgTemp !== null).map((a) => ({ x: a.year, y: a.avgTemp }))
    );

    const wettest = monthlyNormals.reduce((a, b) => ((b.avgPrecipitation ?? -1) > (a.avgPrecipitation ?? -1) ? b : a), monthlyNormals[0]);
    const hottest = monthlyNormals.reduce((a, b) => ((b.avgMaxTemp ?? -99) > (a.avgMaxTemp ?? -99) ? b : a), monthlyNormals[0]);
    const coolest = monthlyNormals.reduce((a, b) => ((b.avgMinTemp ?? 99) < (a.avgMinTemp ?? 99) ? b : a), monthlyNormals[0]);

    return {
      period: { startYear, endYear, years: endYear - startYear + 1 },
      monthlyNormals,
      annualSeries,
      summary: {
        wettestMonth: wettest?.month || null,
        wettestMonthRainfall: wettest?.avgPrecipitation ?? null,
        hottestMonth: hottest?.month || null,
        hottestMonthMaxTemp: hottest?.avgMaxTemp ?? null,
        coolestMonth: coolest?.month || null,
        coolestMonthMinTemp: coolest?.avgMinTemp ?? null,
        annualRainfall: Number(
          (annualSeries.reduce((s, a) => s + a.totalPrecipitation, 0) / annualSeries.length).toFixed(1)
        ),
        temperatureTrendPerDecade: slope === null ? null : Number((slope * 10).toFixed(2)),
        trendNote:
          slope === null
            ? 'Not enough complete years to compute a trend.'
            : `Least-squares trend of annual mean temperature over ${annualSeries.length} years. A period this short reflects natural variability as well as any long-term change, so treat it as an indication, not a climate projection.`,
      },
      source: {
        name: 'Open-Meteo Historical Weather API (ERA5 reanalysis)',
        url: 'https://open-meteo.com/en/docs/historical-weather-api',
      },
    };
  });
}

module.exports = { getClimateInformation, MONTHS };

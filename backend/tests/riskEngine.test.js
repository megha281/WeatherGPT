const { analyzeRisk, analyzeFromForecast } = require('../services/riskEngine');

describe('risk engine - rainfall', () => {
  test('quiet weather is LOW risk', () => {
    const r = analyzeRisk({ maxTemp: 28, minTemp: 20, rainProbability: 10, rainfallMm: 0, windGusts: 12, weatherCode: 1 });
    expect(r.level).toBe('LOW');
    expect(r.type).toMatch(/no significant/i);
  });

  test('high rain probability is MODERATE', () => {
    const r = analyzeRisk({ maxTemp: 29, rainProbability: 80, rainfallMm: 18, weatherCode: 61 });
    expect(r.level).toBe('MODERATE');
    expect(r.advisory).toMatch(/rain/i);
  });

  test('IMD heavy rainfall threshold is HIGH', () => {
    const r = analyzeRisk({ rainProbability: 90, rainfallMm: 70, weatherCode: 65 });
    expect(r.level).toBe('HIGH');
  });

  test('very heavy rainfall is SEVERE', () => {
    const r = analyzeRisk({ rainProbability: 95, rainfallMm: 130, weatherCode: 65 });
    expect(r.level).toBe('SEVERE');
  });
});

describe('risk engine - heat, wind, storms', () => {
  test('40C is a heat wave level risk', () => {
    const r = analyzeRisk({ maxTemp: 41, feelsLike: 43, humidity: 40 });
    expect(r.level).toBe('HIGH');
    expect(r.type).toMatch(/heat/i);
  });

  test('45C is severe', () => {
    expect(analyzeRisk({ maxTemp: 46 }).level).toBe('SEVERE');
  });

  test('gusts above 62 km/h are HIGH', () => {
    const r = analyzeRisk({ windGusts: 70, maxTemp: 30 });
    expect(r.level).toBe('HIGH');
    expect(r.type).toMatch(/wind/i);
  });

  test('thunderstorm code raises a thunderstorm risk', () => {
    const r = analyzeRisk({ weatherCode: 95, rainfallMm: 20, rainProbability: 85 });
    expect(r.risks.some((x) => /thunderstorm/i.test(x.type))).toBe(true);
    expect(['HIGH', 'SEVERE']).toContain(r.level);
  });

  test('output is always labelled as our own assessment', () => {
    const r = analyzeRisk({ maxTemp: 30 });
    expect(r.sourceType).toBe('weathergpt');
    expect(r.source).toBe('WeatherGPT Risk Assessment');
    expect(r.disclaimer).toMatch(/not an official/i);
  });

  test('same input always gives the same level (deterministic)', () => {
    const input = { maxTemp: 38, rainProbability: 55, windGusts: 45, weatherCode: 3 };
    expect(analyzeRisk(input).level).toBe(analyzeRisk(input).level);
  });
});

describe('analyzeFromForecast', () => {
  test('combines current and daily payloads', () => {
    const r = analyzeFromForecast({
      current: { temperature: 34, feelsLike: 38, humidity: 55, windSpeed: 12, windGusts: 20, uvIndexMax: 9 },
      daily: { days: [{ maxTemp: 41, minTemp: 27, rainProbability: 20, precipitationSum: 0, windGustsMax: 30, weatherCode: 1, uvIndexMax: 9 }] },
      hourly: { hours: [{ windGusts: 25 }] },
    });
    expect(r.level).toBe('HIGH');
    expect(r.risks.length).toBeGreaterThan(1);
  });
});

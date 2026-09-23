// WMO weather interpretation codes used by Open-Meteo.
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes WW)
const WMO_CODES = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'sun-cloud' },
  2: { label: 'Partly cloudy', icon: 'sun-cloud' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'fog' },
  48: { label: 'Depositing rime fog', icon: 'fog' },
  51: { label: 'Light drizzle', icon: 'drizzle' },
  53: { label: 'Moderate drizzle', icon: 'drizzle' },
  55: { label: 'Dense drizzle', icon: 'drizzle' },
  56: { label: 'Light freezing drizzle', icon: 'sleet' },
  57: { label: 'Dense freezing drizzle', icon: 'sleet' },
  61: { label: 'Slight rain', icon: 'rain' },
  63: { label: 'Moderate rain', icon: 'rain' },
  65: { label: 'Heavy rain', icon: 'rain' },
  66: { label: 'Light freezing rain', icon: 'sleet' },
  67: { label: 'Heavy freezing rain', icon: 'sleet' },
  71: { label: 'Slight snowfall', icon: 'snow' },
  73: { label: 'Moderate snowfall', icon: 'snow' },
  75: { label: 'Heavy snowfall', icon: 'snow' },
  77: { label: 'Snow grains', icon: 'snow' },
  80: { label: 'Slight rain showers', icon: 'showers' },
  81: { label: 'Moderate rain showers', icon: 'showers' },
  82: { label: 'Violent rain showers', icon: 'showers' },
  85: { label: 'Slight snow showers', icon: 'snow' },
  86: { label: 'Heavy snow showers', icon: 'snow' },
  95: { label: 'Thunderstorm', icon: 'storm' },
  96: { label: 'Thunderstorm with slight hail', icon: 'storm' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'storm' },
};

const describeWeatherCode = (code) =>
  WMO_CODES[code] || { label: 'Unknown conditions', icon: 'cloud' };

const isThunderstormCode = (code) => [95, 96, 99].includes(Number(code));
const isHeavyRainCode = (code) => [65, 67, 82].includes(Number(code));
const isRainCode = (code) =>
  [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(Number(code));

module.exports = { WMO_CODES, describeWeatherCode, isThunderstormCode, isHeavyRainCode, isRainCode };

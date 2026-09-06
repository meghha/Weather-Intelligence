import {
  DailyForecastItem,
  GeoLocationItem,
  HourlyForecastItem,
  WeatherData,
} from '../types';
import { formatDayName, formatHourShort } from '../utils/weatherUtils';

export const POPULAR_CITIES: GeoLocationItem[] = [
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
  {
    id: 5391959,
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    country: 'United States',
    country_code: 'US',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    country: 'Australia',
    country_code: 'AU',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
];

export async function searchCities(query: string): Promise<GeoLocationItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      elevation: item.elevation,
      country: item.country,
      country_code: item.country_code,
      admin1: item.admin1,
      admin2: item.admin2,
      timezone: item.timezone || 'UTC',
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

export async function reverseGeocodeLocation(lat: number, lon: number): Promise<GeoLocationItem> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'My Location';
      return {
        id: Math.floor(lat * 1000 + lon),
        name: cityName,
        latitude: lat,
        longitude: lon,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }

  return {
    id: Math.floor(lat * 1000 + lon),
    name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    latitude: lat,
    longitude: lon,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}

export async function fetchWeatherData(location: GeoLocationItem): Promise<WeatherData> {
  const { latitude, longitude } = location;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=8`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  const timezone = data.timezone || location.timezone || 'UTC';

  // Process current
  const current = {
    time: data.current.time,
    temperature: Number(data.current.temperature_2m),
    apparentTemperature: Number(data.current.apparent_temperature),
    humidity: Number(data.current.relative_humidity_2m),
    isDay: data.current.is_day === 1,
    precipitation: Number(data.current.precipitation ?? 0),
    rain: Number(data.current.rain ?? 0),
    weatherCode: Number(data.current.weather_code),
    cloudCover: Number(data.current.cloud_cover ?? 0),
    pressure: Number(data.current.pressure_msl ?? 1013),
    windSpeed: Number(data.current.wind_speed_10m ?? 0),
    windDirection: Number(data.current.wind_direction_10m ?? 0),
    windGusts: Number(data.current.wind_gusts_10m ?? data.current.wind_speed_10m ?? 0),
  };

  // Find index of current hour or first future hour
  const hourlyTimes: string[] = data.hourly.time || [];
  const currentTimeIso = data.current.time;
  let startIndex = 0;

  // Hourly arrays usually start at 00:00 of current day. Find index closest to currentTimeIso
  for (let i = 0; i < hourlyTimes.length; i++) {
    if (hourlyTimes[i] >= currentTimeIso) {
      startIndex = Math.max(0, i);
      break;
    }
  }

  // Extract next 36 hours from startIndex
  const slicedHourlyTimes = hourlyTimes.slice(startIndex, startIndex + 36);
  const hourly: HourlyForecastItem[] = slicedHourlyTimes.map((isoTime, idx) => {
    const rawIdx = startIndex + idx;
    return {
      time: isoTime,
      formattedTime: formatHourShort(isoTime, timezone),
      temperature: Number(data.hourly.temperature_2m?.[rawIdx] ?? 0),
      apparentTemperature: Number(data.hourly.apparent_temperature?.[rawIdx] ?? 0),
      humidity: Number(data.hourly.relative_humidity_2m?.[rawIdx] ?? 0),
      precipitationProbability: Number(data.hourly.precipitation_probability?.[rawIdx] ?? 0),
      precipitation: Number(data.hourly.precipitation?.[rawIdx] ?? 0),
      weatherCode: Number(data.hourly.weather_code?.[rawIdx] ?? 0),
      windSpeed: Number(data.hourly.wind_speed_10m?.[rawIdx] ?? 0),
      uvIndex: Number(data.hourly.uv_index?.[rawIdx] ?? 0),
    };
  });

  // Process 7-day daily forecast (skip extra 8th day or take 7)
  const dailyDates: string[] = data.daily.time || [];
  const daily: DailyForecastItem[] = dailyDates.slice(0, 7).map((dateStr, index) => {
    const dayLabel = formatDayName(dateStr, timezone, index);
    return {
      date: dateStr,
      dayOfWeek: dayLabel.day,
      formattedDate: dayLabel.date,
      weatherCode: Number(data.daily.weather_code?.[index] ?? 0),
      tempMax: Number(data.daily.temperature_2m_max?.[index] ?? 0),
      tempMin: Number(data.daily.temperature_2m_min?.[index] ?? 0),
      apparentTempMax: Number(data.daily.apparent_temperature_max?.[index] ?? 0),
      apparentTempMin: Number(data.daily.apparent_temperature_min?.[index] ?? 0),
      sunrise: data.daily.sunrise?.[index] ?? '',
      sunset: data.daily.sunset?.[index] ?? '',
      uvIndexMax: Number(data.daily.uv_index_max?.[index] ?? 0),
      precipitationSum: Number(data.daily.precipitation_sum?.[index] ?? 0),
      precipitationProbabilityMax: Number(data.daily.precipitation_probability_max?.[index] ?? 0),
      windSpeedMax: Number(data.daily.wind_speed_10m_max?.[index] ?? 0),
    };
  });

  return {
    location: {
      ...location,
      timezone,
    },
    current,
    hourly,
    daily,
    timezone,
    elevation: Number(data.elevation ?? 0),
    lastUpdated: new Date().toISOString(),
  };
}

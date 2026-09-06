import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  LucideIcon,
} from 'lucide-react';
import { TemperatureUnit, WindSpeedUnit } from '../types';

export interface WeatherConditionInfo {
  label: string;
  icon: LucideIcon;
  description: string;
}

export function getWeatherCondition(code: number, isDay = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Sunny' : 'Clear Sky',
        icon: isDay ? Sun : Moon,
        description: isDay ? 'Clear sunny skies' : 'Clear night sky',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Sunny' : 'Mostly Clear',
        icon: isDay ? Sun : Moon,
        description: 'Mainly clear with minimal cloud cover',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        icon: isDay ? CloudSun : CloudMoon,
        description: 'Scattered clouds with periods of sunshine',
      };
    case 3:
      return {
        label: 'Overcast',
        icon: Cloud,
        description: 'Persistent cloud blanket with low direct sunlight',
      };
    case 45:
      return {
        label: 'Foggy',
        icon: CloudFog,
        description: 'Reduced visibility due to ground fog',
      };
    case 48:
      return {
        label: 'Rime Fog',
        icon: CloudFog,
        description: 'Freezing fog depositing delicate rime crystals',
      };
    case 51:
      return {
        label: 'Light Drizzle',
        icon: CloudDrizzle,
        description: 'Sparse, gentle misting precipitation',
      };
    case 53:
      return {
        label: 'Moderate Drizzle',
        icon: CloudDrizzle,
        description: 'Consistent fine drizzle',
      };
    case 55:
      return {
        label: 'Dense Drizzle',
        icon: CloudDrizzle,
        description: 'Heavy drizzle with dampened surfaces',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        icon: CloudDrizzle,
        description: 'Sub-zero drizzle creating slippery slick glaze',
      };
    case 61:
      return {
        label: 'Light Rain',
        icon: CloudRain,
        description: 'Gentle, steady rainfall',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        icon: CloudRain,
        description: 'Steady rain accumulating on ground',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        icon: CloudRain,
        description: 'Intense rain downpours with pooling water',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        icon: CloudRain,
        description: 'Hazardous freezing rain forming black ice',
      };
    case 71:
      return {
        label: 'Light Snow',
        icon: CloudSnow,
        description: 'Gentle flurries and light snowfall',
      };
    case 73:
      return {
        label: 'Moderate Snow',
        icon: CloudSnow,
        description: 'Steady snowfall accumulating',
      };
    case 75:
      return {
        label: 'Heavy Snow',
        icon: CloudSnow,
        description: 'Heavy snow accumulations and low visibility',
      };
    case 77:
      return {
        label: 'Snow Grains',
        icon: CloudSnow,
        description: 'Small frozen opaque ice particles',
      };
    case 80:
      return {
        label: 'Light Showers',
        icon: CloudRain,
        description: 'Scattered passing rain showers',
      };
    case 81:
      return {
        label: 'Passing Showers',
        icon: CloudRain,
        description: 'Moderate periodic convective showers',
      };
    case 82:
      return {
        label: 'Heavy Showers',
        icon: CloudRain,
        description: 'Sudden, intense downpour showers',
      };
    case 85:
      return {
        label: 'Light Snow Showers',
        icon: CloudSnow,
        description: 'Intermittent snow shower bursts',
      };
    case 86:
      return {
        label: 'Heavy Snow Showers',
        icon: CloudSnow,
        description: 'Intense, blinding snow bursts',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        icon: CloudLightning,
        description: 'Convective storm with lightning and rumble',
      };
    case 96:
    case 99:
      return {
        label: 'Severe Thunderstorm',
        icon: CloudLightning,
        description: 'Severe electrical storm with hail potential',
      };
    default:
      return {
        label: 'Variable',
        icon: Cloud,
        description: 'Mixed atmospheric conditions',
      };
  }
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return `${f}°`;
  }
  return `${Math.round(celsius)}°`;
}

export function formatTempNumber(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): string {
  if (unit === 'mph') {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindCompassDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function getUVCategory(uv: number): { label: string; color: string; advice: string } {
  if (uv <= 2) {
    return { label: 'Low', color: 'text-emerald-700 dark:text-emerald-400', advice: 'No protection needed' };
  }
  if (uv <= 5) {
    return { label: 'Moderate', color: 'text-amber-700 dark:text-amber-400', advice: 'Wear SPF 30+ & sunglasses' };
  }
  if (uv <= 7) {
    return { label: 'High', color: 'text-orange-700 dark:text-orange-400', advice: 'Seek midday shade, hat & SPF' };
  }
  if (uv <= 10) {
    return { label: 'Very High', color: 'text-rose-700 dark:text-rose-400', advice: 'Minimize sun exposure 10am-4pm' };
  }
  return { label: 'Extreme', color: 'text-purple-700 dark:text-purple-400', advice: 'Avoid direct sun exposure' };
}

export function formatTimeString(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  } catch {
    return isoString.slice(11, 16);
  }
}

export function formatHourShort(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: true,
      timeZone: timezone,
    }).format(date);
  } catch {
    return isoString.slice(11, 13) + ':00';
  }
}

export function formatDayName(dateString: string, timezone: string, index: number): { day: string; date: string } {
  if (index === 0) {
    return {
      day: 'Today',
      date: formatDateMonthDay(dateString, timezone),
    };
  }
  if (index === 1) {
    return {
      day: 'Tomorrow',
      date: formatDateMonthDay(dateString, timezone),
    };
  }

  try {
    // Parse YYYY-MM-DD
    const parts = dateString.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    return { day, date: monthDay };
  } catch {
    return { day: 'Day ' + (index + 1), date: dateString };
  }
}

function formatDateMonthDay(dateString: string, _timezone: string): string {
  try {
    const parts = dateString.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
}

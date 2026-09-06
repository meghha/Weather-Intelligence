export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';

export interface GeoLocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  country_code?: string;
  admin1?: string; // State or province
  admin2?: string;
  timezone: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

export interface HourlyForecastItem {
  time: string; // ISO string
  formattedTime: string; // e.g. "2 PM"
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Mon", "Today", etc.
  formattedDate: string; // "Sep 7"
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface WeatherData {
  location: GeoLocationItem;
  current: CurrentWeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  timezone: string;
  elevation: number;
  lastUpdated: string;
}

export type PlanningCategory = 'recreation' | 'commute' | 'wardrobe' | 'lifestyle';
export type RecommendationStatus = 'ideal' | 'good' | 'caution' | 'alert';

export interface PlanningRecommendation {
  id: string;
  category: PlanningCategory;
  title: string;
  status: RecommendationStatus;
  summary: string;
  detail: string;
  highlights: string[];
}

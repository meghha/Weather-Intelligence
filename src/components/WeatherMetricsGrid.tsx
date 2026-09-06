import {
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Cloud,
  Gauge,
  Navigation,
} from 'lucide-react';
import { CurrentWeatherData, DailyForecastItem, WindSpeedUnit } from '../types';
import {
  formatWindSpeed,
  getUVCategory,
  getWindCompassDirection,
} from '../utils/weatherUtils';

interface WeatherMetricsGridProps {
  current: CurrentWeatherData;
  todayDaily?: DailyForecastItem;
  windUnit: WindSpeedUnit;
}

export function WeatherMetricsGrid({
  current,
  todayDaily,
  windUnit,
}: WeatherMetricsGridProps) {
  const uvValue = todayDaily?.uvIndexMax ?? 0;
  const uvCategory = getUVCategory(uvValue);
  const compassDir = getWindCompassDirection(current.windDirection);

  // Approximate dew point using Magnus formula
  const a = 17.27;
  const b = 237.7;
  const alpha =
    (a * current.temperature) / (b + current.temperature) +
    Math.log(Math.max(current.humidity, 1) / 100);
  const dewPoint = (b * alpha) / (a - alpha);

  // Pressure evaluation
  let pressureStatus = 'Normal';
  if (current.pressure > 1022) pressureStatus = 'High (Clear weather)';
  else if (current.pressure < 1005) pressureStatus = 'Low (Storm tendency)';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* 1. Wind & Gusts */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Wind & Direction</span>
          <Wind className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-stone-900">
            {formatWindSpeed(current.windSpeed, windUnit)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-600">
            <Navigation
              className="h-3 w-3 text-amber-600 transition-transform"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span className="font-medium">{compassDir}</span>
            <span className="text-stone-400">({current.windDirection}°)</span>
          </div>
        </div>
        <div className="text-[11px] text-stone-400">
          Gusts up to {formatWindSpeed(current.windGusts, windUnit)}
        </div>
      </div>

      {/* 2. Humidity & Dew Point */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Humidity</span>
          <Droplets className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-stone-900">
            {current.humidity}%
          </div>
          <div className="mt-1 text-xs text-stone-600">
            Dew point: <span className="font-medium">{Math.round(dewPoint)}°</span>
          </div>
        </div>
        <div className="text-[11px] text-stone-400">
          {current.humidity > 70 ? 'High moisture' : current.humidity < 35 ? 'Dry air' : 'Comfortable'}
        </div>
      </div>

      {/* 3. UV Index */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">UV Index</span>
          <Sun className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-stone-900">
              {uvValue.toFixed(1)}
            </span>
            <span className={`text-xs font-semibold ${uvCategory.color}`}>
              {uvCategory.label}
            </span>
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-stone-600">
            {uvCategory.advice}
          </div>
        </div>
        <div className="text-[11px] text-stone-400">Daily peak indicator</div>
      </div>

      {/* 4. Precipitation */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Precipitation</span>
          <CloudRain className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-stone-900">
            {todayDaily?.precipitationSum.toFixed(1) ?? current.precipitation.toFixed(1)} mm
          </div>
          <div className="mt-1 text-xs text-stone-600">
            Probability:{' '}
            <span className="font-medium text-stone-900">
              {todayDaily?.precipitationProbabilityMax ?? 0}%
            </span>
          </div>
        </div>
        <div className="text-[11px] text-stone-400">
          Current rate: {current.precipitation.toFixed(1)} mm/h
        </div>
      </div>

      {/* 5. Cloud Cover */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Cloud Cover</span>
          <Cloud className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-stone-900">
            {current.cloudCover}%
          </div>
          <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-500"
              style={{ width: `${current.cloudCover}%` }}
            />
          </div>
        </div>
        <div className="text-[11px] text-stone-400">
          {current.cloudCover < 20 ? 'Clear sky' : current.cloudCover < 70 ? 'Partly cloudy' : 'Overcast'}
        </div>
      </div>

      {/* 6. Pressure */}
      <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Air Pressure</span>
          <Gauge className="h-4 w-4 text-stone-400" />
        </div>
        <div className="my-2">
          <div className="text-xl font-bold tracking-tight text-stone-900">
            {Math.round(current.pressure)}{' '}
            <span className="text-xs font-normal text-stone-500">hPa</span>
          </div>
          <div className="mt-1 text-xs text-stone-600">{pressureStatus}</div>
        </div>
        <div className="text-[11px] text-stone-400">Mean sea level</div>
      </div>
    </div>
  );
}

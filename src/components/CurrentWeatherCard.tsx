import { Sunrise, Sunset, Droplets, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { TemperatureUnit, WeatherData, WindSpeedUnit } from '../types';
import {
  formatTemp,
  formatTimeString,
  formatWindSpeed,
  getWeatherCondition,
} from '../utils/weatherUtils';

interface CurrentWeatherCardProps {
  weather: WeatherData;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export function CurrentWeatherCard({
  weather,
  tempUnit,
  windUnit,
}: CurrentWeatherCardProps) {
  const { current, daily, location, timezone } = weather;
  const today = daily[0];

  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const ConditionIcon = condition.icon;

  // Daylight progress calculation
  const sunriseStr = today?.sunrise;
  const sunsetStr = today?.sunset;

  let daylightPercentage = 50;
  let isCurrentlyDaylight = current.isDay;

  if (sunriseStr && sunsetStr) {
    try {
      const sunriseTime = new Date(sunriseStr).getTime();
      const sunsetTime = new Date(sunsetStr).getTime();
      const currentTime = new Date(current.time).getTime();

      if (currentTime < sunriseTime) {
        daylightPercentage = 0;
        isCurrentlyDaylight = false;
      } else if (currentTime > sunsetTime) {
        daylightPercentage = 100;
        isCurrentlyDaylight = false;
      } else {
        const totalDuration = sunsetTime - sunriseTime;
        const elapsed = currentTime - sunriseTime;
        daylightPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        isCurrentlyDaylight = true;
      }
    } catch {
      daylightPercentage = current.isDay ? 60 : 0;
    }
  }

  return (
    <div
      id="current-weather-card"
      className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7"
    >
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        {/* Left Column: Location & Main Temp */}
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {location.name}
              </h2>
              {location.country_code && (
                <span className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold text-stone-600">
                  {location.country_code}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-stone-500">
              {[location.admin1, location.country].filter(Boolean).join(', ')} • {timezone}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold tracking-tighter text-stone-900 sm:text-7xl">
              {formatTemp(current.temperature, tempUnit)}
            </span>
            <div className="space-y-1">
              <div className="text-sm font-medium text-stone-600">
                Feels like{' '}
                <span className="font-semibold text-stone-900">
                  {formatTemp(current.apparentTemperature, tempUnit)}
                </span>
              </div>
              {today && (
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="inline-flex items-center text-stone-700">
                    <ArrowUp className="mr-0.5 h-3 w-3 text-rose-500" />
                    High: {formatTemp(today.tempMax, tempUnit)}
                  </span>
                  <span className="inline-flex items-center text-stone-700">
                    <ArrowDown className="mr-0.5 h-3 w-3 text-blue-500" />
                    Low: {formatTemp(today.tempMin, tempUnit)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Condition tag */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-800">
              <ConditionIcon className="h-4 w-4 text-amber-600" />
              <span>{condition.label}</span>
            </div>
            <span className="text-xs text-stone-500">{condition.description}</span>
          </div>
        </div>

        {/* Right Column: Mini quick stats & Daylight tracker */}
        <div className="flex flex-col justify-between gap-5 rounded-xl border border-stone-100 bg-stone-50/80 p-4 lg:w-80">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Wind className="h-3.5 w-3.5 text-stone-400" />
                <span>Wind Speed</span>
              </div>
              <div className="font-semibold text-stone-900">
                {formatWindSpeed(current.windSpeed, windUnit)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Droplets className="h-3.5 w-3.5 text-stone-400" />
                <span>Humidity</span>
              </div>
              <div className="font-semibold text-stone-900">{current.humidity}%</div>
            </div>
          </div>

          {/* Sunrise / Sunset bar */}
          {sunriseStr && sunsetStr && (
            <div className="space-y-2 border-t border-stone-200/60 pt-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-1">
                  <Sunrise className="h-3.5 w-3.5 text-amber-600" />
                  <span>Sunrise: {formatTimeString(sunriseStr, timezone)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sunset className="h-3.5 w-3.5 text-orange-600" />
                  <span>Sunset: {formatTimeString(sunsetStr, timezone)}</span>
                </div>
              </div>

              {/* Daylight progression track */}
              <div className="space-y-1">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${daylightPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Dawn</span>
                  <span className="font-medium text-stone-600">
                    {isCurrentlyDaylight ? `${daylightPercentage}% daylight elapsed` : 'Night time'}
                  </span>
                  <span>Dusk</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

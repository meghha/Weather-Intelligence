import { useState } from 'react';
import {
  Calendar,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DailyForecastItem, TemperatureUnit, WindSpeedUnit } from '../types';
import {
  formatTemp,
  formatTimeString,
  formatWindSpeed,
  getUVCategory,
  getWeatherCondition,
} from '../utils/weatherUtils';

interface SevenDayForecastProps {
  daily: DailyForecastItem[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  timezone: string;
}

export function SevenDayForecast({
  daily,
  tempUnit,
  windUnit,
  timezone,
}: SevenDayForecastProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!daily || daily.length === 0) return null;

  // Calculate 7-day absolute min and max for calibrated temperature bars
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const weekRange = Math.max(1, weekMax - weekMin);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div
      id="seven-day-forecast-section"
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">
            7-Day Forecast
          </h3>
        </div>
        <span className="text-xs text-stone-400">Click any day for details</span>
      </div>

      <div className="divide-y divide-stone-100">
        {daily.map((item, idx) => {
          const condition = getWeatherCondition(item.weatherCode, true);
          const ConditionIcon = condition.icon;
          const isExpanded = expandedIndex === idx;

          // Bar calculation
          const leftPercent = Math.max(
            0,
            Math.min(100, ((item.tempMin - weekMin) / weekRange) * 100)
          );
          const widthPercent = Math.max(
            8,
            Math.min(100 - leftPercent, ((item.tempMax - item.tempMin) / weekRange) * 100)
          );

          const uvCategory = getUVCategory(item.uvIndexMax);

          return (
            <div key={item.date} className="py-2.5">
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-stone-50"
              >
                {/* Day name & date */}
                <div className="w-24 shrink-0 sm:w-28">
                  <div className="font-semibold text-stone-900">
                    {item.dayOfWeek}
                  </div>
                  <div className="text-xs text-stone-400">{item.formattedDate}</div>
                </div>

                {/* Weather Condition */}
                <div className="flex min-w-[120px] flex-1 items-center gap-2.5 sm:flex-initial">
                  <ConditionIcon className="h-5 w-5 shrink-0 text-amber-600" />
                  <span className="text-xs font-medium text-stone-700 sm:text-sm">
                    {condition.label}
                  </span>
                </div>

                {/* Rain Probability badge */}
                <div className="hidden w-20 shrink-0 items-center gap-1 text-xs text-stone-600 sm:flex">
                  {item.precipitationProbabilityMax > 15 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                      <Droplets className="h-3 w-3" />
                      {item.precipitationProbabilityMax}%
                    </span>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </div>

                {/* Temperature Range Bar & Values */}
                <div className="flex w-44 shrink-0 items-center gap-2.5 sm:w-56">
                  <span className="w-7 text-right text-xs font-medium text-stone-500">
                    {formatTemp(item.tempMin, tempUnit)}
                  </span>

                  {/* Visual spectrum bar */}
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="absolute h-full rounded-full bg-stone-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span className="w-7 text-left text-xs font-semibold text-stone-900">
                    {formatTemp(item.tempMax, tempUnit)}
                  </span>
                </div>

                {/* Expand Chevron */}
                <div className="shrink-0 text-stone-400">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-2 rounded-xl border border-stone-100 bg-stone-50/70 p-3.5 text-xs text-stone-600">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-400">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        <span>Precipitation</span>
                      </div>
                      <div className="font-semibold text-stone-800">
                        {item.precipitationSum.toFixed(1)} mm ({item.precipitationProbabilityMax}%)
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-400">
                        <Wind className="h-3.5 w-3.5 text-stone-500" />
                        <span>Max Wind</span>
                      </div>
                      <div className="font-semibold text-stone-800">
                        {formatWindSpeed(item.windSpeedMax, windUnit)}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-400">
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                        <span>UV Index</span>
                      </div>
                      <div className="font-semibold text-stone-800">
                        {item.uvIndexMax.toFixed(1)} ({uvCategory.label})
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-400">
                        <Sunrise className="h-3.5 w-3.5 text-orange-500" />
                        <span>Sun Cycle</span>
                      </div>
                      <div className="font-semibold text-stone-800">
                        {item.sunrise ? formatTimeString(item.sunrise, timezone) : '—'} /{' '}
                        {item.sunset ? formatTimeString(item.sunset, timezone) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

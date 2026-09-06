import { useRef } from 'react';
import { Droplets, Wind, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit, WindSpeedUnit } from '../types';
import {
  formatTemp,
  formatWindSpeed,
  getWeatherCondition,
} from '../utils/weatherUtils';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export function HourlyForecast({
  hourly,
  tempUnit,
  windUnit,
}: HourlyForecastProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!hourly || hourly.length === 0) return null;

  return (
    <div
      id="hourly-forecast-section"
      className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-500" />
          <h3 className="text-base font-semibold text-stone-900">
            Hourly Outlook
          </h3>
          <span className="text-xs text-stone-400">Next 24–36 hours</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
            title="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
            title="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Horizontal timeline */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {hourly.map((hour, idx) => {
          // Parse hour to check if daytime (approx between 6 and 20)
          const hourNum = parseInt(hour.time.slice(11, 13), 10);
          const isDay = hourNum >= 6 && hourNum < 20;
          const condition = getWeatherCondition(hour.weatherCode, isDay);
          const ConditionIcon = condition.icon;

          return (
            <div
              key={`${hour.time}-${idx}`}
              className={`flex w-24 shrink-0 flex-col items-center justify-between rounded-xl border p-3 text-center transition-colors ${
                idx === 0
                  ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                  : 'border-stone-100 bg-stone-50 text-stone-800 hover:border-stone-200 hover:bg-stone-100/80'
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  idx === 0 ? 'text-amber-400' : 'text-stone-500'
                }`}
              >
                {idx === 0 ? 'Now' : hour.formattedTime}
              </div>

              <div className="my-2.5">
                <ConditionIcon
                  className={`h-6 w-6 ${
                    idx === 0
                      ? 'text-amber-300'
                      : 'text-stone-700'
                  }`}
                />
              </div>

              <div className="text-base font-bold tracking-tight">
                {formatTemp(hour.temperature, tempUnit)}
              </div>

              <div className="mt-2 flex w-full flex-col gap-1 border-t border-stone-200/40 pt-2 text-[10px]">
                {/* Rain Probability */}
                <div
                  className={`flex items-center justify-center gap-1 font-medium ${
                    hour.precipitationProbability > 40
                      ? idx === 0
                        ? 'text-blue-300'
                        : 'text-blue-600'
                      : idx === 0
                      ? 'text-stone-400'
                      : 'text-stone-400'
                  }`}
                >
                  <Droplets className="h-3 w-3" />
                  <span>{hour.precipitationProbability}%</span>
                </div>

                {/* Wind */}
                <div
                  className={`flex items-center justify-center gap-1 ${
                    idx === 0 ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  <Wind className="h-3 w-3" />
                  <span>{formatWindSpeed(hour.windSpeed, windUnit)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

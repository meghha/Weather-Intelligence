import { CloudSun, RefreshCw } from 'lucide-react';
import { TemperatureUnit, WindSpeedUnit } from '../types';

interface HeaderProps {
  cityName: string;
  localTime: string;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
  onToggleTempUnit: () => void;
  onToggleWindUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  cityName,
  localTime,
  tempUnit,
  windUnit,
  onToggleTempUnit,
  onToggleWindUnit,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header
      id="app-header"
      className="w-full border-b border-stone-200 bg-white/95 px-4 py-3.5 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400 shadow-sm">
            <CloudSun className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-stone-900">
                Weather Intelligence
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Open-Meteo
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {cityName ? `${cityName} • ${localTime}` : 'Global Atmospheric Forecasts'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          {/* Temperature unit switch */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5">
            <button
              id="unit-toggle-celsius"
              type="button"
              onClick={onToggleTempUnit}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tempUnit === 'celsius'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              °C
            </button>
            <button
              id="unit-toggle-fahrenheit"
              type="button"
              onClick={onToggleTempUnit}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tempUnit === 'fahrenheit'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              °F
            </button>
          </div>

          {/* Wind unit switch */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5">
            <button
              id="unit-toggle-kmh"
              type="button"
              onClick={onToggleWindUnit}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                windUnit === 'kmh'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              km/h
            </button>
            <button
              id="unit-toggle-mph"
              type="button"
              onClick={onToggleWindUnit}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                windUnit === 'mph'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              mph
            </button>
          </div>

          {/* Refresh button */}
          <button
            id="refresh-weather-btn"
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh latest forecast"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-stone-500 ${
                isRefreshing ? 'animate-spin text-stone-900' : ''
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}

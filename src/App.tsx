import { useState, useEffect, useCallback } from 'react';
import { CloudOff, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { HourlyForecast } from './components/HourlyForecast';
import { SevenDayForecast } from './components/SevenDayForecast';
import { PlanningRecommendations } from './components/PlanningRecommendations';
import { GeoLocationItem, TemperatureUnit, WeatherData, WindSpeedUnit } from './types';
import {
  POPULAR_CITIES,
  fetchWeatherData,
  reverseGeocodeLocation,
} from './services/weatherApi';
import { generatePlanningRecommendations } from './utils/recommendations';

export default function App() {
  // Default to New York or stored favorite
  const [selectedCity, setSelectedCity] = useState<GeoLocationItem>(() => {
    try {
      const saved = localStorage.getItem('weather_selected_city');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return POPULAR_CITIES[0]; // New York
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem('weather_temp_unit');
      if (saved === 'fahrenheit' || saved === 'celsius') return saved;
    } catch {
      // Ignore
    }
    return 'celsius';
  });

  const [windUnit, setWindUnit] = useState<WindSpeedUnit>(() => {
    try {
      const saved = localStorage.getItem('weather_wind_unit');
      if (saved === 'mph' || saved === 'kmh') return saved;
    } catch {
      // Ignore
    }
    return 'kmh';
  });

  const [localTimeString, setLocalTimeString] = useState<string>('');

  // Fetch weather logic
  const loadWeather = useCallback(async (city: GeoLocationItem, isSilentRefresh = false) => {
    if (!isSilentRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const data = await fetchWeatherData(city);
      setWeatherData(data);
      // Save selected city
      try {
        localStorage.setItem('weather_selected_city', JSON.stringify(city));
      } catch {
        // Ignore
      }
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setError(
        err?.message ||
          'Failed to retrieve weather data from Open-Meteo. Please check your network connection and retry.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch when selected city changes
  useEffect(() => {
    if (selectedCity) {
      loadWeather(selectedCity);
    }
  }, [selectedCity, loadWeather]);

  // Update destination timezone local time every 30 seconds
  useEffect(() => {
    const updateTime = () => {
      if (!weatherData?.timezone) return;
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: weatherData.timezone,
        }).format(new Date());
        setLocalTimeString(formatted);
      } catch {
        setLocalTimeString(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [weatherData?.timezone]);

  // Geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locItem = await reverseGeocodeLocation(latitude, longitude);
          setSelectedCity(locItem);
        } catch (e: any) {
          setError('Failed to resolve current location: ' + e?.message);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (geoError) => {
        setIsLoadingLocation(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location access was denied. Please search for your city manually.');
        } else {
          setError('Unable to acquire current location: ' + geoError.message);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Unit toggles
  const handleToggleTempUnit = () => {
    const nextUnit: TemperatureUnit = tempUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    setTempUnit(nextUnit);
    try {
      localStorage.setItem('weather_temp_unit', nextUnit);
    } catch {
      // Ignore
    }
  };

  const handleToggleWindUnit = () => {
    const nextUnit: WindSpeedUnit = windUnit === 'kmh' ? 'mph' : 'kmh';
    setWindUnit(nextUnit);
    try {
      localStorage.setItem('weather_wind_unit', nextUnit);
    } catch {
      // Ignore
    }
  };

  // Recommendations calculation
  const recommendations = weatherData
    ? generatePlanningRecommendations(
        weatherData.current,
        weatherData.hourly,
        weatherData.daily,
        weatherData.timezone
      )
    : [];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 antialiased">
      {/* Global Application Header */}
      <Header
        cityName={selectedCity.name}
        localTime={localTimeString}
        tempUnit={tempUnit}
        windUnit={windUnit}
        onToggleTempUnit={handleToggleTempUnit}
        onToggleWindUnit={handleToggleWindUnit}
        onRefresh={() => loadWeather(selectedCity, true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="space-y-6">
          {/* City Search and Quick Filter Bar */}
          <SearchBar
            onSelectCity={(city) => setSelectedCity(city)}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLoadingLocation={isLoadingLocation}
            selectedCityId={selectedCity.id}
          />

          {/* Error Banner */}
          {error && (
            <div
              id="weather-error-banner"
              className="flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <div>
                  <div className="font-semibold">Unable to fetch weather data</div>
                  <div className="mt-0.5 text-xs text-rose-700">{error}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadWeather(selectedCity)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-xs hover:bg-rose-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !weatherData && (
            <div className="space-y-6 py-8">
              <div className="flex items-center justify-center gap-3 text-stone-500">
                <Loader2 className="h-6 w-6 animate-spin text-stone-700" />
                <span className="text-sm font-medium">
                  Fetching live atmospheric telemetry from Open-Meteo for {selectedCity.name}...
                </span>
              </div>
              {/* Skeleton cards */}
              <div className="h-44 w-full animate-pulse rounded-2xl bg-stone-200/70" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-stone-200/70" />
                ))}
              </div>
              <div className="h-48 w-full animate-pulse rounded-2xl bg-stone-200/70" />
            </div>
          )}

          {/* Weather Content when loaded */}
          {weatherData && (
            <div className="space-y-6">
              {/* Primary Current Weather Display */}
              <CurrentWeatherCard
                weather={weatherData}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />

              {/* 6 Key Meteorological Telemetry Metrics */}
              <WeatherMetricsGrid
                current={weatherData.current}
                todayDaily={weatherData.daily[0]}
                windUnit={windUnit}
              />

              {/* Planning Recommendations Section */}
              <PlanningRecommendations recommendations={recommendations} />

              {/* Hourly Outlook (24-36 Hours) */}
              <HourlyForecast
                hourly={weatherData.hourly}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />

              {/* 7-Day Forecast Section */}
              <SevenDayForecast
                daily={weatherData.daily}
                tempUnit={tempUnit}
                windUnit={windUnit}
                timezone={weatherData.timezone}
              />
            </div>
          )}

          {/* Empty / Offline Fallback */}
          {!isLoading && !weatherData && !error && (
            <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500">
              <CloudOff className="mx-auto h-12 w-12 text-stone-300" />
              <h3 className="mt-4 text-base font-semibold text-stone-800">
                No weather data available
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Select a city from the quick chips above or enter a search query.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>
            Weather data powered by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-stone-600 underline hover:text-stone-900"
            >
              Open-Meteo Open-Source Weather API
            </a>{' '}
            • Free non-commercial WMO atmospheric modeling
          </p>
        </div>
      </footer>
    </div>
  );
}

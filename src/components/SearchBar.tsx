import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Search, MapPin, Loader2, X, Clock, Compass } from 'lucide-react';
import { GeoLocationItem } from '../types';
import { POPULAR_CITIES, searchCities } from '../services/weatherApi';

interface SearchBarProps {
  onSelectCity: (city: GeoLocationItem) => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation: boolean;
  selectedCityId?: number;
}

export function SearchBar({
  onSelectCity,
  onUseCurrentLocation,
  isLoadingLocation,
  selectedCityId,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<GeoLocationItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveRecentSearch = (city: GeoLocationItem) => {
    try {
      const updated = [city, ...recentSearches.filter((c) => c.id !== city.id)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const res = await searchCities(query);
      setResults(res);
      setIsSearching(false);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocationItem) => {
    saveRecentSearch(city);
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full space-y-3" ref={wrapperRef}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search input container */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </div>
          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any city, capital, or region (e.g., Zurich, Tokyo, Boston)..."
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pr-10 pl-10 text-sm text-stone-900 placeholder:text-stone-400 shadow-xs focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/5"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <div
              id="search-results-dropdown"
              className="absolute top-full z-40 mt-1.5 w-full rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                Search Results ({results.length})
              </div>
              <ul className="max-h-64 overflow-y-auto">
                {results.map((item, idx) => (
                  <li key={`${item.id}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors ${
                        selectedIndex === idx
                          ? 'bg-stone-100 text-stone-900'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Compass className="h-4 w-4 shrink-0 text-stone-400" />
                        <div>
                          <div className="font-medium text-stone-900">{item.name}</div>
                          <div className="text-xs text-stone-500">
                            {[item.admin1, item.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-stone-400">
                        {item.country_code}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No results message */}
          {isOpen && query.trim().length >= 2 && !isSearching && results.length === 0 && (
            <div className="absolute top-full z-40 mt-1.5 w-full rounded-xl border border-stone-200 bg-white p-4 text-center text-sm text-stone-500 shadow-lg">
              No matching cities found for &quot;{query}&quot;. Try checking the spelling.
            </div>
          )}
        </div>

        {/* Use My Location button */}
        <button
          id="btn-use-current-location"
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLoadingLocation}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-60"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin text-stone-600" />
          ) : (
            <MapPin className="h-4 w-4 text-amber-600" />
          )}
          <span>Current Location</span>
        </button>
      </div>

      {/* Quick selection chips: Popular Cities & Recents */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs font-medium text-stone-400">Quick Cities:</span>
        {POPULAR_CITIES.map((city) => {
          const isSelected = selectedCityId === city.id;
          return (
            <button
              key={city.id}
              id={`quick-city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => handleSelect(city)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {city.name}
            </button>
          );
        })}

        {recentSearches.length > 0 && (
          <>
            <span className="ml-2 text-xs font-medium text-stone-400">Recent:</span>
            {recentSearches
              .filter((c) => !POPULAR_CITIES.some((p) => p.name === c.name))
              .slice(0, 3)
              .map((city) => (
                <button
                  key={`recent-${city.id}`}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
                >
                  <Clock className="h-3 w-3 text-stone-400" />
                  {city.name}
                </button>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

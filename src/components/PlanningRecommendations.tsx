import { useState } from 'react';
import {
  Sparkles,
  Bike,
  Car,
  Shirt,
  Home,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { PlanningCategory, PlanningRecommendation, RecommendationStatus } from '../types';

interface PlanningRecommendationsProps {
  recommendations: PlanningRecommendation[];
}

const CATEGORY_ICONS: Record<PlanningCategory, LucideIcon> = {
  recreation: Bike,
  commute: Car,
  wardrobe: Shirt,
  lifestyle: Home,
};

const CATEGORY_LABELS: Record<PlanningCategory, string> = {
  recreation: 'Recreation',
  commute: 'Commute',
  wardrobe: 'Wardrobe',
  lifestyle: 'Home & Living',
};

const STATUS_CONFIG: Record<
  RecommendationStatus,
  { label: string; badgeClass: string; icon: LucideIcon }
> = {
  ideal: {
    label: 'Optimal',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  good: {
    label: 'Good',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Info,
  },
  caution: {
    label: 'Caution',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertTriangle,
  },
  alert: {
    label: 'Alert',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: AlertCircle,
  },
};

export function PlanningRecommendations({
  recommendations,
}: PlanningRecommendationsProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | PlanningCategory>('all');

  const filtered =
    selectedFilter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.category === selectedFilter);

  return (
    <div
      id="planning-recommendations-section"
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Planning Recommendations
            </h3>
            <p className="text-xs text-stone-500">
              Contextual guidance for activities, travel, and attire based on live forecast
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Guidance
          </button>
          {(['recreation', 'commute', 'wardrobe', 'lifestyle'] as PlanningCategory[]).map(
            (cat) => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedFilter === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{CATEGORY_LABELS[cat]}</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {filtered.map((rec) => {
          const CatIcon = CATEGORY_ICONS[rec.category];
          const status = STATUS_CONFIG[rec.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={rec.id}
              className="flex flex-col justify-between rounded-xl border border-stone-200/90 bg-stone-50/40 p-4 transition-all hover:border-stone-300 hover:bg-white"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-200/70 text-stone-700">
                      <CatIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-stone-900">
                      {rec.title}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${status.badgeClass}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                <div className="text-xs font-medium text-stone-800">
                  {rec.summary}
                </div>

                <p className="text-xs leading-relaxed text-stone-500">
                  {rec.detail}
                </p>
              </div>

              {rec.highlights && rec.highlights.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-stone-200/60 pt-3">
                  {rec.highlights.map((highlight, hIdx) => (
                    <span
                      key={hIdx}
                      className="inline-flex items-center rounded-md bg-stone-200/60 px-2 py-0.5 text-[11px] font-medium text-stone-700"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

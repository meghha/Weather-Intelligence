import { CurrentWeatherData, DailyForecastItem, HourlyForecastItem, PlanningRecommendation } from '../types';

export function generatePlanningRecommendations(
  current: CurrentWeatherData,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  timezone: string
): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = [];

  // Today's daily metrics
  const todayDaily = daily[0];
  const next24Hours = hourly.slice(0, 24);

  // Max rain probability in next 12 hours
  const next12Hours = hourly.slice(0, 12);
  const maxPrecipNext12h = next12Hours.length > 0
    ? Math.max(...next12Hours.map((h) => h.precipitationProbability))
    : (todayDaily?.precipitationProbabilityMax ?? 0);

  const highestWindNext12h = next12Hours.length > 0
    ? Math.max(...next12Hours.map((h) => h.windSpeed))
    : current.windSpeed;

  const currentTemp = current.temperature;
  const feelsLike = current.apparentTemperature;
  const maxUVToday = todayDaily?.uvIndexMax ?? 0;
  const precipSumToday = todayDaily?.precipitationSum ?? current.precipitation;

  // 1. OUTDOOR RECREATION & FITNESS (Running, Cycling, Hiking)
  let recStatus: 'ideal' | 'good' | 'caution' | 'alert' = 'ideal';
  let recSummary = '';
  let recDetail = '';
  const recHighlights: string[] = [];

  // Find best recreation window in next 12 hours
  const suitableHours = next12Hours.filter(
    (h) => h.precipitationProbability < 30 && h.windSpeed < 28 && h.temperature >= 10 && h.temperature <= 27
  );

  if (current.weatherCode >= 95 || (current.weatherCode >= 65 && current.weatherCode <= 67)) {
    recStatus = 'alert';
    recSummary = 'Unfavorable for outdoor activities due to severe weather';
    recDetail = 'Thunderstorms or heavy precipitation create safety hazards for running, cycling, or open-field sports.';
    recHighlights.push('Move exercise indoors');
    recHighlights.push('Lightning & slick surface hazard');
  } else if (maxPrecipNext12h > 60 || current.precipitation > 1.5) {
    recStatus = 'caution';
    recSummary = 'Rain showers expected; consider water-resistant gear or indoor training';
    recDetail = `Precipitation probability reaches ${maxPrecipNext12h}% today. Pavements and trails will be slick.`;
    if (suitableHours.length > 0) {
      recHighlights.push(`Drier window around ${suitableHours[0].formattedTime}`);
    }
    recHighlights.push('Wear high-traction trail shoes');
  } else if (currentTemp > 31 || feelsLike > 34) {
    recStatus = 'caution';
    recSummary = 'High thermal stress: exercise in early morning or evening';
    recDetail = `Feels like ${Math.round(feelsLike)}°C. High heat limits sustained cardiovascular exertion. Hydrate aggressively.`;
    recHighlights.push('Peak heat risk from 12 PM - 4 PM');
    recHighlights.push('Carry electrolytes & SPF 50');
  } else if (currentTemp < 2) {
    recStatus = 'caution';
    recSummary = 'Cold conditions; warm-up thoroughly and protect extremities';
    recDetail = `Cold air (${Math.round(currentTemp)}°C) can cause stiff muscles and bronchial discomfort. Watch for patch ice.`;
    recHighlights.push('Thermal base layer & gloves recommended');
    recHighlights.push('Inspect pathways for frost');
  } else if (highestWindNext12h > 35) {
    recStatus = 'good';
    recSummary = 'Moderate to strong breezes will create notable cycling resistance';
    recDetail = `Wind gusts up to ${Math.round(current.windGusts)} km/h. Good for walking/running, challenging for road cycling.`;
    recHighlights.push('Headwinds on open coastal/elevated routes');
  } else {
    recStatus = 'ideal';
    recSummary = 'Prime outdoor conditions for workouts, runs, and leisure';
    recDetail = `Mild temperature (${Math.round(currentTemp)}°C), minimal rain probability (${maxPrecipNext12h}%), and light breeze make today superb for outdoors.`;
    if (suitableHours.length > 0) {
      recHighlights.push(`Optimal window: ${suitableHours[0].formattedTime} - ${suitableHours[Math.min(suitableHours.length - 1, 4)].formattedTime}`);
    }
    recHighlights.push('Low thermal discomfort');
  }

  recommendations.push({
    id: 'rec-fitness',
    category: 'recreation',
    title: 'Outdoor Recreation & Fitness',
    status: recStatus,
    summary: recSummary,
    detail: recDetail,
    highlights: recHighlights,
  });

  // 2. COMMUTE & TRAVEL
  let commuteStatus: 'ideal' | 'good' | 'caution' | 'alert' = 'ideal';
  let commuteSummary = '';
  let commuteDetail = '';
  const commuteHighlights: string[] = [];

  if (current.weatherCode >= 95 || current.weatherCode === 65 || current.weatherCode === 67 || current.weatherCode === 75) {
    commuteStatus = 'alert';
    commuteSummary = 'Hazardous transit conditions: allow extra travel time';
    commuteDetail = 'Severe precipitation or reduced visibility will impact road traction and flight schedules.';
    commuteHighlights.push('Double following distance on highways');
    commuteHighlights.push('Keep headlights on dipped beam');
  } else if (current.weatherCode === 45 || current.weatherCode === 48) {
    commuteStatus = 'caution';
    commuteSummary = 'Dense fog alert: reduced road and pedestrian visibility';
    commuteDetail = 'Fog dampens braking response and obscures intersections. Use fog lights and reduce speed.';
    commuteHighlights.push('Low visibility commute');
    commuteHighlights.push('Avoid high beam glare');
  } else if (maxPrecipNext12h >= 45 || current.precipitation > 0) {
    commuteStatus = 'caution';
    commuteSummary = 'Wet roads and periodic spray; umbrella required';
    commuteDetail = `There is a ${maxPrecipNext12h}% chance of rain. Morning or evening rush hours may encounter pooling water.`;
    commuteHighlights.push('Carry a compact umbrella');
    commuteHighlights.push('Slick pedestrian crossings and subway stairs');
  } else if (highestWindNext12h > 45) {
    commuteStatus = 'caution';
    commuteSummary = 'Strong crosswinds across bridges and exposed highway corridors';
    commuteDetail = `Wind gusts to ${Math.round(current.windGusts)} km/h may buffet high-sided vehicles, cyclists, and two-wheelers.`;
    commuteHighlights.push('Hold steering wheel firmly on bridges');
  } else {
    commuteStatus = 'ideal';
    commuteSummary = 'Clear transit conditions and optimal visibility';
    commuteDetail = 'No significant precipitation, fog, or hazardous wind gusts detected for your commute routes.';
    commuteHighlights.push('Dry pavement conditions');
    commuteHighlights.push('Normal travel schedules expected');
  }

  recommendations.push({
    id: 'rec-commute',
    category: 'commute',
    title: 'Commute & Travel',
    status: commuteStatus,
    summary: commuteSummary,
    detail: commuteDetail,
    highlights: commuteHighlights,
  });

  // 3. WARDROBE & GEAR ADVICE
  let attireStatus: 'ideal' | 'good' | 'caution' | 'alert' = 'ideal';
  let attireSummary = '';
  let attireDetail = '';
  const attireHighlights: string[] = [];

  // Determine layers based on apparent temperature
  if (feelsLike < 0) {
    attireStatus = 'caution';
    attireSummary = 'Heavy winter outerwear, thermal base layer & insulated gloves';
    attireDetail = `Apparent temperature is ${Math.round(feelsLike)}°C. Full cold-weather ensemble essential to prevent hypothermia.`;
    attireHighlights.push('Heavy down/wool coat');
    attireHighlights.push('Beanie & thermal socks');
  } else if (feelsLike < 10) {
    attireStatus = 'good';
    attireSummary = 'Warm jacket or structured wool coat with a mid-layer';
    attireDetail = `Chilly conditions (${Math.round(feelsLike)}°C feels-like). Pair a sweater with a wind-blocking shell.`;
    attireHighlights.push('Medium jacket + sweater');
    attireHighlights.push('Light scarf recommended in breeze');
  } else if (feelsLike < 18) {
    attireStatus = 'ideal';
    attireSummary = 'Comfortable light layers: long sleeves, cardigan, or light jacket';
    attireDetail = `Mild temperature (${Math.round(feelsLike)}°C). A light jacket you can remove during sunny afternoons is ideal.`;
    attireHighlights.push('Flexible 2-layer outfit');
  } else if (feelsLike < 26) {
    attireStatus = 'ideal';
    attireSummary = 'Breathable single layer: t-shirt, light chinos, or dress';
    attireDetail = `Comfortable warm conditions (${Math.round(feelsLike)}°C). Natural breathable fabrics (cotton, linen) feel best.`;
    attireHighlights.push('Breathable summer fabrics');
  } else {
    attireStatus = 'caution';
    attireSummary = 'Ultra-light, loose-fitting attire & heat management gear';
    attireDetail = `Warm to hot (${Math.round(feelsLike)}°C). Light-colored clothing helps reflect thermal radiation.`;
    attireHighlights.push('Lightweight moisture-wicking');
  }

  // Accessories checks: umbrella, sunglasses, UV
  if (maxPrecipNext12h >= 40) {
    attireHighlights.push('Keep an umbrella or water-resistant shell handy');
  }
  if (maxUVToday >= 6) {
    attireHighlights.push(`SPF 30+ sunscreen & sunglasses (UV peak: ${maxUVToday.toFixed(1)})`);
  } else if (maxUVToday >= 3) {
    attireHighlights.push('Sunglasses recommended for midday sun');
  }

  recommendations.push({
    id: 'rec-wardrobe',
    category: 'wardrobe',
    title: 'Wardrobe & Attire',
    status: attireStatus,
    summary: attireSummary,
    detail: attireDetail,
    highlights: attireHighlights,
  });

  // 4. HOME, GARDEN & DAILY LIFE
  let lifeStatus: 'ideal' | 'good' | 'caution' | 'alert' = 'ideal';
  let lifeSummary = '';
  let lifeDetail = '';
  const lifeHighlights: string[] = [];

  // Laundry drying outside test: precip <= 0.2mm, humidity < 70%, no rain next 8 hrs
  const next8hPrecip = hourly.slice(0, 8).reduce((acc, h) => acc + h.precipitation, 0);
  const canHangLaundry = next8hPrecip < 0.2 && maxPrecipNext12h < 25 && current.humidity < 75;

  if (canHangLaundry) {
    lifeHighlights.push('Great day for hanging laundry outdoors');
  } else {
    lifeHighlights.push('Indoor drying recommended (rain/humidity risk)');
  }

  // Garden watering test
  if (precipSumToday > 4 || (daily[1]?.precipitationSum ?? 0) > 4) {
    lifeHighlights.push('Skip garden watering: natural rain provides ample soil moisture');
  } else if (currentTemp > 24) {
    lifeHighlights.push('Water outdoor plants early morning or post-sunset to minimize evaporation');
  } else {
    lifeHighlights.push('Normal moderate plant watering schedule');
  }

  // Ventilation test
  if (current.weatherCode <= 2 && currentTemp >= 15 && currentTemp <= 25 && current.humidity < 70) {
    lifeStatus = 'ideal';
    lifeSummary = 'Excellent conditions for fresh-air home ventilation';
    lifeDetail = 'Pleasant ambient air and low humidity make this an ideal time to air out rooms and refresh indoor spaces.';
    lifeHighlights.push('Open windows for cross-breeze');
  } else if (current.weatherCode >= 51 || current.precipitation > 0) {
    lifeStatus = 'caution';
    lifeSummary = 'Keep windows secured against rain spray and moisture';
    lifeDetail = 'Incoming rain droplets and heightened outdoor moisture can damp sills and indoor carpets.';
    lifeHighlights.push('Close awning and skylight windows');
  } else {
    lifeStatus = 'good';
    lifeSummary = 'Standard indoor climate conditions';
    lifeDetail = 'Moderate temperature balance with stable indoor ambient comfort.';
  }

  recommendations.push({
    id: 'rec-lifestyle',
    category: 'lifestyle',
    title: 'Home & Living',
    status: lifeStatus,
    summary: lifeSummary,
    detail: lifeDetail,
    highlights: lifeHighlights,
  });

  return recommendations;
}

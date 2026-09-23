"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, CloudSun, Cloud, CloudFog, CloudRain,
  CloudDrizzle, CloudSnow, CloudLightning,
  Wind, Droplets, Thermometer, Eye, RefreshCw,
  ArrowUp, ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  latitude: number | null;
  longitude: number | null;
  destinationName: string;
}

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    visibility: number;
    uv_index: number;
    time: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

const weatherStyles = {
  clear: {
    icon: Sun,
    iconColor: "text-amber-400",
    glow: "rgba(251,191,36,0.35)",
    bgOrb: "bg-amber-500/15",
    gradient: "from-amber-950/60 via-orange-950/30 to-charcoal-950",
    label: "Clear & Sunny",
    accentColor: "#F59E0B",
  },
  clouds: {
    icon: CloudSun,
    iconColor: "text-slate-200",
    glow: "rgba(203,213,225,0.25)",
    bgOrb: "bg-slate-400/15",
    gradient: "from-slate-900/60 via-slate-950/30 to-charcoal-950",
    label: "Partly Cloudy",
    accentColor: "#94A3B8",
  },
  overcast: {
    icon: Cloud,
    iconColor: "text-slate-400",
    glow: "rgba(148,163,184,0.2)",
    bgOrb: "bg-slate-600/15",
    gradient: "from-slate-900/60 via-charcoal-950/50 to-charcoal-950",
    label: "Overcast",
    accentColor: "#64748B",
  },
  drizzle: {
    icon: CloudDrizzle,
    iconColor: "text-sky-300",
    glow: "rgba(125,211,252,0.3)",
    bgOrb: "bg-sky-500/15",
    gradient: "from-sky-950/60 via-blue-950/30 to-charcoal-950",
    label: "Light Drizzle",
    accentColor: "#7DD3FC",
  },
  rain: {
    icon: CloudRain,
    iconColor: "text-sky-400",
    glow: "rgba(56,189,248,0.35)",
    bgOrb: "bg-sky-600/15",
    gradient: "from-sky-950/70 via-blue-950/40 to-charcoal-950",
    label: "Rain Showers",
    accentColor: "#38BDF8",
  },
  snow: {
    icon: CloudSnow,
    iconColor: "text-white",
    glow: "rgba(255,255,255,0.35)",
    bgOrb: "bg-white/10",
    gradient: "from-slate-800/60 via-slate-900/40 to-charcoal-950",
    label: "Snowfall",
    accentColor: "#E2E8F0",
  },
  storm: {
    icon: CloudLightning,
    iconColor: "text-violet-400",
    glow: "rgba(167,139,250,0.4)",
    bgOrb: "bg-violet-600/15",
    gradient: "from-violet-950/70 via-indigo-950/40 to-charcoal-950",
    label: "Thunderstorm",
    accentColor: "#A78BFA",
  },
  fog: {
    icon: CloudFog,
    iconColor: "text-slate-300",
    glow: "rgba(203,213,225,0.2)",
    bgOrb: "bg-slate-500/10",
    gradient: "from-slate-900/60 via-slate-950/40 to-charcoal-950",
    label: "Foggy",
    accentColor: "#CBD5E1",
  },
};

function getStyleForCode(code: number) {
  if (code === 0) return weatherStyles.clear;
  if (code <= 2) return weatherStyles.clouds;
  if (code === 3) return weatherStyles.overcast;
  if (code >= 45 && code <= 48) return weatherStyles.fog;
  if (code >= 51 && code <= 57) return weatherStyles.drizzle;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return weatherStyles.rain;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return weatherStyles.snow;
  if (code >= 95) return weatherStyles.storm;
  return weatherStyles.clear;
}

function getUVLabel(uv: number) {
  if (uv <= 2) return { label: "Low", color: "text-emerald-400" };
  if (uv <= 5) return { label: "Moderate", color: "text-amber-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  if (uv <= 10) return { label: "Very High", color: "text-red-400" };
  return { label: "Extreme", color: "text-violet-400" };
}

export function WeatherWidget({ latitude, longitude, destinationName }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = useCallback(async (silent = false) => {
    if (!latitude || !longitude) { setIsLoading(false); return; }
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m&timezone=auto&forecast_days=7`
      );
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchWeather();
    // Auto-refresh every 10 minutes
    const interval = setInterval(() => fetchWeather(true), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (!latitude || !longitude) return null;

  const style = data ? getStyleForCode(data.current.weather_code) : weatherStyles.clear;

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl shadow-2xl">
      {/* Dynamic background gradient based on weather */}
      <AnimatePresence mode="wait">
        <motion.div
          key={style.label}
          className={cn("absolute inset-0 bg-gradient-to-b", style.gradient)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* Ambient orb */}
      <motion.div
        className={cn("absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[80px]", style.bgOrb)}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Border overlay */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />

      <div className="relative z-10 p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">
              Live Weather · {destinationName}
            </p>
            {lastUpdated && (
              <p className="mt-0.5 font-mono text-[9px] text-white/20">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchWeather(true)}
            disabled={isRefreshing}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
            aria-label="Refresh weather"
          >
            <RefreshCw className={cn("h-3 w-3 text-white/40", isRefreshing && "animate-spin")} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-16 w-28 rounded-xl bg-white/5" />
                  <div className="h-4 w-20 rounded bg-white/5" />
                </div>
                <div className="h-16 w-16 rounded-full bg-white/5" />
              </div>
              <div className="h-16 w-full rounded-2xl bg-white/5" />
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-full rounded-lg bg-white/5" />)}
              </div>
            </motion.div>
          ) : data ? (
            <WeatherContent data={data} style={style} onRefresh={() => fetchWeather(true)} />
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
              <p className="text-sm text-white/30">Weather data unavailable</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WeatherContent({ data, style }: { data: WeatherData; style: typeof weatherStyles.clear; onRefresh: () => void }) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const current = data.current;
  const WeatherIcon = style.icon;
  const uvInfo = getUVLabel(Math.round(current.uv_index ?? 0));

  // Get next 6 hours for mini chart based on destination's local time
  const currentTimeRaw = data.current?.time || data.hourly.time[0]; // "YYYY-MM-DDTHH:00"
  const currentHourPrefix = currentTimeRaw ? currentTimeRaw.substring(0, 13) : ""; 
  let startIndex = data.hourly.time.findIndex(t => t.startsWith(currentHourPrefix));
  if (startIndex === -1) startIndex = 0;

  const hourlySlice = data.hourly.time.slice(startIndex, startIndex + 7);
  const tempSlice = data.hourly.temperature_2m.slice(startIndex, startIndex + 7);
  const minTemp = Math.min(...tempSlice);
  const maxTemp = Math.max(...tempSlice);
  const tempRange = maxTemp - minTemp || 1;

  return (
    <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Main temperature + icon */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-7xl font-light tracking-tighter text-white leading-none">
              {Math.round(current.temperature_2m)}
            </span>
            <span className="mb-2 text-2xl font-light text-white/50">°C</span>
          </div>
          <p className="mt-1 text-base font-medium text-white/70">{style.label}</p>
          <p className="mt-0.5 text-sm text-white/40">
            Feels like {Math.round(current.apparent_temperature)}°C
          </p>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 20px ${style.glow})` }}
        >
          <WeatherIcon className={cn("h-20 w-20", style.iconColor)} strokeWidth={1} />
        </motion.div>
      </div>

      {/* Stats grid */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          { icon: Wind, label: "Wind", value: `${Math.round(current.wind_speed_10m)}`, unit: "km/h", color: "text-white/50" },
          { icon: Droplets, label: "Humidity", value: `${current.relative_humidity_2m}`, unit: "%", color: "text-sky-400/70" },
          { icon: Eye, label: "Visibility", value: `${Math.round((current.visibility ?? 10000) / 1000)}`, unit: "km", color: "text-emerald-400/70" },
          { icon: Sun, label: "UV Index", value: `${Math.round(current.uv_index ?? 0)}`, unit: uvInfo.label, color: uvInfo.color },
        ].map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-2xl bg-white/[0.04] p-2.5 ring-1 ring-white/[0.06]">
            <Icon className={cn("h-3.5 w-3.5", color)} strokeWidth={1.5} />
            <span className="text-sm font-semibold text-white/90">{value}</span>
            <span className="text-center text-[9px] leading-tight text-white/30">{unit}</span>
          </div>
        ))}
      </div>

      {/* Hourly mini-chart */}
      {tempSlice.length > 2 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[9px] font-bold tracking-widest text-white/25 uppercase">Next 6 Hours</p>
          <div className="flex items-end justify-between gap-1 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.05]">
            {tempSlice.slice(0,7).map((temp, i) => {
              const height = Math.max(16, Math.round(((temp - minTemp) / tempRange) * 40) + 16);
              const hourStr = (hourlySlice[i] || "").substring(11, 13);
              const hour = parseInt(hourStr, 10) || 0;
              const label = hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`;
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[9px] font-medium text-white/60">{Math.round(temp)}°</span>
                  <div
                    className="w-full rounded-full transition-all"
                    style={{
                      height: `${height}px`,
                      background: `linear-gradient(to top, ${style.accentColor}80, ${style.accentColor}20)`,
                      minWidth: "6px",
                    }}
                  />
                  <span className="text-[8px] text-white/25">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-day forecast */}
      <div className="mt-5">
        <p className="mb-2 font-mono text-[9px] font-bold tracking-widest text-white/25 uppercase">7-Day Forecast</p>
        <div className="space-y-1">
          {data.daily.time.slice(0, 7).map((time, idx) => {
            const dayStyle = getStyleForCode(data.daily.weather_code[idx] ?? 0);
            const DayIcon = dayStyle.icon;
            const date = new Date(time);
            const isToday = idx === 0;
            const dayName = isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
            const rain = data.daily.precipitation_probability_max[idx] ?? 0;
            const isActive = activeDay === idx;

            return (
              <motion.div
                key={time}
                onClick={() => setActiveDay(isActive ? null : idx)}
                whileHover={{ x: 2 }}
                className={cn(
                  "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all",
                  isActive ? "bg-white/[0.07] ring-1 ring-white/10" : "hover:bg-white/[0.04]"
                )}
              >
                <span className={cn("w-14 text-sm font-medium", isToday ? "text-white" : "text-white/55")}>
                  {dayName}
                </span>

                <DayIcon
                  className={cn("h-4 w-4 flex-shrink-0", dayStyle.iconColor)}
                  strokeWidth={1.5}
                  style={{ filter: `drop-shadow(0 0 6px ${dayStyle.glow})` }}
                />

                {rain > 20 && (
                  <div className="flex items-center gap-0.5">
                    <Droplets className="h-2.5 w-2.5 text-sky-400/60" />
                    <span className="text-[10px] text-sky-400/60">{rain}%</span>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <ArrowUp className="h-2.5 w-2.5 text-rose-400/60" />
                    <span className="text-sm font-semibold text-white/80">{Math.round(data.daily.temperature_2m_max[idx] ?? 0)}°</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <ArrowDown className="h-2.5 w-2.5 text-sky-400/60" />
                    <span className="text-sm text-white/35">{Math.round(data.daily.temperature_2m_min[idx] ?? 0)}°</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Powered by badge */}
      <p className="mt-4 text-center font-mono text-[8px] tracking-widest text-white/15 uppercase">
        Powered by Open-Meteo · Real-Time Data
      </p>
    </motion.div>
  );
}

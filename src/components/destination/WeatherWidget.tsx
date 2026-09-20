"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertCircle
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
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

// Weather visual mappings for ultra-premium aesthetic
const weatherStyles = {
  clear: {
    gradient: "from-amber-500/20 via-orange-500/5 to-transparent",
    icon: Sun,
    iconColor: "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]",
    bgGlow: "bg-amber-500/20",
    label: "Clear & Sunny"
  },
  clouds: {
    gradient: "from-blue-400/10 via-slate-500/5 to-transparent",
    icon: CloudSun,
    iconColor: "text-slate-300 drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]",
    bgGlow: "bg-slate-400/20",
    label: "Partly Cloudy"
  },
  overcast: {
    gradient: "from-slate-600/20 via-slate-800/10 to-transparent",
    icon: Cloud,
    iconColor: "text-slate-400",
    bgGlow: "bg-slate-500/20",
    label: "Overcast"
  },
  rain: {
    gradient: "from-sky-600/20 via-blue-800/10 to-transparent",
    icon: CloudRain,
    iconColor: "text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]",
    bgGlow: "bg-sky-500/20",
    label: "Rain Showers"
  },
  snow: {
    gradient: "from-white/20 via-slate-200/5 to-transparent",
    icon: CloudSnow,
    iconColor: "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]",
    bgGlow: "bg-white/20",
    label: "Snowfall"
  },
  storm: {
    gradient: "from-purple-600/20 via-indigo-800/10 to-transparent",
    icon: CloudLightning,
    iconColor: "text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]",
    bgGlow: "bg-purple-500/20",
    label: "Thunderstorms"
  }
};

function getStyleForCode(code: number) {
  switch (true) {
    case code === 0: return weatherStyles.clear;
    case code === 1 || code === 2: return weatherStyles.clouds;
    case code === 3: return weatherStyles.overcast;
    case code >= 51 && code <= 67: return weatherStyles.rain;
    case code >= 80 && code <= 82: return weatherStyles.rain;
    case code >= 71 && code <= 77: return weatherStyles.snow;
    case code >= 85 && code <= 86: return weatherStyles.snow;
    case code >= 95: return weatherStyles.storm;
    default: return weatherStyles.clear;
  }
}

export function WeatherWidget({ latitude, longitude, destinationName }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!latitude || !longitude) {
      setIsLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-charcoal-950/80 p-px shadow-2xl backdrop-blur-2xl transition-all hover:shadow-amber-500/5 sm:w-[340px]">
      {/* Animated glowing border effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />

      <div className="relative z-10 h-full w-full rounded-[23px] bg-charcoal-950 p-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[320px] flex-col justify-between"
            >
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-24 rounded-full bg-white/5" />
                <div className="h-16 w-32 rounded-lg bg-white/5" />
              </div>
              <div className="space-y-3 pt-4 border-t border-white/5 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="h-6 w-full rounded bg-white/5" />
                ))}
              </div>
            </motion.div>
          ) : data ? (
            <WeatherContent data={data} destinationName={destinationName} />
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-white/20" />
              <p className="text-sm text-white/40">Real-time weather unavailable</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WeatherContent({ data, destinationName }: { data: WeatherData, destinationName: string }) {
  const current = data.current;
  const style = getStyleForCode(current.weather_code);
  const CurrentIcon = style.icon;

  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Background Dynamic Gradient Glow */}
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[60px] transition-all duration-1000", style.bgGlow)} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-widest text-white/40 uppercase">
            Live Conditions
          </p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-6xl font-medium tracking-tighter text-white">
              {Math.round(current.temperature_2m)}°
            </span>
          </div>
          <p className="mt-1 font-medium text-white/80">{style.label}</p>
        </div>
        
        {/* Main Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", stiffness: 100, damping: 10,
            repeat: Infinity, repeatType: "reverse", duration: 4 
          }}
          className="relative z-10"
        >
          <CurrentIcon className={cn("h-16 w-16", style.iconColor)} strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Mini Stats Row */}
      <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5 backdrop-blur-md">
        <div className="flex flex-col items-center gap-1 flex-1 border-r border-white/5">
          <Wind className="h-3.5 w-3.5 text-white/40" />
          <span className="text-xs font-medium text-white/80">{current.wind_speed_10m} <span className="text-[10px] text-white/40">km/h</span></span>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 border-r border-white/5">
          <Droplets className="h-3.5 w-3.5 text-sky-400/60" />
          <span className="text-xs font-medium text-white/80">{current.relative_humidity_2m}%</span>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1">
          <Thermometer className="h-3.5 w-3.5 text-rose-400/60" />
          <span className="text-xs font-medium text-white/80">{Math.round(current.apparent_temperature)}°</span>
        </div>
      </div>

      {/* Forecast */}
      <div className="mt-6 space-y-3">
        {data.daily.time.slice(1, 4).map((time, idx) => {
          const dayIdx = idx + 1;
          const dayStyle = getStyleForCode(data.daily.weather_code[dayIdx] ?? 0);
          const DayIcon = dayStyle.icon;
          const date = new Date(time);
          const isTomorrow = idx === 0;
          const dayName = isTomorrow ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "long" });

          return (
            <div key={time} className="group flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]">
              <span className="w-24 text-sm font-medium text-white/60 transition-colors group-hover:text-white/90">
                {dayName}
              </span>
              <div className="flex flex-1 items-center justify-center">
                <DayIcon className={cn("h-4 w-4", dayStyle.iconColor)} />
              </div>
              <div className="flex w-16 items-center justify-end gap-2 text-sm font-medium">
                <span className="text-white/90">{Math.round(data.daily.temperature_2m_max[dayIdx] ?? 0)}°</span>
                <span className="text-white/30">{Math.round(data.daily.temperature_2m_min[dayIdx] ?? 0)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

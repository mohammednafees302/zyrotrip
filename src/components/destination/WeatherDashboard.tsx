"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, CloudSun, Cloud, CloudFog, CloudRain,
  CloudSnow, CloudLightning, Wind, Droplets, Eye,
  RefreshCw, MapPin, CloudDrizzle, ThermometerSun,
  Clock, Calendar
} from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface WeatherDashboardProps {
  slug: string;
  destinationName: string;
}

interface WeatherData {
  _cachedAt?: string;
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
    precipitation_probability: number[];
  };
}

const weatherStyles = {
  clear: { icon: Sun, color: "text-amber-400", bg: "bg-amber-500/10", label: "Clear & Sunny" },
  clouds: { icon: CloudSun, color: "text-slate-300", bg: "bg-slate-400/10", label: "Partly Cloudy" },
  overcast: { icon: Cloud, color: "text-slate-400", bg: "bg-slate-600/10", label: "Overcast" },
  drizzle: { icon: CloudDrizzle, color: "text-sky-300", bg: "bg-sky-500/10", label: "Light Drizzle" },
  rain: { icon: CloudRain, color: "text-sky-400", bg: "bg-sky-600/10", label: "Rain Showers" },
  snow: { icon: CloudSnow, color: "text-white", bg: "bg-white/10", label: "Snowfall" },
  storm: { icon: CloudLightning, color: "text-violet-400", bg: "bg-violet-600/10", label: "Thunderstorm" },
  fog: { icon: CloudFog, color: "text-slate-300", bg: "bg-slate-500/10", label: "Foggy" },
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

function getInsight(data: WeatherData): string {
  const code = data.current.weather_code;
  const temp = data.current.temperature_2m;
  const wind = data.current.wind_speed_10m;
  
  if (code === 0 && temp > 25) return "Perfect weather for outdoor activities and beach visits.";
  if (code >= 61 && code <= 67) return "Rain is expected. Indoor attractions are highly recommended today.";
  if (temp < 10) return "Chilly conditions. Dress warmly for exploring.";
  if (wind > 20) return "Breezy conditions. Great for sailing, but secure loose items.";
  return "Pleasant conditions for general sightseeing and exploration.";
}

export function WeatherDashboard({ slug, destinationName }: WeatherDashboardProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/destinations/${slug}/weather`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [slug]);

  if (error) {
    return (
      <div className="w-full rounded-3xl bg-white/5 border border-white/10 p-10 flex flex-col items-center justify-center text-center">
        <CloudRain className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
        <h3 className="text-white font-semibold">Live weather temporarily unavailable</h3>
        <p className="text-gray-400 text-sm mt-2 mb-6">We could not connect to the weather service.</p>
        <button onClick={fetchWeather} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="w-full rounded-3xl bg-white/5 border border-white/10 p-8 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-full mb-8" />
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-white/10" />
          <div className="space-y-3">
            <div className="h-12 w-24 bg-white/10 rounded-lg" />
            <div className="h-4 w-40 bg-white/10 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const current = data.current;
  const style = getStyleForCode(current.weather_code);
  const Icon = style.icon;

  // Next 24 hours
  // Open-Meteo returns time in the destination's local timezone like "YYYY-MM-DDTHH:00"
  const currentTimeRaw = data.current?.time || data.hourly.time[0]; // fallback
  const currentHourPrefix = currentTimeRaw ? currentTimeRaw.substring(0, 13) : ""; 
  
  let startIndex = data.hourly.time.findIndex(t => t.startsWith(currentHourPrefix));
  if (startIndex === -1) startIndex = 0;

  const hourlyData = data.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time, i) => {
      // time is "YYYY-MM-DDTHH:00"
      const hourStr = time.substring(11, 13);
      const hourNum = parseInt(hourStr, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum % 12 || 12;
      const formattedTime = `${displayHour} ${ampm}`;

      return {
        time: i === 0 ? 'Now' : formattedTime,
        temp: data.hourly.temperature_2m[startIndex + i] ?? 0,
        pop: data.hourly.precipitation_probability[startIndex + i] || 0
      };
    });

  return (
    <div className="w-full rounded-3xl bg-gray-950/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* 1. LIVE WEATHER HERO */}
      <div className="relative px-8 py-10 bg-gradient-to-br from-gray-900 to-gray-950 border-b border-white/10 overflow-hidden">
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] ${style.bg} opacity-50`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              <MapPin className="w-3.5 h-3.5" /> {destinationName}
            </div>
            
            <div className="flex items-center gap-6">
              <Icon className={`w-20 h-20 md:w-24 md:h-24 ${style.color}`} strokeWidth={1} />
              <div>
                <div className="flex items-start text-white leading-none tracking-tighter font-light">
                  <span className="text-7xl md:text-8xl">{Math.round(current.temperature_2m)}</span>
                  <span className="text-3xl md:text-4xl mt-2 text-white/50">°</span>
                </div>
                <p className="text-xl md:text-2xl text-white mt-2 font-medium">{style.label}</p>
              </div>
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-gray-400 text-lg">
              Feels like <span className="text-white font-medium">{Math.round(current.apparent_temperature)}°</span>
            </p>
            <p className="text-white/40 text-xs mt-2 font-mono flex items-center md:justify-end gap-1.5">
              <RefreshCw className="w-3 h-3" /> Updated {data._cachedAt ? new Date(data._cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </p>
            <p className="text-white/30 text-[10px] mt-1 font-mono uppercase tracking-widest">
              Weather data: Open-Meteo
            </p>
          </div>
        </div>
      </div>

      {/* 2. HOURLY TIMELINE (CHART) */}
      <div className="p-8 border-b border-white/10 bg-white/[0.02]">
        <h3 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" /> Hourly Forecast & Trend
        </h3>
        
        <div className="w-full h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                minTickGap={20}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900/90 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
                        <p className="text-gray-400 text-xs mb-1">{payload[0]?.payload?.time}</p>
                        <p className="text-white font-bold text-lg">{payload[0]?.value}°</p>
                        {(payload[0]?.payload?.pop ?? 0) > 10 && (
                           <p className="text-sky-400 text-xs mt-1 flex items-center gap-1"><Droplets className="w-3 h-3"/> {payload[0]?.payload?.pop}% Rain</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#f87171" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
        {/* 3. 7-DAY FORECAST */}
        <div className="p-8 lg:col-span-1">
          <h3 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" /> 7-Day Forecast
          </h3>
          <div className="space-y-4">
            {data.daily.time.slice(0, 7).map((time, i) => {
              const dayStyle = getStyleForCode(data.daily.weather_code[i] ?? 0);
              const DayIcon = dayStyle.icon;
              return (
                <div key={time} className="flex items-center justify-between py-1">
                  <span className="w-16 text-gray-400 text-sm font-medium">
                    {i === 0 ? "Today" : new Date(time).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <DayIcon className={`w-4 h-4 ${dayStyle.color}`} />
                    {(data.daily.precipitation_probability_max[i] ?? 0) > 20 && (
                      <span className="text-[10px] text-sky-400 font-semibold">{data.daily.precipitation_probability_max[i]}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-white font-medium">{Math.round(data.daily.temperature_2m_max[i] ?? 0)}°</span>
                    <span className="text-white/30">{Math.round(data.daily.temperature_2m_min[i] ?? 0)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. DETAILS & INSIGHT */}
        <div className="p-8 lg:col-span-2 flex flex-col">
          <h3 className="text-white/80 font-semibold mb-6 flex items-center gap-2">
            <ThermometerSun className="w-4 h-4 text-orange-400" /> Weather Details
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <DetailCard icon={Droplets} label="Humidity" value={`${current.relative_humidity_2m}%`} />
            <DetailCard icon={Wind} label="Wind" value={`${current.wind_speed_10m} km/h`} />
            <DetailCard icon={Eye} label="Visibility" value={`${(current.visibility / 1000).toFixed(1)} km`} />
            <DetailCard icon={Sun} label="UV Index" value={Math.round(current.uv_index).toString()} />
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Travel Insight</p>
            <p className="text-white text-sm leading-relaxed">{getInsight(data)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-start gap-2 border border-white/5">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="text-white font-semibold text-lg">{value}</p>
      </div>
    </div>
  );
}

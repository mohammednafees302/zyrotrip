import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiResponse, apiError } from "@/lib/utils";

// Cache for 30 minutes
const CACHE_DURATION_MS = 30 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slug } = await params;
    if (!slug) {
      return apiError("Destination slug is required", "BAD_REQUEST", 400);
    }

    // Find destination
    const destination = await db.destination.findUnique({
      where: { slug },
      select: { id: true, latitude: true, longitude: true },
    });

    if (!destination) {
      return apiError("Destination not found", "NOT_FOUND", 404);
    }

    if (!destination.latitude || !destination.longitude) {
      return apiError("Destination missing coordinates", "BAD_REQUEST", 400);
    }

    const { id, latitude, longitude } = destination;

    // Check Cache
    const existingCache = await db.weatherCache.findUnique({
      where: { destinationId: id },
    });

    const now = new Date();

    if (existingCache && existingCache.expiresAt > now) {
      try {
        const data = JSON.parse(existingCache.data);
        data._cachedAt = existingCache.cachedAt.toISOString();
        return apiResponse(data);
      } catch (e) {
        // Parse error, proceed to fetch new data
      }
    }

    // Fetch new weather from Open-Meteo
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,precipitation_probability&timezone=auto&forecast_days=7`;

    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      return apiError("Weather service temporarily unavailable", "SERVICE_UNAVAILABLE", 503);
    }

    const data = await res.json();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_MS);

    // Save to Cache (wrap in try-catch for read-only Vercel environments)
    try {
      await db.weatherCache.upsert({
        where: { destinationId: id },
        update: {
          data: JSON.stringify(data),
          cachedAt: now,
          expiresAt,
        },
        create: {
          destinationId: id,
          data: JSON.stringify(data),
          cachedAt: now,
          expiresAt,
        },
      });
    } catch (cacheError) {
      console.warn("Could not write to weather cache (read-only filesystem):", cacheError);
    }

    data._cachedAt = now.toISOString();

    return apiResponse(data);
  } catch (error: any) {
    console.error("Weather API Error:", error);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}

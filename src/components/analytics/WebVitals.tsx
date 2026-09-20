"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      });
    }
  });

  return null;
}

import { z } from "zod";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 second timeout for AI generation

// ─── Request Schema ──────────────────────────────────────────────────────────
const generateSchema = z.object({
  destination: z.string().min(2).max(200),
  startDate: z.string().optional(),
  duration: z.number().min(1).max(30),
  travelers: z.number().min(1).max(20),
  budget: z.enum(["budget", "mid-range", "luxury", "ultra-luxury"]),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  foodPreferences: z.string().optional(),
  accommodation: z.string().optional(),
});

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(data: z.infer<typeof generateSchema>): string {
  const interestsList =
    data.interests && data.interests.length > 0
      ? data.interests.join(", ")
      : "general sightseeing, local culture";

  return `You are ZyroTrip's expert AI travel architect. Create a detailed, personalized travel itinerary.

Trip Details:
- Destination: ${data.destination}
- Duration: ${data.duration} days
- Travelers: ${data.travelers} people
- Budget style: ${data.budget}
- Interests: ${interestsList}
${data.travelStyle ? `- Travel style: ${data.travelStyle}` : ""}
${data.foodPreferences ? `- Food preferences: ${data.foodPreferences}` : ""}
${data.accommodation ? `- Preferred accommodation: ${data.accommodation}` : ""}
${data.startDate ? `- Start date: ${data.startDate}` : ""}

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no explanation, just the JSON object.

The JSON must exactly match this structure:
{
  "title": "Trip title",
  "destination": "destination name",
  "summary": "2-3 sentence engaging overview of the trip",
  "totalDays": ${data.duration},
  "bestTimeToVisit": "Month range e.g. April-May",
  "estimatedBudget": {
    "flights": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "total": number
  },
  "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "days": [
    {
      "dayNumber": 1,
      "title": "Day title e.g. Arrival in Tokyo",
      "theme": "One line theme e.g. Urban exploration & street food",
      "accommodation": "Hotel name or area",
      "meals": ["Breakfast at X", "Lunch at Y", "Dinner at Z"],
      "transportationTip": "How to get around today",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "description": "2-3 sentence description",
          "type": "SIGHTSEEING|DINING|TRANSPORT|ACCOMMODATION|RELAXATION|OTHER",
          "location": "Specific location name",
          "estimatedCost": 25,
          "duration": "2 hours"
        }
      ]
    }
  ]
}

Budget guidelines for per-person estimates:
- budget: flights $400-600, accommodation $40-70/night, food $25-40/day
- mid-range: flights $600-1000, accommodation $100-180/night, food $50-80/day
- luxury: flights $1200-2500, accommodation $250-500/night, food $100-200/day
- ultra-luxury: flights $3000+, accommodation $600+/night, food $200+/day

Include 3-6 activities per day. Be specific with real place names, real restaurant names, real attraction names. Make it feel like local expert advice.`;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return apiError(firstError?.message ?? "Invalid input", "VALIDATION_ERROR", 400);
    }

    const data = parsed.data;

    // Get API key from server environment (never exposed to client)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[AI_GENERATE] GEMINI_API_KEY not configured");
      // Return mock data for development/demo
      return apiResponse(getMockItinerary(data), "Itinerary generated (demo mode)");
    }

    const prompt = buildSystemPrompt(data);

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI_GENERATE] Gemini API error:", response.status, errorText);
      return apiError("AI generation failed. Please try again.", "AI_ERROR", 500);
    }

    const geminiResponse = await response.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return apiError("No response generated. Please try again.", "AI_EMPTY_RESPONSE", 500);
    }

    // Parse JSON from response (strip any markdown code fences if present)
    let itinerary: unknown;
    try {
      const cleaned = rawText
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "")
        .trim();
      itinerary = JSON.parse(cleaned) as unknown;
    } catch {
      console.error("[AI_GENERATE] Failed to parse AI response as JSON:", rawText.slice(0, 500));
      return apiError("Failed to parse AI response. Please try again.", "AI_PARSE_ERROR", 500);
    }

    return apiResponse(itinerary, "Itinerary generated successfully");
  } catch (error) {
    console.error("[AI_GENERATE]", error);
    return apiError("Generation failed. Please try again.", "GENERATION_ERROR", 500);
  }
}

// ─── Mock Data for Demo Mode ──────────────────────────────────────────────────
function getMockItinerary(data: z.infer<typeof generateSchema>) {
  return {
    title: `${data.duration}-Day ${data.destination} Adventure`,
    destination: data.destination,
    summary: `An expertly crafted ${data.duration}-day journey through ${data.destination}, perfectly tailored for ${data.travelers} traveler${data.travelers > 1 ? "s" : ""} with a ${data.budget} budget. This itinerary balances iconic highlights with hidden gems for an unforgettable experience.`,
    totalDays: data.duration,
    bestTimeToVisit: "April–June and September–November",
    estimatedBudget: {
      flights: 800,
      accommodation: 1400,
      food: 560,
      activities: 420,
      transport: 280,
      total: 3460,
    },
    travelTips: [
      "Book accommodations at least 3 months in advance for peak season",
      "Carry local currency for markets and small restaurants",
      "Download offline maps before you travel",
      "Purchase a local SIM card on arrival for internet access",
      "Respect local customs and dress codes at religious sites",
    ],
    days: Array.from({ length: Math.min(data.duration, 7) }, (_, i) => ({
      dayNumber: i + 1,
      title: `Day ${i + 1}: ${["Arrival & First Impressions", "Cultural Immersion", "Nature & Adventure", "Local Experiences", "Hidden Gems", "Culinary Discovery", "Farewell Day"][i] ?? `Exploration Day ${i + 1}`}`,
      theme: "Discover the soul of the destination",
      accommodation: "Centrally located boutique hotel",
      meals: ["Local breakfast at the hotel", "Street food lunch near the main market", "Traditional dinner at a highly-rated restaurant"],
      transportationTip: "Use the local metro or app-based taxis for convenience",
      activities: [
        {
          time: "9:00 AM",
          title: "Morning Cultural Visit",
          description: "Explore the iconic landmarks of the area with a knowledgeable local guide. Learn about the rich history and significance of each site.",
          type: "SIGHTSEEING",
          location: "City Center",
          estimatedCost: 25,
          duration: "2.5 hours",
        },
        {
          time: "12:30 PM",
          title: "Local Lunch Experience",
          description: "Dive into the local food scene at a beloved neighborhood restaurant. Try signature dishes and fresh seasonal ingredients.",
          type: "DINING",
          location: "Old Town Market",
          estimatedCost: 20,
          duration: "1.5 hours",
        },
        {
          time: "2:30 PM",
          title: "Afternoon Exploration",
          description: "Wander through the charming streets and discover local boutiques, galleries, and hidden courtyards at your own pace.",
          type: "SIGHTSEEING",
          location: "Historic District",
          estimatedCost: 0,
          duration: "2 hours",
        },
        {
          time: "7:00 PM",
          title: "Evening Dinner",
          description: "Experience the finest local cuisine at a top-rated restaurant with an authentic atmosphere and exceptional service.",
          type: "DINING",
          location: "Waterfront District",
          estimatedCost: 60,
          duration: "2 hours",
        },
      ],
    })),
  };
}

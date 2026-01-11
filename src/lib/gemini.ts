/**
 * AIRE Reasoning & Itinerary Generation Module
 * 
 * Core logic for the AI-Concierge that leverages Gemini 2.0 Flash to synthesize 
 * bespoke, luxury-themed 5-day itineraries tailored to specific resorts, 
 * family dynamics (including kids' ages), and partner-specific brand tones.
 * 
 * Handles reasoning orchestration, prompt engineering for luxury aesthetics, 
 * response parsing, and provides a stable fallback mechanism for high availability.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Resort {
    name: string;
    location: string;
    amenities: string[];
}

export async function generateItinerary(
    resort: Resort,
    nights: number,
    kidsAges?: number[],
    brandTone?: string,
    partnerName?: string
) {
    const tone = brandTone || "luxurious, warm, and personalized";
    const name = partnerName || "AIRE";

    const kidsContext = kidsAges && kidsAges.length > 0
        ? `This is a family trip with kids aged ${kidsAges.join(", ")} years old. Include age-appropriate activities like Kids' Club, family-friendly excursions, and child-safe amenities.`
        : "This trip may include adults and families. Provide a balanced mix of relaxation and adventure.";

    const prompt = `
You are the AI Concierge for ${name}. Your brand tone is ${tone}.
Use words like "Bespoke," "Curated," "Exclusive," "Unforgettable," and "Tailored" to describe the experience.

As a guest of ${name}, create a strictly 5-day vacation itinerary for a stay at ${resort.name} in ${resort.location}.
Even if the stay duration is different, provide a comprehensive 5-day plan.

The resort has the following amenities: ${resort.amenities.join(", ")}.

${kidsContext}

SYSTEM INSTRUCTION:
Return ONLY a JSON array of objects. Each object represents one day and must have the following keys:
- day: (number) The day number (1-5).
- title: (string) A catchy, luxury-themed title for the day (e.g., "Paradise Arrival", "Ocean Adventures").
- activities: (array of strings) A list of 3-4 specific activities for that day.
- dining: (object) with keys "breakfast", "lunch", "dinner" - each a string describing the dining experience.

Do not include any other text, markdown formatting, or code blocks. Output ONLY the raw JSON array.

Example format:
[
  {
    "day": 1,
    "title": "Welcome to Your Private Paradise",
    "activities": ["VIP Check-in and resort orientation", "Sunset beach walk with signature cocktails", "Welcome gala reception"],
    "dining": {"breakfast": "Gourmet Continental spread", "lunch": "Poolside grill with sommelier selection", "dinner": "Candlelit Beachfront Seafood"}
  }
]
`;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const itinerary = JSON.parse(jsonMatch[0]);

            // Validate it's exactly 5 days
            if (Array.isArray(itinerary) && itinerary.length === 5) {
                return itinerary;
            }
        }

        // If parsing fails or not 5 days, throw to trigger fallback
        throw new Error("Invalid itinerary format from Gemini");

    } catch (error) {
        console.error("Gemini API error:", error);

        // Fallback mock itinerary - always return 5 days as per requirement
        const fallbackActivities = kidsAges && kidsAges.length > 0
            ? ["Kids' Club activities", "Family pool time", "Beach games and sandcastle building"]
            : ["Beach lounging", "Swimming at infinity pool", "Guided resort tour"];

        return Array.from({ length: 5 }, (_, i) => ({
            day: i + 1,
            title: `Paradise Discovery Day ${i + 1}`,
            activities: fallbackActivities,
            dining: {
                breakfast: "Buffet Breakfast",
                lunch: "Poolside Grill",
                dinner: "Resort Specialty Restaurant"
            }
        }));
    }
}

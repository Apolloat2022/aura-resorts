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
You are the world-class AI Travel Concierge for "${name}". Your brand essence is characterized as "${tone}".
Your goal is to transform a standard resort stay into a legendary, "once-in-a-lifetime" experience.

As the personal concierge for ${name}, architect a strictly 5-day bespoke vacation itinerary for a stay at ${resort.name} in ${resort.location}.
Even if the guest's booked stay duration differs, you MUST provide a comprehensive 5-day blueprint.

EXECUTIVE CONTEXT:
- Resort Amenities to Highlight: ${resort.amenities.join(", ")}.
- Target Atmosphere: ${tone}.
- Guest Profile: ${kidsContext}

CONCIERGE REQUIREMENTS:
1. Activity Synergy: If the resort has specific amenities (e.g., "Infinity Pool", "Private Beach", "Spa"), you MUST weave them into the activities for Day 1 and Day 4.
2. Tone Consistency: Use high-end, evocative language (e.g., "Ephemeral", "Sublime", "Clandestine", "Epicurean") that matches the ${tone} brand voice.
3. Family Logic: Ensure activities are logically sequenced for the guest profile mentioned above.

SYSTEM INSTRUCTION (STRICT JSON ONLY):
Return ONLY a raw JSON array of objects. No markdown, no prose, no backticks.
Schema:
- day: (number) 1 through 5.
- title: (string) A captivating, luxury-themed title.
- activities: (array of strings) 3-4 highly specific, branded activities.
- dining: (object) { "breakfast": string, "lunch": string, "dinner": string } describing curated culinary experiences.

Example:
[
  {
    "day": 1,
    "title": "The Sublime Awakening",
    "activities": ["Private seaplane transfer orientation", "Signature sunset hydrotherapy at the ${resort.amenities[0] || 'Beach'}", "Starlit canopy reception"],
    "dining": {"breakfast": "Floating tray in-villa espresso", "lunch": "Beachside organic crudo session", "dinner": "Chef's table immersion"}
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

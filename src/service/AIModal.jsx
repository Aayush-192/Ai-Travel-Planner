import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

export async function generateTravelPlan(userInput) {
  if (!userInput || !userInput.trim()) {
    throw new Error("Please enter your travel requirements.");
  }

  const prompt = `
You are an AI travel planning assistant.

Analyze the user's travel request.

The user will provide:
- destination
- trip duration
- number of travelers
- budget

These four fields are required.

Do NOT require travel style or preferences because the application does not collect them.

If destination, duration, travelers, or budget is missing, return status "incomplete".

If all four required fields are available, generate a complete travel plan.

Return ONLY valid JSON.
Do not use Markdown.
Do not use code fences.

Return exactly this structure:

{
  "status": "complete",
  "message": "",
  "requirements": {
    "destination": "",
    "duration": "",
    "travelers": "",
    "budget": "",
    "travelStyle": "Not specified",
    "missingInformation": []
  },
  "travelPlan": {
    "hotels": [],
    "itinerary": []
  }
}

For each hotel include:

{
  "hotelName": "",
  "hotelAddress": "",
  "price": "",
  "hotelImageUrl": "",
  "geoCoordinates": "",
  "rating": "",
  "description": ""
}

For each itinerary item include:

{
  "day": 1,
  "time": "",
  "placeName": "",
  "placeDetails": "",
  "placeImageUrl": "",
  "geoCoordinates": "",
  "ticketPricing": "",
  "rating": "",
  "timeTravel": "",
  "bestTimeToVisit": ""
}

Generate an itinerary for every day of the trip.

If any required information is missing, return:

{
  "status": "incomplete",
  "message": "",
  "requirements": {
    "destination": "",
    "duration": "",
    "travelers": "",
    "budget": "",
    "travelStyle": "Not specified",
    "missingInformation": []
  },
  "travelPlan": {
    "hotels": [],
    "itinerary": []
  }
}

USER REQUEST:
${userInput.trim()}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: "minimal",
        },
      },
    });

    const text = response.text;

    console.log("RAW GEMINI RESPONSE:", text);

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    let cleanText = text.trim();

    if (cleanText.startsWith("```json")) {
      cleanText = cleanText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    const result = JSON.parse(cleanText);

    console.log("PARSED GEMINI RESPONSE:", result);

    return result;
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe } from "../types/Recipe";

// initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
// use gemini-flash-latest alias which points to the current stable flash model
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * generate recipes from a prompt using Google Gemini
 * @param prompt A string describing the recipe ideas
 * @param count Number of recipes to request (defaults to 6)
 * @returns Array of Recipe objects
 */
export const getRecipes = async (
  prompt: string,
  count: number = 6,
  verboseInstructions: boolean = false
): Promise<Recipe[]> => {
  // when verboseInstructions is true the caller intends to receive long, detailed steps.

  const input = `You are a professional recipe author. Generate exactly ${count} recipes based on this description: "${prompt}".

Instructions requirements (IMPORTANT - follow exactly):
- Provide an "instructions" array containing AT LEAST 8 steps for each recipe.
- Each step must be 2–4 complete sentences, actionable, and may include short timings, small tips, or optional substitutions.
- The full set of steps for a single recipe should be substantial (aim for ~200–400 words total across steps).
- You may include an optional "notes" short string with extra tips, and an optional "image" URL string.

IMPORTANT: Return ONLY a valid JSON array, with NO additional text, NO markdown formatting, NO code blocks, and no commentary.

The JSON must follow this exact structure:
[
  {
    "title": "Recipe Name Here",
    "time": "30 mins",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "instructions": [
      "First step as 2-4 sentences.",
      "Second step as 2-4 sentences.",
      "... at least 8 total steps ..."
    ],
    "image": "",
    "notes": "" // optional short notes or tips
  }
]

Return ONLY the JSON array, nothing else.`;

  try {
    // call the Gemini model
    const result = await model.generateContent(input);
    let text = result.response.text();

    // remove markdown code blocks if present
    text = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    // optional: sanitize trailing commas or other small JSON issues
    text = text.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");

    // parse JSON
    const recipesRaw = JSON.parse(text) as any[];

    // validate: ensure array with objects
    if (!Array.isArray(recipesRaw)) {
      return [];
    }

    if (recipesRaw.length === 0) {
      return [];
    }

    return recipesRaw.map((r, index) => ({
      id: r.id ?? `recipe-${Date.now()}-${index}`,
      title: r.title ?? "",
      time: r.time ?? "",
      ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
      instructions: Array.isArray(r.instructions) ? r.instructions : [],
      image: r.image ?? "",
    }));
  } catch {
    // return empty array on any error
    return [];
  }
};

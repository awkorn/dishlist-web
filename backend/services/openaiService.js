import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


/**
 * Calculate nutrition facts for given ingredients
 * @param {string[]} ingredients - List of ingredients
 * @param {number} servingsCount - Number of servings
 * @returns {Promise<Object>} - Nutrition data
 */
export const analyzeNutrition = async (ingredients, servingsCount) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a nutrition expert. Analyze the given ingredients and provide accurate 
                    nutritional information. Consider standard cooking methods and ingredient interactions.
                    Return ONLY a JSON object with these nutritional values per serving: calories (number), 
                    protein (g, number), carbs (g, number), fat (g, number), fiber (g, number), 
                    sugar (g, number), sodium (mg, number).` 
        },
        { 
          role: "user", 
          content: `Calculate nutrition facts for these ingredients for ${servingsCount} serving(s):\n\n${ingredients.join('\n')}` 
        }
      ],
      response_format: { type: "json_object" },
    });
    
    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI nutrition analysis error:", error);
    throw new Error("Failed to analyze nutrition");
  }
};

/**
 * Generate a recipe based on ingredients and preferences
 * @param {string[]} ingredients - List of ingredients
 * @param {string[]} dietaryRestrictions - List of dietary restrictions
 * @param {Object} macros - Target macros
 * @returns {Promise<Object>} - Recipe data
 */
export const generateRecipe = async (ingredients, dietaryRestrictions, macros) => {
  try {
    // Construct the prompt for OpenAI
    let prompt = `Generate a detailed recipe using these ingredients: ${ingredients.join(", ")}.\n\n`;
    
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += `The recipe must follow these dietary restrictions: ${dietaryRestrictions.join(", ")}.\n\n`;
    }
    
    if (macros) {
      prompt += "The recipe should aim for these nutritional targets per serving:\n";
      if (macros.calories) prompt += `- Calories: approximately ${macros.calories}\n`;
      if (macros.protein) prompt += `- Protein: approximately ${macros.protein}g\n`;
      if (macros.carbs) prompt += `- Carbohydrates: approximately ${macros.carbs}g\n`;
      if (macros.fat) prompt += `- Fat: approximately ${macros.fat}g\n\n`;
    }
    
    prompt += `Format the response as a JSON object with these fields:
    - title (string): A creative name for the recipe
    - prepTime (number): Estimated preparation time in minutes
    - cookTime (number): Estimated cooking time in minutes
    - servings (number): Number of servings
    - ingredients (array of strings): List of ingredients with quantities
    - instructions (array of strings): Step-by-step cooking instructions
    - tags (array of strings): Relevant tags for the recipe (e.g., quick, vegetarian, high-protein)
    - nutrition (object): Estimated nutrition per serving including calories, protein, carbs, fat`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are an expert chef specializing in recipe creation. Create delicious, practical 
                    recipes based on user ingredients and requirements. Provide accurate measurements, 
                    clear instructions, and reasonable nutritional estimates.` 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });
    
    // Parse the recipe from the response
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI recipe generation error:", error);
    throw new Error("Failed to generate recipe");
  }
};

export default {
  analyzeNutrition,
  generateRecipe
};
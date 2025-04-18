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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. Analyze the given ingredients and provide accurate 
                    nutritional information. Consider standard cooking methods and ingredient interactions.
                    Return ONLY a JSON object with these nutritional values per serving: calories (number), 
                    protein (g, number), carbs (g, number), fat (g, number), fiber (g, number), 
                    sugar (g, number), sodium (mg, number).`,
        },
        {
          role: "user",
          content: `Calculate nutrition facts for these ingredients for ${servingsCount} serving(s):\n\n${ingredients.join(
            "\n"
          )}`,
        },
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
 * @param {string} specialInstructions - Special instructions for recipe
 * @returns {Promise<Object>} - Recipe data
 */
export const generateRecipe = async (
  ingredients,
  dietaryRestrictions,
  macros,
  specialInstructions
) => {
  try {
    let prompt = `Generate a detailed recipe that must include these ingredients as a starting point: ${ingredients.join(
      ", "
    )}.
    Incorporate additional ingredients (e.g., vegetables, spices, pantry staples, or other proteins) to create a flavorful dish.
    Draw inspiration from global cuisines, seasonal flavors, or classic comfort foods, while keeping the recipe approachable for home cooks.\n\n`;

    // Add special instructions if provided
    if (specialInstructions && specialInstructions.trim()) {
      prompt += `IMPORTANT - Follow these special instructions for the recipe: ${specialInstructions}\n\n`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += `The recipe must follow these dietary restrictions: ${dietaryRestrictions.join(
        ", "
      )}.\n\n`;
    }

    if (macros) {
      prompt +=
        "The recipe should aim for these nutritional targets per serving:\n";
      if (macros.calories)
        prompt += `- Calories: approximately ${macros.calories}\n`;
      if (macros.protein)
        prompt += `- Protein: approximately ${macros.protein}g\n`;
      if (macros.carbs)
        prompt += `- Carbohydrates: approximately ${macros.carbs}g\n`;
      if (macros.fat) prompt += `- Fat: approximately ${macros.fat}g\n\n`;
    }

    prompt += `Format the response as a JSON object with these fields:
    - title (string): A realistic, appealing, and straightforward recipe title (avoid puns or overly whimsical names)
    - prepTime (number): Estimated preparation time in minutes
    - cookTime (number): Estimated cooking time in minutes
    - servings (number): Number of servings
    - ingredients (array of strings): List of ingredients with quantities
    - instructions (array of strings): Step-by-step cooking instructions
    - tags (array of strings): Relevant tags for the recipe (e.g., quick, vegetarian, high-protein)
    - nutrition (object): Estimated nutrition per serving including calories, protein, carbs, fat`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional chef with experience writing recipes for real-world cookbooks. 
          Generate recipes that are practical, delicious, popular, and based on tested cooking principles. 
          Use accurate measurements, realistic prep/cook times, clear instructions, and avoid gimmicky or overly creative titles.`,
        },
        { role: "user", content: prompt },
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

/**
 * Parse a recipe from unstructured text
 * @param {string} recipeText - Unstructured recipe text
 * @returns {Promise<Object>} - Structured recipe data
 */
export const parseRecipe = async (recipeText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a recipe parser that structures recipe content into a standardized format.
                    Extract the recipe components from the provided text, but rephrase the instructions
                    to avoid copyright issues while maintaining the same cooking steps.
                    For ingredients, extract them into the correct format with separate amount, unit, and name fields.
                    Never alter cooking temperatures, times or measurements.
                    
                    Pay special attention to:
                    - Prep time, cook time, and total time (convert to minutes if given in hours)
                    - Servings
                    - Ingredients with their amounts and units
                    - Instructions (rephrase these)
                    - Any nutrition information
                    
                    Return ONLY a JSON object with these fields:
                    - title (string): Recipe title
                    - prepTime (number): Preparation time in minutes (0 if not specified)
                    - cookTime (number): Cooking time in minutes (0 if not specified)
                    - servings (number): Number of servings (0 if not specified)
                    - ingredients (array of objects): [{name: string, amount: string, unit: string}]
                      * For each ingredient, separate the amount (e.g., "1"), unit (e.g., "cup"), and name (e.g., "chopped onion")
                      * If an ingredient doesn't have an amount or unit, use an empty string for those fields
                    - instructions (array of strings): Rephrased cooking steps
                    - tags (array of strings): Empty array (user will fill these in)
                    
                    If you can extract nutrition information, include it in a 'nutrition' object with these properties:
                    calories, protein, carbs, fat, fiber, sugar, sodium (all as numbers).`,
        },
        {
          role: "user",
          content: `Parse this recipe into a structured format:\n\n${recipeText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const parsedRecipe = JSON.parse(response.choices[0].message.content);

    // Clean up numeric values (ensure they are numbers, not strings)
    if (parsedRecipe.prepTime)
      parsedRecipe.prepTime = parseInt(parsedRecipe.prepTime, 10) || 0;
    if (parsedRecipe.cookTime)
      parsedRecipe.cookTime = parseInt(parsedRecipe.cookTime, 10) || 0;
    if (parsedRecipe.servings)
      parsedRecipe.servings = parseInt(parsedRecipe.servings, 10) || 0;

    // Ensure ingredients are in correct format
    if (parsedRecipe.ingredients && Array.isArray(parsedRecipe.ingredients)) {
      parsedRecipe.ingredients = parsedRecipe.ingredients.map((ing) => {
        // If the ingredient is already in the correct format
        if (typeof ing === "object" && "name" in ing) {
          return {
            name: ing.name || "",
            amount: ing.amount || "",
            unit: ing.unit || "",
          };
        }
        // If it's a string, try to parse it
        else if (typeof ing === "string") {
          const parts = ing.trim().split(/\s+/);
          // Extract amount (assume first part is amount if it starts with a number)
          let amount = "";
          let unit = "";
          let name = ing;

          if (/^\d/.test(parts[0])) {
            amount = parts[0];
            if (parts.length > 1) {
              // Try to identify common units (cup, tbsp, tsp, oz, g, lb, etc.)
              const commonUnits = [
                "cup",
                "cups",
                "tbsp",
                "tsp",
                "oz",
                "g",
                "lb",
                "lbs",
                "ml",
                "l",
              ];
              if (commonUnits.includes(parts[1].toLowerCase())) {
                unit = parts[1];
                name = parts.slice(2).join(" ");
              } else {
                name = parts.slice(1).join(" ");
              }
            }
          }

          return { name, amount, unit };
        }
        return { name: "", amount: "", unit: "" };
      });
    } else {
      parsedRecipe.ingredients = [{ name: "", amount: "", unit: "" }];
    }

    return parsedRecipe;
  } catch (error) {
    console.error("OpenAI recipe parsing error:", error);
    throw new Error("Failed to parse recipe");
  }
};

export default {
  analyzeNutrition,
  generateRecipe,
  parseRecipe,
};

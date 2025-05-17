import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { recipeText } = await request.json();

    if (!recipeText || !recipeText.trim()) {
      return NextResponse.json(
        { error: "Recipe text is required" },
        { status: 400 }
      );
    }

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

    // Check if message content exists and parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to get response from OpenAI" },
        { status: 500 }
      );
    }
    
    const parsedRecipe = JSON.parse(content);

    // Clean up numeric values (ensure they are numbers, not strings)
    if (parsedRecipe.prepTime)
      parsedRecipe.prepTime = parseInt(parsedRecipe.prepTime, 10) || 0;
    if (parsedRecipe.cookTime)
      parsedRecipe.cookTime = parseInt(parsedRecipe.cookTime, 10) || 0;
    if (parsedRecipe.servings)
      parsedRecipe.servings = parseInt(parsedRecipe.servings, 10) || 0;

    // Ensure ingredients are in correct format
    if (parsedRecipe.ingredients && Array.isArray(parsedRecipe.ingredients)) {
      parsedRecipe.ingredients = parsedRecipe.ingredients.map((ing: any) => {
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

    return NextResponse.json({ recipe: parsedRecipe });
  } catch (error: any) {
    console.error("OpenAI recipe parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse recipe" },
      { status: 500 }
    );
  }
}
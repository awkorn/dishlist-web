import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { ingredients, dietaryRestrictions, macros, specialInstructions } = await request.json();

    if (!ingredients || !ingredients.length) {
      return NextResponse.json(
        { error: "Ingredients are required" },
        { status: 400 }
      );
    }

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

    // Check if message content exists and parse the recipe from the response
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to get response from OpenAI" },
        { status: 500 }
      );
    }
    
    const recipe = JSON.parse(content);
    return NextResponse.json({ recipe });
  } catch (error: any) {
    console.error("OpenAI recipe generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
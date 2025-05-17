import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { ingredients, servingsCount = 1 } = await request.json();

    if (!ingredients || !ingredients.length) {
      return NextResponse.json(
        { error: "Ingredients are required" },
        { status: 400 }
      );
    }

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

    // Check if message content exists and parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to get response from OpenAI" },
        { status: 500 }
      );
    }
    
    const nutritionData = JSON.parse(content);
    return NextResponse.json({ result: nutritionData });
  } catch (error: any) {
    console.error("OpenAI nutrition analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze nutrition" },
      { status: 500 }
    );
  }
}
import express from 'express';
import openaiService from '../services/openaiService.js';

const router = express.Router();


// Nutrition analysis endpoint
router.post("/nutrition", async (req, res) => {
  const { ingredients, servingsCount } = req.body;
  
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: "Ingredients are required" });
  }
  
  try {
    const result = await openaiService.analyzeNutrition(ingredients, servingsCount || 1);
    res.json({ result });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze nutrition" });
  }
});

// Recipe generation endpoint
router.post("/generate-recipe", async (req, res) => {
  const { ingredients, dietaryRestrictions, macros, specialInstructions } = req.body;
  
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: "Ingredients are required" });
  }
  
  try {
    const recipe = await openaiService.generateRecipe(
      ingredients, 
      dietaryRestrictions, 
      macros,
      specialInstructions
    );
    res.json({ recipe });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate recipe" });
  }
});

export default router;
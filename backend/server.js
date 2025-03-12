import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

//connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

//initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });

  //initialize OpenAI API
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  //OpenAI API Route
  app.post("/api/generate", async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
      });
      res.json({ result: response.choices[0].message.content });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "Failed to generate a response" });
    }
  });

  // Add the new nutrition endpoint
  app.post("/api/nutrition", async (req, res) => {
    const { ingredients, servingsCount = 1 } = req.body;
    
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
      const nutritionData = JSON.parse(response.choices[0].message.content);
      res.json({ result: nutritionData });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.status(500).json({ error: "Failed to analyze nutrition" });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer();
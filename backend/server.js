import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import aiRoutes from "./routes/aiRoutes.js";
import { startCleanupJobs } from "./scripts/cleanupJob.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true
}));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Don't exit process in production/serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Mount API routes
app.use("/api", aiRoutes);

// Initialize Apollo Server
const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  introspection: true
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });

  // Only start a listening server in development
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`AI API endpoints available at http://localhost:${PORT}/api/*`);
    });
  }
}

startApolloServer();

// Only run cleanup jobs in development
if (process.env.NODE_ENV !== 'production') {
  startCleanupJobs();
} else {
  console.log('Running in production mode - cleanup jobs disabled for serverless');
}

// Export the app for Vercel
export default app;
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
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Mount API routes
app.use("/api", aiRoutes);

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(`AI API endpoints available at http://localhost:${PORT}/api/*`);
  });

}

startApolloServer();
startCleanupJobs();
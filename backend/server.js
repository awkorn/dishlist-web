import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs/index.js";
import resolvers from "./graphql/resolvers/index.js";
import aiRoutes from "./routes/aiRoutes.js";
import { startCleanupJobs } from "./scripts/cleanupJob.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the current file name and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine environment and load appropriate .env file
const environment = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `.env.${environment}`);

// Load environment variables based on NODE_ENV
dotenv.config({ path: envPath });

// Initialize the Express app
const app = express();

// Apply middleware
app.use(express.json());

// Configure CORS based on environment
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Define allowed origins based on environment
    const allowedOrigins = {
      development: ['http://localhost:3000'],
      staging: ['https://staging-dishlist-web.vercel.app'],
      production: ['https://dishlist-web.vercel.app']
    };
    
    // In development, be more permissive
    if (environment === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is allowed for staging/production
    if(allowedOrigins[environment].indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Log current environment and configuration
console.log(`Server starting in ${environment} mode`);

// Add request logger for development
if (environment === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Connect to MongoDB with configuration based on environment
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(`Connected to MongoDB (${environment} environment)`))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // More detailed error in development
    if (environment === 'development') {
      console.error("Error details:", err);
    }
    process.exit(1);
  });

// Mount API routes
app.use("/api", aiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    environment, 
    timestamp: new Date().toISOString() 
  });
});

// Development-only routes
if (environment === 'development') {
  app.get("/dev/config", (req, res) => {
    res.json({
      environment,
      mongoConnected: mongoose.connection.readyState === 1,
      apiEndpoints: {
        graphql: '/graphql',
        aiRoutes: '/api'
      }
    });
  });
}

// Initialize Apollo Server with configuration based on environment
const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  context: ({ req }) => {
    return { environment };
  },
  // Enable introspection and playground in non-production environments
  introspection: environment !== 'production',
  playground: environment !== 'production'
});

async function startApolloServer() {
  await server.start();
  
  server.applyMiddleware({ 
    app,
    // Increase body parser limit for file uploads in development
    bodyParserConfig: environment === 'development' 
      ? { limit: '10mb' } 
      : { limit: '1mb' }
  });

  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${environment} mode`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`AI API endpoints available at http://localhost:${PORT}/api/*`);
    
    // Start cleanup jobs in production and staging, but not in development
    if (environment === 'production' || environment === 'staging') {
      startCleanupJobs();
      console.log('Database cleanup jobs scheduled');
    }
  });
}

startApolloServer();
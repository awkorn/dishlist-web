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
app.use(express.json({ limit: '10mb' }));

// Configure CORS based on environment
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // Define allowed origins based on environment
    const allowedOrigins = {
      development: ['http://localhost:3000'],
      staging: ['https://staging-dishlist-web.vercel.app', 'https://dishlist-web-git-staging.vercel.app'],
      production: ['https://dishlist-web.vercel.app', 'https://dishlist-frontend.vercel.app'] 
    };
    
    // In development or if running on Vercel preview, be more permissive
    if (environment === 'development' || process.env.VERCEL_ENV === 'preview') {
      return callback(null, true);
    }
    
    // Check if origin is allowed for staging/production
    if(allowedOrigins[environment].indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Log current environment and configuration
console.log(`Server starting in ${environment} mode`);
console.log(`Running on Vercel: ${process.env.VERCEL ? 'Yes' : 'No'}`);

// Add request logger for development
if (environment === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Better health check endpoint - accessible before DB connection
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    environment,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? true : false,
    vercelEnv: process.env.VERCEL_ENV,
    dbConnected: mongoose.connection ? mongoose.connection.readyState === 1 : false,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API routes
app.use("/api", aiRoutes);

// Connect to MongoDB with improved error handling and options
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 60000,
    family: 4
  })
  .then(() => console.log(`Connected to MongoDB (${environment} environment)`))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // More detailed error in development
    if (environment === 'development') {
      console.error("Error details:", err);
    }
    // Don't exit process in Vercel environment to allow server to still function
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  });

// Development-only routes
if (environment === 'development') {
  app.get("/dev/config", (req, res) => {
    res.json({
      environment,
      mongoConnected: mongoose.connection ? mongoose.connection.readyState === 1 : false,
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
    path: '/graphql',
    bodyParserConfig: { 
      limit: '10mb' 
    }
  });

  // Check if running on Vercel
  if (process.env.VERCEL) {
    console.log('Running on Vercel - setup complete without starting server');
    
    if (environment === 'production' || environment === 'staging') {
      console.log('Note: Database cleanup jobs would be scheduled, but are disabled in serverless environment');
    }
  } else {
    // When running locally, start a traditional server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${environment} mode`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`AI API endpoints available at http://localhost:${PORT}/api/*`);
      
      // Start cleanup jobs in production and staging (but not on Vercel)
      if ((environment === 'production' || environment === 'staging') && !process.env.VERCEL) {
        startCleanupJobs();
        console.log('Database cleanup jobs scheduled');
      }
    });
  }
}

// Start Apollo server
startApolloServer().catch(err => {
  console.error('Failed to start Apollo Server:', err);
});

// Export the Express app for Vercel
export default app;
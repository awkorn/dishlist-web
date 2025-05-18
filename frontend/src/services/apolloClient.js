import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Get the environment from the environment variable
const environment = process.env.REACT_APP_NODE_ENV || 'development';

// Determine the backend URL based on the environment
let backendUrl;
switch (environment) {
  case 'production':
    backendUrl = 'https://dishlist-web.vercel.app';
    break;
  case 'staging':
    backendUrl = 'https://staging-dishlist-web.vercel.app';
    break;
  default:
    backendUrl = 'http://localhost:5000';
}

// Override with explicit URL if provided
if (process.env.REACT_APP_BACKEND_API_URL) {
  backendUrl = process.env.REACT_APP_BACKEND_API_URL;
}

const client = new ApolloClient({
  link: new HttpLink({ 
    uri: `${backendUrl}/graphql` 
  }),
  cache: new InMemoryCache(),
});

export default client;
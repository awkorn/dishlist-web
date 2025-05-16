import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const isProd = process.env.NODE_ENV === 'production';
const backendUrl = process.env.REACT_APP_BACKEND_API_URL || 
  (isProd ? 'https://dishlist-web.vercel.app' : 'http://localhost:5000');

const client = new ApolloClient({
  link: new HttpLink({ 
    uri: `${backendUrl}/graphql` 
  }),
  cache: new InMemoryCache(),
});

export default client;

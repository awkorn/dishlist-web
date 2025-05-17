'use client';

import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from "@apollo/client";
import { ReactNode } from "react";

const isProd = process.env.NODE_ENV === 'production';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
  (isProd ? 'https://dishlist-web.vercel.app' : 'http://localhost:5000');

const client = new ApolloClient({
  link: new HttpLink({ 
    uri: `${backendUrl}/graphql` 
  }),
  cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}
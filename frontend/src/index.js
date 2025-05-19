import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthProvider";
import { ApolloProvider } from "@apollo/client";
import client from "./services/apolloClient";
import './config/api';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProvider>
);

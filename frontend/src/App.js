import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotFound from "./components/NotFound/NotFound";
import DishListsPage from "./pages/DishListsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dishlists" element={<DishListsPage />} />
        <Route path="*" element={<NotFound></NotFound>}></Route>
      </Routes>
    </Router>
  );
}

export default App;

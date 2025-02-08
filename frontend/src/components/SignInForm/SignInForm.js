import React, { useState } from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import axios from "axios";
import "./SignInForm.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", { email, password });
      console.log("Logged in:", response.data);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <form className="sign-in-form" onSubmit={handleSubmit}>
      <input
        className="sign-in-input"
        type="email"
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      ></input>

      <input
        className="sign-in-input"
        type="password"
        id="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" className="login-button">
        Login
      </button>

      <div className="divider">
        <hr className="line" />
        <span>or continue with</span>
        <hr className="line" />
      </div>

      <div className="google-button-container">
        <GoogleSignInButton />
      </div>

      <a href="/signup" className="signup-link">
        New User? Sign up
      </a>
    </form>
  );
};

export default SignInForm;

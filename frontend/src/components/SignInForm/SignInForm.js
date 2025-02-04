import React, { useState } from "react";
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
        type="email"
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      ></input>

      <input
        type="password"
        id="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>
    </form>
  );
};

export default SignInForm;

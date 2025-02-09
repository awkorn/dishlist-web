import React, { useState } from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../../services/authService";

import "./SignInForm.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      console.log("Successfully signed in:", user.email);
      //TODO: Redirect to home page
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address. Please try again.");
      } else {
        toast.error("Error signing in: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="sign-in-form" onSubmit={handleSignIn}>
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

      <button type="submit" className="login-button" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
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
      <ToastContainer></ToastContainer>
    </form>
  );
};

export default SignInForm;

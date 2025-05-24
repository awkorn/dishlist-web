import React, { useEffect, useState } from "react";
import GoogleSignInButton from "../GoogleSignIn/GoogleSignInButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../../../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider";
import styles from "./SignInForm.module.css";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();

  // Redirect when user is already authenticated and has data
  useEffect(() => {
    if (currentUser && dbUser) {
      navigate("/dishlists");
    }
  }, [currentUser, dbUser, navigate]);

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

      setEmail("");
      setPassword("");

      // Toast success message
      toast.success("Successfully signed in!");
      navigate("/dishlists");
      
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
      setLoading(false); // Only set loading to false on error
    }
  };

  return (
    <form className={styles.signInForm} onSubmit={handleSignIn}>
      <input
        className={styles.signInInput}
        type="email"
        id="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <div className={styles.passwordContainer}>
        <input
          className={styles.signInInput}
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <span
          className={styles.passwordIcon}
          onClick={() => !loading && setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>
      </div>

      <button type="submit" className={styles.loginButton} disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>

      <div className={styles.divider}>
        <hr className={styles.line} />
        <span>or continue with</span>
        <hr className={styles.line} />
      </div>

      <div className={styles.googleButtonContainer}>
        <GoogleSignInButton disabled={loading} />
      </div>

      <a href="/signup" className={styles.signupLink} tabIndex={loading ? -1 : 0}>
        New User? Sign up
      </a>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </form>
  );
};

export default SignInForm;
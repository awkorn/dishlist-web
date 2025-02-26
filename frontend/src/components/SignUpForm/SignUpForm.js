import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import "./SignUpForm.css";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, dbUser } = useAuth();

  useEffect(() => {
    // Only redirect when both Firebase auth and MongoDB user are ready
    if (currentUser && dbUser) {
      // Check if this is the first time signing in
      const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
      
      if (isNewUser) {
        toast.success("Sign-up successful! Welcome, " + currentUser.displayName);
      }
  
      navigate("/dishlists");
    }
  }, [currentUser, dbUser, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevents page reload

    // Password verification
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, with uppercase, numbers, and special characters."
      );
      return;
    }

    // Check for empty fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Create user with email and password
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      // Combine first and last name for display name
      const fullName = `${firstName} ${lastName}`;
      
      try {
        await updateProfile(user, { displayName: fullName });
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          toast.error("Please log in again to update your profile.");
        } else if (error.code === "network-request-failed") {
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else {
          toast.error("Failed to update profile. Please try again.");
          console.error("Profile update error:", error);
        }
      }

      // Reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // AuthProvider will handle creating MongoDB user via the createUser mutation
      toast.success("Account created successfully!");
      
      // No need to navigate here - useEffect will handle it once currentUser and dbUser are updated
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address. Please try again.");
      } else {
        toast.error("Error during sign-up: " + error.message);
        console.error("Sign-up error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="sign-up-form" onSubmit={handleSignUp}>
      <input
        className="sign-up-input"
        id="firstName"
        type="text"
        value={firstName}
        placeholder="First Name"
        onChange={(e) => setFirstName(e.target.value)}
        autoComplete="given-name"
        required
      />

      <input
        className="sign-up-input"
        id="lastName"
        type="text"
        value={lastName}
        placeholder="Last Name"
        onChange={(e) => setLastName(e.target.value)}
        autoComplete="family-name"
        required
      />

      <input
        className="sign-up-input"
        id="email"
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div className="password-container">
        <input
          className="sign-up-input"
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            paddingRight: "40px",
          }}
        />
        <span
          className="password-icon"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>
      </div>

      <div className="password-container">
        <input
          className="sign-up-input"
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            width: "100%",
            paddingRight: "40px",
          }}
        />
        <span
          className="password-icon"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>
      </div>

      <button type="submit" disabled={loading} className="sign-up-button">
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </form>
  );
};

export default SignUpForm;
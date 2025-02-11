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
  const { currentUser } = useAuth();

  //redirect to dishlists page
  useEffect(() => {
    if (currentUser) {
      navigate("/dishlists");
    }
  }, [currentUser, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault(); //prevents page reload

    //password verification
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, with uppercase, numbers, and special characters."
      );
      return;
    }

    //check for empty fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill out all fields.");
      return;
    }

    //validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    //create user with email and password
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      try {
        await updateProfile(user, { displayName: firstName });
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

      toast.success("Sign-up successful! Welcome, " + firstName);

      //reset form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      //redirect user to dishlists page on success
      navigate("/dishlists");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address. Please try again.");
      } else {
        toast.error("Error during sign-up: " + error.message);
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
        autoComplete="name"
        required
      />

      <input
        className="sign-up-input"
        id="lastName"
        type="text"
        value={lastName}
        placeholder="Last Name"
        onChange={(e) => setLastName(e.target.value)}
        autoComplete="name"
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

      <ToastContainer />
    </form>
  );
};

export default SignUpForm;

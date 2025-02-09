import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
      await updateProfile(user, { displayName: firstName });
      toast.success("Sign-up successful! Welcome, " + firstName);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
        id="name"
        type="text"
        value={firstName}
        placeholder="First Name"
        onChange={(e) => setFirstName(e.target.value)}
        autoComplete="name"
        required
      />

      <input
        className="sign-up-input"
        id="name"
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

      <div style={{ position: "relative", width: "100%" }}>
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

      <div style={{ position: "relative", width: "100%" }}>
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

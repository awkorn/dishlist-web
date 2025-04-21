import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider";
import styles from "./SignUpForm.module.css";
import { useLazyQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

// GraphQL query to check username availability
const CHECK_USERNAME_AVAILABILITY = gql`
  query CheckUsernameAvailability($username: String!) {
    checkUsernameAvailability(username: $username)
  }
`;

// Add the CREATE_USER mutation directly in the SignUpForm component
const CREATE_USER = gql`
  mutation CreateUser(
    $firebaseUid: String!
    $email: String!
    $username: String!
    $firstName: String!
    $lastName: String!
  ) {
    createUser(
      firebaseUid: $firebaseUid
      email: $email
      username: $username
      firstName: $firstName
      lastName: $lastName
    ) {
      id
      firebaseUid
      email
      username
      firstName
      lastName
    }
  }
`;

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();
  const { currentUser, dbUser, refreshUserData } = useAuth();

  // Set up the mutation for creating a user
  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      console.log("MongoDB user created successfully:", data);
      // Optionally refresh user data in context
      if (refreshUserData) {
        refreshUserData();
      }
    },
    onError: (error) => {
      console.error("Error creating MongoDB user:", error);
      toast.error("Error creating user profile: " + error.message);
    },
  });

  // Set up the username availability check query
  const [checkUsername, { loading: usernameLoading }] = useLazyQuery(
    CHECK_USERNAME_AVAILABILITY,
    {
      onCompleted: (data) => {
        if (!data.checkUsernameAvailability) {
          setUsernameError(
            "This username is already taken. Please choose another one."
          );
        } else {
          setUsernameError("");
        }
        setCheckingUsername(false);
      },
      onError: (error) => {
        console.error("Error checking username:", error);
        setUsernameError("Error checking username availability");
        setCheckingUsername(false);
      },
    }
  );

  useEffect(() => {
    // Only redirect when both Firebase auth and MongoDB user are ready
    if (currentUser && dbUser) {
      // Check if this is the first time signing in
      const isNewUser =
        currentUser.metadata.creationTime ===
        currentUser.metadata.lastSignInTime;

      if (isNewUser) {
        toast.success(`Welcome, ${firstName} ${lastName}!`);
      }

      navigate("/dishlists");
    }
  }, [currentUser, dbUser, navigate, firstName, lastName]);

  // Validate username (only alphanumeric and underscores allowed)
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  // Create a debounced username check function
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // First, validate the format
    if (value && !validateUsername(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    setUsernameError("");

    // If username is valid and at least 3 characters, check availability
    if (value.length >= 3) {
      setCheckingUsername(true);

      // Add debounce logic to avoid too many requests
      const timeoutId = setTimeout(() => {
        checkUsername({ variables: { username: value } });
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevents page reload

    // Check for username errors
    if (usernameError) {
      toast.error("Please fix the username issues before submitting");
      return;
    }

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
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Validate username format
    if (!validateUsername(username)) {
      toast.error(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Don't proceed if still checking username
    if (checkingUsername || usernameLoading) {
      toast.info("Still checking username availability. Please wait.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Firebase user
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;

      // Combine first and last name for display name
      const displayName = `${firstName} ${lastName}`;

      try {
        // Step 2: Update Firebase profile with display name
        await updateProfile(user, { displayName: displayName });

        // Step 3: Create MongoDB user directly with the form data
        await createUser({
          variables: {
            firebaseUid: user.uid,
            email: user.email,
            username: username,
            firstName: firstName,
            lastName: lastName,
          },
        });

        // Reset form fields
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        toast.success("Account created successfully!");
      } catch (error) {
        console.error("Error in user creation process:", error);
        if (error.code === "auth/requires-recent-login") {
          toast.error("Please log in again to update your profile.");
        } else {
          toast.error("Error creating account: " + error.message);
        }
      }
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
    <form className={styles.signUpForm} onSubmit={handleSignUp}>
      {/* Form fields remain the same */}
      <input
        className={styles.signUpInput}
        id="firstName"
        type="text"
        value={firstName}
        placeholder="First Name"
        onChange={(e) => setFirstName(e.target.value)}
        autoComplete="given-name"
        required
      />

      <input
        className={styles.signUpInput}
        id="lastName"
        type="text"
        value={lastName}
        placeholder="Last Name"
        onChange={(e) => setLastName(e.target.value)}
        autoComplete="family-name"
        required
      />

      <div className={styles.inputWithError}>
        <input
          className={`${styles.signUpInput} ${
            usernameError ? styles.inputError : ""
          }`}
          id="username"
          type="text"
          value={username}
          placeholder="Username"
          onChange={handleUsernameChange}
          autoComplete="username"
          required
        />
        {checkingUsername && (
          <span className={styles.checkingUsername}>Checking username...</span>
        )}
        {usernameError && (
          <div className={styles.errorMessage}>{usernameError}</div>
        )}
      </div>

      <input
        className={styles.signUpInput}
        id="email"
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div className={styles.passwordContainer}>
        <input
          className={`${styles.signUpInput} ${styles.passwordField}`}
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          className={styles.passwordIcon}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>
      </div>

      <div className={styles.passwordContainer}>
        <input
          className={`${styles.signUpInput} ${styles.passwordField}`}
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <span
          className={styles.passwordIcon}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>
      </div>

      <button type="submit" disabled={loading} className={styles.signUpButton}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
      />
    </form>
  );
};

export default SignUpForm;

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../../services/authService";
import { useAuth } from "../../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "../TopNav.module.css";

const AuthButtons = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully!");
      navigate("/signin");
    } catch (error) {
      toast.error("Error signing out: " + error.message);
    }
  };

  return (
    <button
      className={styles.authBtn}
      onClick={currentUser ? handleSignOut : () => navigate("/signin")}
    >
      {currentUser ? "Sign Out" : "Sign In"}
    </button>
  );
};

export default AuthButtons;
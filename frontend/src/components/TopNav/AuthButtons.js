import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../services/authService";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const AuthButtons = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };
  return (
    <button
      className="auth-btn"
      onClick={currentUser ? handleSignOut : () => navigate("/signin")}
    >
      {currentUser ? "Sign Out" : "Sign In"}
    </button>
  );
};

export default AuthButtons;

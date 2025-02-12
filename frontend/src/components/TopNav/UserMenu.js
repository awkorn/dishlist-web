import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const { currentUser } = useAuth;
  const navigate = useNavigate;

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="user-menu">
      {currentUser ? (
        <>
          <span className="user-initials">
            {currentUser.displayName?.charAt(0).toUpperCase()}
          </span>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </>
      ) : (
        <button className="nav-btn" onClick={() => navigate("/signin")}>
          Sign In
        </button>
      )}
    </div>
  );
};

export default UserMenu;

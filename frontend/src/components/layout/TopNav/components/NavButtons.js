import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider";
import styles from "../TopNav.module.css";

const NavButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, unreadNotifications } = useAuth();

  return (
    <div className="nav-buttons">
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/dishlists" ? styles.active : ""
        }`}
        onClick={() => navigate("/dishlists")}
      >
        DishLists
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/recipe-builder" ? styles.active : ""
        }`}
        onClick={() => navigate("/recipe-builder")}
      >
        Recipe Builder
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/notifications" ? styles.active : ""
        }`}
        onClick={() => navigate("/notifications")}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          Notifications
          {unreadNotifications > 0 && (
            <span className={styles.notificationDot}></span>
          )}
        </span>
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname.startsWith("/profile") ? styles.active : ""
        }`}
        onClick={() => navigate(`/profile/${currentUser?.uid}`)}
      >
        Profile
      </button>
    </div>
  );
};

export default NavButtons;

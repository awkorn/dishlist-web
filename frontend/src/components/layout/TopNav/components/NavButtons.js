import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthProvider";
import { BookOpen, ChefHat, Bell, User } from "lucide-react";
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
        <BookOpen size={16} className={styles.navIcon} />
        DishLists
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/recipe-builder" ? styles.active : ""
        }`}
        onClick={() => navigate("/recipe-builder")}
      >
        <ChefHat size={16} className={styles.navIcon} />
        Recipe Builder
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname === "/notifications" ? styles.active : ""
        }`}
        onClick={() => navigate("/notifications")}
      >
        <div className={styles.iconContainer}>
          <Bell size={16} className={styles.navIcon} />
          {unreadNotifications > 0 && (
            <span className={styles.notificationDot}></span>
          )}
        </div>
        Notifications
      </button>
      <button
        className={`${styles.navBtn} ${
          location.pathname.startsWith("/profile") ? styles.active : ""
        }`}
        onClick={() => navigate(`/profile/${currentUser?.uid}`)}
      >
        <User size={16} className={styles.navIcon} />
        Profile
      </button>
    </div>
  );
};

export default NavButtons;
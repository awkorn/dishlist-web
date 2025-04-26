import React from "react";
import { Link } from "react-router-dom";
import logo from "../../../../assets/images/banner-logo.png";
import styles from "./AuthBanner.module.css";

const AuthBanner = () => {
  return (
    <div className={styles.authBanner}>
      <div className={styles.logoContainer}>
        <Link to="/">
          <img src={logo} alt="Logo" className={styles.logo} />
        </Link>
      </div>
    </div>
  );
};

export default AuthBanner;
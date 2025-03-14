import React from "react";
import logo from "../../../../assets/images/nav-logo.png";
import styles from "../TopNav.module.css";

const Logo = () => {
  return <img src={logo} alt="Nav Logo" className={styles.navbarLogo} />;
};

export default Logo;
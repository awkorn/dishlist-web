import React from "react";
import logo from "../../../assets/images/logo-color.png";
import styles from "./PageHeader.module.css";

/* Page header used on sign-in and sign-up page */
const PageHeader = ({ title }) => {
  return (
    <>
      <header className={styles.logoBanner}>
        <img src={logo} alt="DishList Logo" className={styles.logo} />
      </header>

      <header className={styles.pageHeader}>
        <h1>{title}</h1>
      </header>
    </>
  );
};

export default PageHeader;

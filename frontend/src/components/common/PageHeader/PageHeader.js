import React from "react";
import styles from "./PageHeader.module.css";

/* Page header used on sign-in and sign-up page */
const PageHeader = ({ title }) => {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1>{title}</h1>
      </header>
    </>
  );
};

export default PageHeader;

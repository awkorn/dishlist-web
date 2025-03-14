import React from "react";
import styles from "./PageTitle.module.css";

const PageTitle = ({ title }) => {
  return <h1 className={styles.pageTitle}>{title}</h1>;
};

export default PageTitle;
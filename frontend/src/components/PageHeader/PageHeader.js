import React from "react";
import logo from "../../assets/images/logo-color.png";
import "./PageHeader.css";

const PageHeader = ({ title }) => {
  return (
    <>
      <header className="logo-banner">
        <img src={logo} alt="DishList Logo" className="logo" />
      </header>

      <header className="page-header">
        <h1>{title}</h1>
      </header>
    </>
  );
};

export default PageHeader;

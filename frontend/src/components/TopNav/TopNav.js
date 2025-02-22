import React from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavButtons from "./NavButtons";
import AuthButtons from "./AuthButtons";
import "./TopNav.css";

const TopNav = ({ pageType, items, onSearch }) => {
  return (
    <div>
      <div className="top-nav">
        <Logo />
        <SearchBar pageType={pageType} items={items} onSearch={onSearch} />
        <NavButtons />
        <AuthButtons />
      </div>
    </div>
  );
};

export default TopNav;

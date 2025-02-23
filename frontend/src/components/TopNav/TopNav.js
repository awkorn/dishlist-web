import React, { useState } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavButtons from "./NavButtons";
import AuthButtons from "./AuthButtons";
import "./TopNav.css";

const TopNav = ({ pageType, items, onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="top-nav">
      <Logo />
      <SearchBar pageType={pageType} items={items} onSearch={onSearch} />

      {/*hamburger menu icon (visible on small screens via CSS) */}
      <div className="mobile-menu" onClick={toggleMenu}>
        ☰
      </div>

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className={`nav-container ${menuOpen ? "open" : ""}`}>
        <NavButtons />
        <AuthButtons />
      </div>
    </div>
  );
};

export default TopNav;

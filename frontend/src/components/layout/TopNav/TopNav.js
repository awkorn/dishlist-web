import React, { useState } from "react";
import Logo from "./components/Logo";
import SearchBar from "./components/SearchBar";
import NavButtons from "./components/NavButtons";
import AuthButtons from "./components/AuthButtons";
import styles from "./TopNav.module.css";

const TopNav = ({ pageType, items, onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.topNav}>
      <Logo />
      <SearchBar pageType={pageType} items={items} onSearch={onSearch} />

      {/*hamburger menu icon (visible on small screens via CSS) */}
      <div className={styles.mobileMenu} onClick={toggleMenu}>
        ☰
      </div>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      <div className={`${styles.navContainer} ${menuOpen ? styles.navOpen : ""}`}>
        <NavButtons />
        <AuthButtons />
      </div>
    </div>
  );
};

export default TopNav;
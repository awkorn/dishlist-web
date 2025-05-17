'use client';

import React, { useState } from 'react';
import Logo from './TopNav/components/Logo';
import SearchBar from './TopNav/components/SearchBar';
import NavButtons from './TopNav/components/NavButtons';
import AuthButtons from './TopNav/components/AuthButtons';
import styles from './TopNav.module.css';

interface TopNavProps {
  pageType?: string;
  items?: any[];
  onSearch?: (value: string) => void;
}

const TopNav = ({ pageType, items, onSearch }: TopNavProps) => {
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
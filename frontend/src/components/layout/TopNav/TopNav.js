import { useState } from "react";
import Logo from "./components/Logo";
import SearchBar from "./components/SearchBar";
import NavButtons from "./components/NavButtons";
import AuthButtons from "./components/AuthButtons";
import styles from "./TopNav.module.css";
import { Menu } from "lucide-react";

const TopNav = ({ pageType, items, onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  // Check if we should display a search bar for this page type
  const showSearch =
    pageType === "dishlists" ||
    pageType === "recipes" ||
    pageType === "profile";

  return (
    <div className={styles.topNav}>
      <Logo />

      {/* If search is shown, render the SearchBar component */}
      {showSearch ? (
        <SearchBar pageType={pageType} items={items} onSearch={onSearch} />
      ) : (
        /* If no search, add a spacer div to push the menu to the right */
        <div className={styles.spacer}></div>
      )}

      {/* Hamburger menu icon (visible on small screens via CSS) */}
      <div className={styles.mobileMenu} onClick={toggleMenu}>
        <Menu size={28}/>
      </div>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      <div
        className={`${styles.navContainer} ${menuOpen ? styles.navOpen : ""}`}
      >
        <NavButtons />
        <AuthButtons />
      </div>
    </div>
  );
};

export default TopNav;

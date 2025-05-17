'use client';

import React from 'react';
import Image from 'next/image';
import styles from '../TopNav.module.css';

const Logo = () => {
  return (
    <Image 
      src="/images/nav-logo.png" 
      alt="Nav Logo" 
      className={styles.navbarLogo} 
      width={50}
      height={50}
    />
  );
};

export default Logo;
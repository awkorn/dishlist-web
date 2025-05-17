'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { BookOpen, ChefHat, Bell, User } from 'lucide-react';
import styles from '../TopNav.module.css';

const NavButtons = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, unreadNotifications } = useAuth();

  return (
    <div className="nav-buttons">
      <button
        className={`${styles.navBtn} ${
          pathname === '/dishlists' ? styles.active : ''
        }`}
        onClick={() => router.push('/dishlists')}
      >
        <BookOpen size={16} className={styles.navIcon} />
        DishLists
      </button>
      <button
        className={`${styles.navBtn} ${
          pathname === '/recipe-builder' ? styles.active : ''
        }`}
        onClick={() => router.push('/recipe-builder')}
      >
        <ChefHat size={16} className={styles.navIcon} />
        Recipe Builder
      </button>
      <button
        className={`${styles.navBtn} ${
          pathname === '/notifications' ? styles.active : ''
        }`}
        onClick={() => router.push('/notifications')}
      >
        <div className={styles.iconContainer}>
          <Bell size={16} className={styles.navIcon} />
          {unreadNotifications > 0 && (
            <span className={styles.notificationDot}></span>
          )}
        </div>
        Notifications
      </button>
      <button
        className={`${styles.navBtn} ${
          pathname.startsWith('/profile') ? styles.active : ''
        }`}
        onClick={() => {
          if (currentUser?.uid) {
            router.push(`/profile/${currentUser.uid}`);
          }
        }}
      >
        <User size={16} className={styles.navIcon} />
        Profile
      </button>
    </div>
  );
};

export default NavButtons;
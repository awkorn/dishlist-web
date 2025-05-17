'use client';

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/authService';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import styles from '../TopNav.module.css';

const AuthButtons = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
      router.push('/signin');
    } catch (error: any) {
      toast.error('Error signing out: ' + error.message);
    }
  };

  return (
    <button
      className={styles.authBtn}
      onClick={currentUser ? handleSignOut : () => router.push('/signin')}
    >
      {currentUser ? 'Sign Out' : 'Sign In'}
    </button>
  );
};

export default AuthButtons;
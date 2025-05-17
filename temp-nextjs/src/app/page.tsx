'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Redirect based on auth status
    if (currentUser) {
      router.push('/dishlists');
    } else {
      router.push('/signin');
    }
  }, [currentUser, router]);

  // Return a loading state or null while redirecting
  return <div>Loading...</div>;
}
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // Allow unrestricted access on localhost
  const isLocalhost = 
    typeof window !== 'undefined' && 
    window.location.hostname === 'localhost';

  if (!currentUser && !isLocalhost) {
    router.push('/signin');
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
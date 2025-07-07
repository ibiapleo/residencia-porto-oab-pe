import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, verifyToken } from '@/services/authService';

export const useAuth = () => {
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || !verifyToken()) {
      router.push('/login');
    }
  }, [user, router]);

  return user;
};
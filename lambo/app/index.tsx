import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    // Fake auth check (replace with real logic)
    const isLoggedIn = false;
    router.replace(isLoggedIn ? '/(tabs)/dashboard' : '/login');
  }, []);
  return null;
} 
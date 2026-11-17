import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';

import { useAuthStore } from '@/src/store/authStore';
import { useCartStore } from '@/src/store/cartStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initialize: initAuth, isAuthenticated } = useAuthStore();
  const { initialize: initCart } = useCartStore();

  useEffect(() => {
    initAuth();
    initCart();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="medicine/[id]" options={{ headerShown: true, title: 'Medicine Details' }} />
            <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
            <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: true, title: 'Order Tracking' }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}

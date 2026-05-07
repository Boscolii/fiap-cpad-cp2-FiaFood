import { useEffect } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CarrinhoProvider, useCarrinho } from '../context/carrinhoContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#ba0a4e',
  black: '#000000',
  white: '#ffffff',
};

function TabsNavegacao() {
  const { carrinho } = useCarrinho();
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const telaAtual = segments[0];
  const telaAuth = telaAtual === 'login' || telaAtual === 'cadastro';

  useEffect(() => {
    if (carregando) return;

    if (!usuario && !telaAuth) {
      router.replace('/login');
    }

    if (usuario && telaAuth) {
      router.replace('/');
    }
  }, [usuario, carregando, telaAuth]);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarStyle: { backgroundColor: COLORS.black },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="carrinho"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={color} />
              {carrinho.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{carrinho.length}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cupons"
        options={{
          title: 'Cupons',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Nova aba - Histórico de Pedidos */}
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <TabsNavegacao />
      </CarrinhoProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.black },
  badge: { position: 'absolute', right: -8, top: -5, backgroundColor: COLORS.primary, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
});
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarrinho } from '../context/carrinhoContext';
import { useRouter } from 'expo-router';

export default function Carrinho() {
  const {
    carrinho,
    removerItem,
    cupomAplicado,
    total,
    finalizarPedido,
    carregandoCarrinho,
    pedidos,
  } = useCarrinho();
  const [mensagem, setMensagem] = useState('');
  const [pedidoId, setPedidoId] = useState('');

  const COLORS = { 
    primary: '#ba0a4e', 
    black: '#000000', 
    surface: '#1a1a1a', 
    white: '#ffffff', 
    grayBg: '#292929', 
    textLight: '#aaaaaa',
    success: '#4caf50',
  };

  const router = useRouter();

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => {
        setMensagem('');
        router.push('/historico');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  function enviarPedido() {
    const pedido = finalizarPedido();
    setPedidoId(pedido.id);
    setMensagem(`Pedido #${pedido.id} enviado para a cantina.`);
  }

  if (carregandoCarrinho) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (mensagem) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        <Text style={styles.successTitle}>Pedido enviado!</Text>
        <Text style={styles.successId}>#{pedidoId}</Text>
        <Text style={styles.successSubtitle}>
          Seu pedido foi salvo no histórico.{'\n'}Redirecionando...
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => {
            setMensagem('');
            router.push('/historico');
          }}
        >
          <Ionicons name="receipt-outline" size={18} color="#fff" />
          <Text style={styles.successButtonText}>Ver Histórico agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Seu Pedido</Text>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {carrinho.length === 0 ? (
          <View style={styles.emptyArea}>
            <Ionicons name="cart-outline" size={42} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Seu carrinho esta vazio.</Text>
            <Text style={styles.emptyText}>Escolha algum produto no menu para montar seu pedido.</Text>

            {pedidos.length > 0 ? (
              <TouchableOpacity
                style={styles.verHistoricoBtn}
                onPress={() => router.push('/historico')}
              >
                <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
                <Text style={styles.verHistoricoText}>
                  Ver histórico ({pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'})
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          carrinho.map((item, index) => (
            <View key={index} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardPrice}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
              </View>
              <TouchableOpacity onPress={() => removerItem(index)}>
                <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {carrinho.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity
            style={styles.cupomButton}
            onPress={() => router.push('/cupons')}>
            <Ionicons name="ticket" size={20} color="#fff" />
            <Text style={styles.cupomButtonText}>Ver Cupons</Text>
          </TouchableOpacity>

          {cupomAplicado ? (
            <Text style={styles.cupomAtivoText}>
              Cupom {cupomAplicado.codigo} aplicado!
            </Text>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={enviarPedido}
          >
            <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#000000', paddingTop: 40 },
  loadingContainer:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  sectionTitle:         { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginHorizontal: 20, marginTop: 25, marginBottom: 15 },
  listContainer:        { paddingHorizontal: 20, paddingBottom: 180 },
  cardItem:             { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#292929', borderRadius: 12, padding: 15 },
  cardInfo:             { flex: 1 },
  cardTitle:            { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  cardPrice:            { fontSize: 16, fontWeight: 'bold', color: '#ba0a4e' },

  // Carrinho vazio
  emptyArea:            { alignItems: 'center', marginTop: 45 },
  emptyTitle:           { color: '#ffffff', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  emptyText:            { color: '#aaaaaa', fontSize: 14, textAlign: 'center', marginTop: 6 },
  verHistoricoBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, borderColor: '#ba0a4e' },
  verHistoricoText:     { color: '#ba0a4e', fontSize: 14, fontWeight: 'bold' },

  // Checkout
  checkoutContainer:    { backgroundColor: '#1a1a1a', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'absolute', bottom: 0, width: '100%' },
  totalRow:             { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalText:            { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  totalValue:           { color: '#ba0a4e', fontSize: 22, fontWeight: 'bold' },
  checkoutButton:       { backgroundColor: '#ba0a4e', padding: 15, borderRadius: 10, alignItems: 'center' },
  checkoutButtonText:   { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  cupomAtivoText:       { color: '#4caf50', fontSize: 14, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  cupomButton:          { backgroundColor: '#444', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  cupomButtonText:      { color: '#fff', marginLeft: 8, fontWeight: 'bold' },

  // Tela de sucesso
  successContainer:     { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 32 },
  successTitle:         { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginTop: 20, marginBottom: 6 },
  successId:            { fontSize: 14, color: '#aaaaaa', marginBottom: 12, letterSpacing: 1 },
  successSubtitle:      { fontSize: 14, color: '#aaaaaa', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  successButton:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ba0a4e', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  successButtonText:    { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
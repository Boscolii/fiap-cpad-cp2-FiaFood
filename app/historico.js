import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { CarrinhoContext } from '../context/carrinhoContext';

export default function Historico() {
  const { pedidos } = useContext(CarrinhoContext);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);

  const formatarData = (isoString) => {
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'entregue':
        return styles.statusEntregue;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return styles.statusConcluido;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Concluído';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setPedidoSelecionado(item)}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.pedidoId}>Pedido #{item.id?.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={styles.dataTexto}>{formatarData(item.data)}</Text>

      <View style={styles.resumoItens}>
        <Text style={styles.resumoTexto} numberOfLines={1}>
          {item.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        {item.cupomAplicado && (
          <Text style={styles.cupomTexto}>🎟 {item.cupomAplicado}</Text>
        )}
        <Text style={styles.totalTexto}>
          Total: R$ {Number(item.total).toFixed(2).replace('.', ',')}
        </Text>
      </View>

      <Text style={styles.verDetalhes}>Ver detalhes →</Text>
    </TouchableOpacity>
  );

  const ListaVazia = () => (
    <View style={styles.listaVazia}>
      <Text style={styles.listaVaziaIcon}>🧾</Text>
      <Text style={styles.listaVaziaTitulo}>Nenhum pedido ainda</Text>
      <Text style={styles.listaVaziaSubtitulo}>
        Seus pedidos finalizados aparecerão aqui.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico de Pedidos</Text>
        <Text style={styles.subtitulo}>
          {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} realizados
        </Text>
      </View>

      <FlatList
        data={[...pedidos].reverse()} // mais recentes primeiro
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<ListaVazia />}
        contentContainerStyle={
          pedidos.length === 0 ? styles.listaVaziaContainer : styles.lista
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de detalhes do pedido */}
      <Modal
        visible={!!pedidoSelecionado}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPedidoSelecionado(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                Pedido #{pedidoSelecionado?.id?.slice(-6).toUpperCase()}
              </Text>
              <TouchableOpacity onPress={() => setPedidoSelecionado(null)}>
                <Text style={styles.fecharBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalData}>
                📅 {pedidoSelecionado && formatarData(pedidoSelecionado.data)}
              </Text>

              {pedidoSelecionado?.localEntrega && (
                <Text style={styles.modalLocal}>
                  📍 {pedidoSelecionado.localEntrega}
                </Text>
              )}

              <View style={[styles.statusBadge, getStatusStyle(pedidoSelecionado?.status), styles.statusModal]}>
                <Text style={styles.statusText}>
                  {getStatusLabel(pedidoSelecionado?.status)}
                </Text>
              </View>

              <Text style={styles.modalSecaoTitulo}>Itens do pedido</Text>

              {pedidoSelecionado?.itens?.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  {item.imagem && (
                    <Image source={item.imagem} style={styles.itemImagem} />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNome}>{item.nome}</Text>
                    <Text style={styles.itemQtd}>Qtd: {item.quantidade}</Text>
                  </View>
                  <Text style={styles.itemPreco}>
                    R${' '}
                    {(Number(item.preco) * item.quantidade)
                      .toFixed(2)
                      .replace('.', ',')}
                  </Text>
                </View>
              ))}

              <View style={styles.divisor} />

              <View style={styles.resumoFinanceiro}>
                {pedidoSelecionado?.subtotal !== undefined && (
                  <View style={styles.resumoLinha}>
                    <Text style={styles.resumoLabel}>Subtotal</Text>
                    <Text style={styles.resumoValor}>
                      R${' '}
                      {Number(pedidoSelecionado.subtotal)
                        .toFixed(2)
                        .replace('.', ',')}
                    </Text>
                  </View>
                )}

                {pedidoSelecionado?.desconto !== undefined &&
                  pedidoSelecionado.desconto > 0 && (
                    <View style={styles.resumoLinha}>
                      <Text style={[styles.resumoLabel, styles.descontoLabel]}>
                        Desconto ({pedidoSelecionado.cupomAplicado})
                      </Text>
                      <Text style={[styles.resumoValor, styles.descontoValor]}>
                        - R${' '}
                        {Number(pedidoSelecionado.desconto)
                          .toFixed(2)
                          .replace('.', ',')}
                      </Text>
                    </View>
                  )}

                <View style={[styles.resumoLinha, styles.totalLinha]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValor}>
                    R${' '}
                    {Number(pedidoSelecionado?.total)
                      .toFixed(2)
                      .replace('.', ',')}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const VERMELHO = '#E3000F';
const CINZA_BG = '#F5F5F5';
const CINZA_TEXTO = '#777';
const BRANCO = '#fff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CINZA_BG,
  },
  header: {
    backgroundColor: VERMELHO,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRANCO,
  },
  subtitulo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  lista: {
    padding: 16,
    paddingBottom: 32,
  },
  listaVaziaContainer: {
    flex: 1,
  },
  listaVazia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  listaVaziaIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  listaVaziaTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listaVaziaSubtitulo: {
    fontSize: 14,
    color: CINZA_TEXTO,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: BRANCO,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pedidoId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusConcluido: {
    backgroundColor: '#e8f5e9',
  },
  statusEntregue: {
    backgroundColor: '#e3f2fd',
  },
  statusCancelado: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  dataTexto: {
    fontSize: 12,
    color: CINZA_TEXTO,
    marginBottom: 8,
  },
  resumoItens: {
    marginBottom: 10,
  },
  resumoTexto: {
    fontSize: 13,
    color: '#444',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cupomTexto: {
    fontSize: 12,
    color: CINZA_TEXTO,
    fontStyle: 'italic',
  },
  totalTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: VERMELHO,
  },
  verDetalhes: {
    fontSize: 12,
    color: VERMELHO,
    textAlign: 'right',
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: BRANCO,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  fecharBtn: {
    fontSize: 20,
    color: CINZA_TEXTO,
    padding: 4,
  },
  modalData: {
    fontSize: 13,
    color: CINZA_TEXTO,
    marginBottom: 4,
  },
  modalLocal: {
    fontSize: 13,
    color: CINZA_TEXTO,
    marginBottom: 10,
  },
  statusModal: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modalSecaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImagem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  itemQtd: {
    fontSize: 12,
    color: CINZA_TEXTO,
  },
  itemPreco: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divisor: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },
  resumoFinanceiro: {
    gap: 8,
    paddingBottom: 20,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumoLabel: {
    fontSize: 14,
    color: CINZA_TEXTO,
  },
  resumoValor: {
    fontSize: 14,
    color: '#333',
  },
  descontoLabel: {
    color: '#2e7d32',
  },
  descontoValor: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  totalLinha: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: VERMELHO,
  },
});
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const CarrinhoContext = createContext();

// Gera um ID único simples para cada pedido
const gerarId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export function CarrinhoProvider({ children }) {
  const { usuario } = useContext(AuthContext);

  const [itens, setItens] = useState([]);
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [cuponsResgatados, setCuponsResgatados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [localEntrega, setLocalEntrega] = useState('');

  // ─── Chaves de storage por usuário ────────────────────────────────────────
  const chaveCarrinho = usuario
    ? `@fiafood:carrinho:${usuario.email}`
    : '@fiafood:carrinho';

  const chaveCupom = usuario
    ? `@fiafood:cupom:${usuario.email}`
    : '@fiafood:cupom';

  const chaveCupons = usuario
    ? `@fiafood:cupons:${usuario.email}`
    : '@fiafood:cupons';

  const chavePedidos = usuario
    ? `@fiafood:pedidos:${usuario.email}`
    : '@fiafood:pedidos';

  // ─── Carrega dados ao montar ou trocar usuário ─────────────────────────────
  useEffect(() => {
    carregarDados();
  }, [usuario]);

  const carregarDados = async () => {
    try {
      const [carrinhoSalvo, cupomSalvo, cuponsSalvos, pedidosSalvos] =
        await Promise.all([
          AsyncStorage.getItem(chaveCarrinho),
          AsyncStorage.getItem(chaveCupom),
          AsyncStorage.getItem(chaveCupons),
          AsyncStorage.getItem(chavePedidos),
        ]);

      if (carrinhoSalvo) setItens(JSON.parse(carrinhoSalvo));
      if (cupomSalvo) setCupomAplicado(JSON.parse(cupomSalvo));
      if (cuponsSalvos) setCuponsResgatados(JSON.parse(cuponsSalvos));
      if (pedidosSalvos) setPedidos(JSON.parse(pedidosSalvos));
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  };

  // ─── Persistência automática do carrinho ──────────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem(chaveCarrinho, JSON.stringify(itens)).catch(
      console.error
    );
  }, [itens]);

  useEffect(() => {
    AsyncStorage.setItem(chaveCupom, JSON.stringify(cupomAplicado)).catch(
      console.error
    );
  }, [cupomAplicado]);

  useEffect(() => {
    AsyncStorage.setItem(chaveCupons, JSON.stringify(cuponsResgatados)).catch(
      console.error
    );
  }, [cuponsResgatados]);

  useEffect(() => {
    AsyncStorage.setItem(chavePedidos, JSON.stringify(pedidos)).catch(
      console.error
    );
  }, [pedidos]);

  // ─── Cálculo do total ─────────────────────────────────────────────────────
  const subtotal = itens.reduce(
    (acc, item) => acc + Number(item.preco) * item.quantidade,
    0
  );

  const desconto = cupomAplicado
    ? subtotal * (cupomAplicado.desconto / 100)
    : 0;

  const total = subtotal - desconto;

  // ─── Ações do carrinho ────────────────────────────────────────────────────
  const adicionarItem = (produto) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });
  };

  const removerItem = (produtoId) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.id === produtoId);
      if (existe && existe.quantidade > 1) {
        return prev.map((i) =>
          i.id === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== produtoId);
    });
  };

  const limparCarrinho = () => {
    setItens([]);
    setCupomAplicado(null);
  };

  // ─── Cupons ───────────────────────────────────────────────────────────────
  const aplicarCupom = (cupom) => {
    setCupomAplicado(cupom);
    if (!cuponsResgatados.includes(cupom.codigo)) {
      setCuponsResgatados((prev) => [...prev, cupom.codigo]);
    }
  };

  const removerCupom = () => setCupomAplicado(null);

  // ─── Finalizar pedido (salva no histórico do usuário) ────────────────────
  const finalizarPedido = () => {
    if (itens.length === 0) return false;

    const novoPedido = {
      id: gerarId(),
      data: new Date().toISOString(),
      itens: itens.map((i) => ({ ...i })),
      subtotal,
      desconto,
      total,
      cupomAplicado: cupomAplicado?.codigo || null,
      localEntrega,
      status: 'concluido',
      usuario: usuario?.email || null,
    };

    setPedidos((prev) => [...prev, novoPedido]);
    limparCarrinho();
    return true;
  };

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        cupomAplicado,
        cuponsResgatados,
        pedidos,
        localEntrega,
        subtotal,
        desconto,
        total,
        setLocalEntrega,
        adicionarItem,
        removerItem,
        limparCarrinho,
        aplicarCupom,
        removerCupom,
        finalizarPedido,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}
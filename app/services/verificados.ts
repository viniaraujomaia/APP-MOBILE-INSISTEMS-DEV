// app/services/verificados.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ativo, ItemVerificado, STORAGE_KEYS } from "../types";

/**
 * Adiciona um item à lista de verificados
 */
export const adicionarItemVerificado = async (
  ativo: Ativo,
  ambiente: string,
  tipoVerificacao: "camera" | "manual",
  codigoVerificado: string,
  observacoes?: string,
): Promise<boolean> => {
  try {
    // 1. Carrega a lista atual de verificados
    const listaVerificadosJson = await AsyncStorage.getItem(
      STORAGE_KEYS.LISTA_VERIFICADOS,
    );
    const listaVerificados: ItemVerificado[] = listaVerificadosJson
      ? JSON.parse(listaVerificadosJson)
      : [];

    // 2. Verifica se o item já foi verificado
    const itemExistente = listaVerificados.find(
      (item) => item.id === ativo.id && item.ambiente === ambiente,
    );

    if (itemExistente) {
      console.log(`⚠️ Item ${ativo.id} já foi verificado neste ambiente`);
      return false;
    }

    // 3. Cria o novo item verificado
    const novoItem: ItemVerificado = {
      id: ativo.id,
      nome: ativo.nome,
      ambiente,
      dataHora: new Date().toISOString(),
      estado: "verificado",
      tipoVerificacao,
      codigoVerificado,
      observacoes,
    };

    // 4. Adiciona à lista
    listaVerificados.push(novoItem);

    // 5. Salva no AsyncStorage
    await AsyncStorage.setItem(
      STORAGE_KEYS.LISTA_VERIFICADOS,
      JSON.stringify(listaVerificados),
    );

    console.log(
      `✅ Item ${ativo.id} adicionado aos verificados no ambiente ${ambiente}`,
    );

    // 6. Também salva no ambiente específico (opcional)
    const chaveAmbiente = STORAGE_KEYS.VERIFICADOS_AMBIENTE(ambiente);
    await AsyncStorage.setItem(chaveAmbiente, JSON.stringify(novoItem));

    return true;
  } catch (error) {
    console.error("❌ Erro ao adicionar item verificado:", error);
    return false;
  }
};

/**
 * Obtém todos os itens verificados
 */
export const obterItensVerificados = async (): Promise<ItemVerificado[]> => {
  try {
    const listaVerificadosJson = await AsyncStorage.getItem(
      STORAGE_KEYS.LISTA_VERIFICADOS,
    );
    return listaVerificadosJson ? JSON.parse(listaVerificadosJson) : [];
  } catch (error) {
    console.error("❌ Erro ao obter itens verificados:", error);
    return [];
  }
};

/**
 * Obtém itens verificados por ambiente
 */
export const obterItensVerificadosPorAmbiente = async (
  ambiente: string,
): Promise<ItemVerificado[]> => {
  try {
    const todosVerificados = await obterItensVerificados();
    return todosVerificados.filter((item) => item.ambiente === ambiente);
  } catch (error) {
    console.error("❌ Erro ao obter itens por ambiente:", error);
    return [];
  }
};

/**
 * Verifica se um item já foi verificado
 */
export const verificarSeItemFoiVerificado = async (
  id: string,
  ambiente: string,
): Promise<boolean> => {
  try {
    const itensVerificados = await obterItensVerificados();
    return itensVerificados.some(
      (item) => item.id === id && item.ambiente === ambiente,
    );
  } catch (error) {
    console.error("❌ Erro ao verificar item:", error);
    return false;
  }
};

/**
 * Limpa todos os itens verificados (para debug/reset)
 */
export const limparItensVerificados = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LISTA_VERIFICADOS);
    console.log("🧹 Todos os itens verificados foram removidos");
  } catch (error) {
    console.error("❌ Erro ao limpar itens verificados:", error);
  }
};

// app/services/verificados.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const LISTA_VERIFICADOS_KEY = "@insistems:lista_verificados"; // ← CORREÇÃO AQUI

export interface ItemVerificado {
  id: string;
  nome: string;
  ambiente: string;
  metodo: "camera" | "manual";
  codigoLido: string;
  dataHora: string;
  observacoes?: string;
}

export const adicionarItemVerificado = async (
  item: { id: string; nome: string },
  ambiente: string,
  metodo: "camera" | "manual",
  codigoLido: string,
  observacoes?: string,
): Promise<boolean> => {
  try {
    // Carrega lista atual
    const listaAtualJson = await AsyncStorage.getItem(LISTA_VERIFICADOS_KEY);
    const listaAtual: ItemVerificado[] = listaAtualJson
      ? JSON.parse(listaAtualJson)
      : [];

    // Verifica se o item já existe neste ambiente
    const jaExiste = listaAtual.some(
      (verificado) =>
        verificado.id === item.id && verificado.ambiente === ambiente,
    );

    if (jaExiste) {
      return false; // Já existe neste ambiente
    }

    // Adiciona novo item
    const novoItem: ItemVerificado = {
      id: item.id,
      nome: item.nome,
      ambiente,
      metodo,
      codigoLido,
      dataHora: new Date().toISOString(),
      observacoes,
    };

    listaAtual.push(novoItem);

    // Salva atualizado
    await AsyncStorage.setItem(
      LISTA_VERIFICADOS_KEY,
      JSON.stringify(listaAtual),
    );

    return true;
  } catch (error) {
    console.error("Erro ao adicionar item verificado:", error);
    return false;
  }
};

export const obterItensVerificados = async (): Promise<ItemVerificado[]> => {
  try {
    const listaJson = await AsyncStorage.getItem(LISTA_VERIFICADOS_KEY);
    return listaJson ? JSON.parse(listaJson) : [];
  } catch (error) {
    console.error("Erro ao obter itens verificados:", error);
    return [];
  }
};

export const limparItensVerificados = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LISTA_VERIFICADOS_KEY);
  } catch (error) {
    console.error("Erro ao limpar itens verificados:", error);
  }
};

// services/storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Ativo {
  id: string;
  nome: string;
}

const STORAGE_KEYS = {
  LISTA_ATIVOS: "@insistems:lista_ativos",
  FILE_NAME: "@insistems:file_name",
  IMPORT_DATE: "@insistems:import_date",
};

// Salvar a lista de ativos
export const salvarLista = async (
  ativos: Ativo[],
  fileName: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.LISTA_ATIVOS,
      JSON.stringify(ativos),
    );
    await AsyncStorage.setItem(STORAGE_KEYS.FILE_NAME, fileName);
    await AsyncStorage.setItem(
      STORAGE_KEYS.IMPORT_DATE,
      new Date().toISOString(),
    );
    console.log("Lista salva com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar lista:", error);
    throw error;
  }
};

// Carregar a lista de ativos
export const carregarLista = async (): Promise<{
  ativos: Ativo[];
  fileName: string;
  importDate: string;
} | null> => {
  try {
    const ativosJson = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_ATIVOS);
    const fileName = await AsyncStorage.getItem(STORAGE_KEYS.FILE_NAME);
    const importDate = await AsyncStorage.getItem(STORAGE_KEYS.IMPORT_DATE);

    if (ativosJson && fileName) {
      return {
        ativos: JSON.parse(ativosJson),
        fileName,
        importDate: importDate || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar lista:", error);
    return null;
  }
};

// Verificar se existe lista salva
export const existeListaSalva = async (): Promise<boolean> => {
  try {
    const ativos = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_ATIVOS);
    return ativos !== null;
  } catch (error) {
    console.error("Erro ao verificar lista:", error);
    return false;
  }
};

// Limpar a lista salva
export const limparLista = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LISTA_ATIVOS,
      STORAGE_KEYS.FILE_NAME,
      STORAGE_KEYS.IMPORT_DATE,
    ]);
    console.log("Lista removida com sucesso!");
  } catch (error) {
    console.error("Erro ao limpar lista:", error);
    throw error;
  }
};

// Obter informações da lista sem carregar todos os dados
export const getListaInfo = async (): Promise<{
  total: number;
  fileName: string;
  importDate: string;
} | null> => {
  try {
    const ativosJson = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_ATIVOS);
    const fileName = await AsyncStorage.getItem(STORAGE_KEYS.FILE_NAME);
    const importDate = await AsyncStorage.getItem(STORAGE_KEYS.IMPORT_DATE);

    if (ativosJson && fileName) {
      const ativos = JSON.parse(ativosJson);
      return {
        total: ativos.length,
        fileName,
        importDate: importDate || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter informações da lista:", error);
    return null;
  }
};

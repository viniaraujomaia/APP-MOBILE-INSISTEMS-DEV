// app/types/index.ts
export interface Ativo {
  id: string;
  nome: string;
  ambiente?: string; // Ambiente específico (opcional)
}

export interface ItemVerificado {
  id: string;
  nome: string;
  ambiente: string;
  dataHora: string;
  estado: "verificado" | "pendente" | "ausente";
  tipoVerificacao: "camera" | "manual";
  codigoVerificado: string;
  observacoes?: string;
}

// Chaves do AsyncStorage
export const STORAGE_KEYS = {
  LISTA_ATIVOS: "@insistems:lista_ativos",
  LISTA_VERIFICADOS: "@insistems:lista_verificados",
  VERIFICADOS_AMBIENTE: (ambiente: string) =>
    `@insistems:verificados_${ambiente}`,
};

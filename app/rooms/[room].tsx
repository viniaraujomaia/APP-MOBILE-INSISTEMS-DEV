// app/[rooms].tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Interface para o ativo
interface Ativo {
  id: string;
  nome: string;
  ambiente?: string;
  dataVerificacao?: string;
  tipoVerificacao?: string;
}

// Constantes para o AsyncStorage
const LISTA_ATIVOS_KEY = "@insistems:lista_ativos";
const LISTA_VERIFICADOS_KEY = "@insistems:lista_verificados";

export default function RoomPage() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const [items, setItems] = useState<string[][]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState("");
  const [loading, setLoading] = useState(false);
  const [listaAtivos, setListaAtivos] = useState<Ativo[]>([]);
  const [totalAmbiente, setTotalAmbiente] = useState(0);
  const [verificadosAmbiente, setVerificadosAmbiente] = useState(0);

  // Carrega dados quando a tela abre
  useEffect(() => {
    carregarDados();
  }, []);

  // Função para carregar todos os dados
  const carregarDados = async () => {
    try {
      // 1. Carrega lista de ativos disponíveis
      await carregarListaAtivos();

      // 2. Carrega itens já verificados
      await carregarItensVerificados();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Carrega a lista de ativos do AsyncStorage
  const carregarListaAtivos = async () => {
    try {
      const listaJson = await AsyncStorage.getItem(LISTA_ATIVOS_KEY);
      if (listaJson) {
        const lista = JSON.parse(listaJson);
        setListaAtivos(lista);

        // Calcula total de ativos no ambiente
        const ativosNoAmbiente = lista.filter((ativo: Ativo) => {
          if (room === "Geral") return true;
          return ativo.ambiente === room;
        });
        setTotalAmbiente(ativosNoAmbiente.length);
      }
    } catch (error) {
      console.error("Erro ao carregar lista de ativos:", error);
    }
  };

  // Carrega itens já verificados para mostrar na lista
  const carregarItensVerificados = async () => {
    try {
      const verificadosJson = await AsyncStorage.getItem(LISTA_VERIFICADOS_KEY);

      if (verificadosJson) {
        const todosVerificados: Ativo[] = JSON.parse(verificadosJson);

        // Filtra apenas os itens deste ambiente
        const itensDoAmbiente = todosVerificados.filter((item: Ativo) => {
          if (room === "Geral") return true;
          return item.ambiente === room;
        });

        // Converte para o formato que sua lista espera
        const itensParaMostrar = itensDoAmbiente.map((item) => [
          item.id, // [0] tombamento
          item.nome, // [1] nome
          item.ambiente || "", // [2] ambiente
          item.dataVerificacao || "", // [3] data
          item.tipoVerificacao || "", // [4] tipo
        ]);

        setItems(itensParaMostrar);
        setVerificadosAmbiente(itensDoAmbiente.length);
      } else {
        setItems([]);
        setVerificadosAmbiente(0);
      }
    } catch (error) {
      console.error("Erro ao carregar itens verificados:", error);
      setItems([]);
    }
  };

  // Calcula a porcentagem do progresso
  const calcularPorcentagem = () => {
    if (totalAmbiente === 0) return 0;
    const porcentagem = (verificadosAmbiente / totalAmbiente) * 100;
    return Math.min(porcentagem, 100);
  };

  // Função para verificar se o código está na lista
  const verificarCodigoNaLista = (
    codigo: string,
  ): { encontrado: boolean; ativo?: Ativo } => {
    if (listaAtivos.length === 0) {
      return { encontrado: false };
    }

    const codigoLimpo = codigo.trim();

    // Procura na lista de ativos
    const ativoEncontrado = listaAtivos.find((ativo) => {
      const idAtivo = ativo.id;
      return (
        idAtivo === codigoLimpo ||
        idAtivo.includes(codigoLimpo) ||
        codigoLimpo.includes(idAtivo.split("-")[0])
      );
    });

    if (ativoEncontrado) {
      return { encontrado: true, ativo: ativoEncontrado };
    } else {
      return { encontrado: false };
    }
  };

  // Função para lidar com a confirmação do código
  const handleConfirmarCodigo = async () => {
    if (!codigoDigitado.trim()) {
      Alert.alert("Aviso", "Por favor, digite um código");
      return;
    }

    setLoading(true);

    // Verifica se o código está na lista
    const resultado = verificarCodigoNaLista(codigoDigitado);

    if (resultado.encontrado && resultado.ativo) {
      // Prepara os dados para passar para a próxima tela
      const dadosAtivo = {
        id: resultado.ativo.id,
        nome: resultado.ativo.nome,
        codigoEscaneado: codigoDigitado,
        tipoCodigo: "manual",
        ambiente: resultado.ativo.ambiente || room,
      };

      // Fecha o modal
      setShowModal(false);
      setCodigoDigitado("");

      // Navega para a tela ConfirmItem
      router.push({
        pathname: "/confirmItem/confirmItem",
        params: {
          ativo: JSON.stringify(dadosAtivo),
          ambiente: room,
        },
      });
    } else {
      Alert.alert(
        "Código não encontrado",
        "Este código não está na lista importada.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowModal(false);
              setCodigoDigitado("");
            },
          },
        ],
      );
    }

    setLoading(false);
  };

  // Remove um item verificado da lista
  const removerItemVerificado = async (index: number) => {
    try {
      const itemParaRemover = items[index];
      const itemId = itemParaRemover[0]; // ID está na posição 0 do array

      // Carrega todos os verificados
      const verificadosJson = await AsyncStorage.getItem(LISTA_VERIFICADOS_KEY);
      if (verificadosJson) {
        const todosVerificados: Ativo[] = JSON.parse(verificadosJson);

        // Remove o item específico
        const novosVerificados = todosVerificados.filter(
          (item) => !(item.id === itemId && item.ambiente === room),
        );

        // Salva de volta
        await AsyncStorage.setItem(
          LISTA_VERIFICADOS_KEY,
          JSON.stringify(novosVerificados),
        );

        // Atualiza a lista local
        await carregarItensVerificados();
        setExpandedIndex(null);

        Alert.alert("Sucesso", "Item removido da lista de verificados");
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
      Alert.alert("Erro", "Não foi possível remover o item");
    }
  };

  // Abre o modal para digitar código
  const abrirModalCodigo = () => {
    setShowModal(true);
    setCodigoDigitado("");
  };

  // Fecha o modal e o teclado
  const fecharModal = () => {
    Keyboard.dismiss();
    setShowModal(false);
    setCodigoDigitado("");
  };

  // Fecha o teclado ao tocar fora no modal
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Calcula a porcentagem atual
  const progressPercentage = calcularPorcentagem();

  // Navega para a câmera passando o ambiente atual
  const navegarParaCamera = () => {
    router.push({
      pathname: "/camera/camera",
      params: {
        ambiente: room,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{room}</Text>
      </View>

      {/* Título do progresso */}
      <Text style={styles.sectionTitle}>Seu progresso</Text>

      {/* Barra de progresso */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercentage}%`,
              backgroundColor:
                progressPercentage === 100 ? "#4CAF50" : "#3a6f78",
            },
          ]}
        />
      </View>

      {/* Texto do progresso */}
      <Text style={styles.progressText}>
        {totalAmbiente === 0
          ? "Nenhum item neste ambiente"
          : `${verificadosAmbiente} de ${totalAmbiente} itens já foram verificados neste ambiente (${Math.round(progressPercentage)}%)`}
      </Text>

      {/* Botões principais */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={abrirModalCodigo}
        >
          <Ionicons name="create-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Digitar código</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={navegarParaCamera}
        >
          <Ionicons name="camera-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Usar câmera</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de itens JÁ VERIFICADOS */}
      <ScrollView style={styles.scrollView}>
        <Text style={styles.listaTitle}>
          Itens Verificados ({items.length})
        </Text>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum item verificado ainda</Text>
            <Text style={styles.emptySubtext}>
              Use os botões acima para começar
            </Text>
          </View>
        ) : (
          items.map((item, index) => {
            const expanded = expandedIndex === index;

            return (
              <View key={index} style={styles.itemCard}>
                {/* Cabeçalho do item */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <Text style={styles.itemTitle}>{item[1]}</Text>

                  {/* Botão da seta com quadrado */}
                  <View style={styles.arrowButton}>
                    <Ionicons
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>

                {/* Detalhes colapsáveis */}
                {expanded && (
                  <View style={styles.itemDetails}>
                    <Text style={styles.detailText}>Tombamento: {item[0]}</Text>
                    <Text style={styles.detailText}>Nome: {item[1]}</Text>
                    {item[2] && (
                      <Text style={styles.detailText}>Ambiente: {item[2]}</Text>
                    )}
                    {item[3] && (
                      <Text style={styles.detailText}>
                        Verificado em: {item[3]}
                      </Text>
                    )}
                    {item[4] && (
                      <Text style={styles.detailText}>Método: {item[4]}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removerItemVerificado(index)}
                    >
                      <Text style={styles.deleteText}>Remover verificação</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Botão finalizar */}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => router.push("/rooms")}
        >
          <Text style={styles.finishText}>Finalizar Ambiente</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL para digitar código */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Cabeçalho do modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Digitar Tombamento</Text>
                  <TouchableOpacity onPress={fecharModal}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Informações */}
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Digite o número do tombamento do item
                  </Text>
                  <Text style={styles.modalInfoSubtext}>
                    Apenas números são permitidos
                  </Text>
                </View>

                {/* Campo de entrada */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ex: 12345 ou 123-1"
                    value={codigoDigitado}
                    onChangeText={(text) => {
                      const formattedText = text.replace(/[^0-9\-/\s]/g, "");
                      setCodigoDigitado(formattedText);
                    }}
                    autoFocus={true}
                    keyboardType="numeric"
                    maxLength={20}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmarCodigo}
                    blurOnSubmit={false}
                  />
                  {codigoDigitado.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => setCodigoDigitado("")}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Contador de caracteres */}
                <Text style={styles.charCount}>
                  {codigoDigitado.length}/20 caracteres
                </Text>

                {/* Status da lista */}
                <View style={styles.modalStatus}>
                  <Text style={styles.modalStatusText}>
                    {listaAtivos.length > 0
                      ? `📋 ${listaAtivos.length} tombamentos na lista`
                      : "⚠️ Nenhuma lista carregada"}
                  </Text>
                </View>

                {/* Botões do modal */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={fecharModal}
                    disabled={loading}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmButton,
                      (!codigoDigitado.trim() || loading) &&
                        styles.modalConfirmButtonDisabled,
                    ]}
                    onPress={handleConfirmarCodigo}
                    disabled={!codigoDigitado.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Verificar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3a6f78",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  listaTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#3a6f78",
    marginHorizontal: 5,
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    opacity: 0.5,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  emptySubtext: {
    opacity: 0.5,
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#999",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#3a6f78",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 14,
    backgroundColor: "#f9f9f9",
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  deleteButton: {
    backgroundColor: "#d64545",
    padding: 10,
    alignItems: "center",
    borderRadius: 4,
    marginTop: 10,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  finishButton: {
    backgroundColor: "#3a6f78",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Estilos do MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalInfo: {
    marginBottom: 20,
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3a6f78",
  },
  modalInfoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  modalInfoSubtext: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    fontSize: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#3a6f78",
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
    paddingRight: 40,
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginBottom: 15,
  },
  modalStatus: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    alignItems: "center",
  },
  modalStatusText: {
    fontSize: 14,
    color: "#3a6f78",
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 15,
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    padding: 15,
    backgroundColor: "#3a6f78",
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmButtonDisabled: {
    backgroundColor: "#a0bcc6",
    opacity: 0.7,
  },
  modalConfirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

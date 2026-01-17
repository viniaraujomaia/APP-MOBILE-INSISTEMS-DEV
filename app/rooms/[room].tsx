// app/roompage.tsx
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
}

// Constante para o AsyncStorage
const LISTA_ATIVOS_KEY = "@insistems:lista_ativos";

export default function RoomPage() {
  const { room } = useLocalSearchParams<{ room: string }>();
  const [items, setItems] = useState<string[][]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState("");
  const [loading, setLoading] = useState(false);
  const [listaAtivos, setListaAtivos] = useState<Ativo[]>([]);

  // Carrega itens do ambiente e a lista de ativos
  useEffect(() => {
    loadItems();
    carregarListaAtivos();
  }, []);

  // Carrega itens do ambiente do AsyncStorage
  const loadItems = async () => {
    const raw = await AsyncStorage.getItem(`items-${room}`);
    setItems(raw ? JSON.parse(raw) : []);
  };

  // Carrega a lista de ativos do AsyncStorage
  const carregarListaAtivos = async () => {
    try {
      const listaJson = await AsyncStorage.getItem(LISTA_ATIVOS_KEY);
      if (listaJson) {
        const lista = JSON.parse(listaJson);
        setListaAtivos(lista);
        console.log(`📋 Lista de ativos carregada: ${lista.length} itens`);
      } else {
        console.log("⚠️ Nenhuma lista de ativos encontrada");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar lista de ativos:", error);
    }
  };

  // Função para verificar se o código está na lista
  const verificarCodigoNaLista = (
    codigo: string,
  ): { encontrado: boolean; ativo?: Ativo } => {
    if (listaAtivos.length === 0) {
      console.log("⚠️ Lista de ativos vazia");
      return { encontrado: false };
    }

    const codigoLimpo = codigo.trim();
    console.log(`🔍 Verificando código digitado: ${codigoLimpo}`);

    // Procura na lista de ativos
    const ativoEncontrado = listaAtivos.find((ativo) => {
      const idAtivo = ativo.id;
      const nomeAtivo = ativo.nome.toUpperCase();

      // Remove caracteres não numéricos para comparação (se necessário)
      const codigoNumerico = codigoLimpo.replace(/\D/g, "");
      const idNumerico = idAtivo.replace(/\D/g, "");

      // Verifica várias possibilidades de correspondência
      return (
        // Correspondência exata
        idAtivo === codigoLimpo ||
        // O ID contém o código digitado
        idAtivo.includes(codigoLimpo) ||
        // O código digitado contém o ID (ou parte dele)
        codigoLimpo.includes(idAtivo.split("-")[0]) ||
        // O código está no nome (pode conter números também)
        nomeAtivo.includes(codigoLimpo.toUpperCase()) ||
        // Comparação numérica (apenas números)
        (codigoNumerico && idNumerico.includes(codigoNumerico))
      );
    });

    if (ativoEncontrado) {
      console.log(
        `✅ Código encontrado na lista: ${ativoEncontrado.id} - ${ativoEncontrado.nome}`,
      );
      return { encontrado: true, ativo: ativoEncontrado };
    } else {
      console.log(`❌ Código NÃO encontrado na lista: ${codigoLimpo}`);
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
      // Se encontrou, navega para a tela de confirmação
      console.log("🚀 Navegando para tela de confirmação...");

      // Prepara os dados para passar para a próxima tela
      const dadosAtivo = {
        id: resultado.ativo.id,
        nome: resultado.ativo.nome,
        codigoEscaneado: codigoDigitado,
        tipoCodigo: "manual",
      };

      // Fecha o modal
      setShowModal(false);
      setCodigoDigitado("");

      // Navega para a tela ConfirmItem
      setTimeout(() => {
        router.push({
          pathname: "/confirmItem/confirmItem",
          params: {
            ativo: JSON.stringify(dadosAtivo),
            dataHora: new Date().toISOString(),
          },
        });
      }, 300);
    } else {
      // Se não encontrou, mostra alerta
      Alert.alert(
        "Código não encontrado",
        "Este código não está na lista importada.\n\nVerifique se digitou corretamente ou se o item foi incluído na planilha.",
        [
          {
            text: "Tentar novamente",
            onPress: () => {
              setLoading(false);
              // Foca no campo novamente
              // Isso seria implementado com ref, mas mantemos simples por enquanto
            },
          },
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              setShowModal(false);
              setLoading(false);
              setCodigoDigitado("");
            },
          },
        ],
      );
    }

    setLoading(false);
  };

  // Exclui item pelo índice
  const deleteItem = async (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));
    setExpandedIndex(null);
    loadItems();
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
        <View style={styles.progressFill} />
      </View>

      {/* Texto do progresso */}
      <Text style={styles.progressText}>
        {items.length} itens já foram verificados neste ambiente
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
          onPress={() => router.push("/camera/camera")}
        >
          <Ionicons name="camera-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Usar câmera</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de itens */}
      <ScrollView style={styles.scrollView}>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item cadastrado ainda</Text>
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
                    <Text style={styles.detailText}>Tipo: {item[2]}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteItem(index)}
                    >
                      <Text style={styles.deleteText}>Excluir</Text>
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

                {/* Campo de entrada com teclado numérico */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ex: 12345 ou 123-1"
                    value={codigoDigitado}
                    onChangeText={(text) => {
                      // Permite apenas números, hífens e barras (comuns em tombamentos)
                      const formattedText = text.replace(/[^0-9\-/\s]/g, "");
                      setCodigoDigitado(formattedText);
                    }}
                    autoFocus={true}
                    keyboardType="numeric" // Teclado numérico com alguns símbolos
                    maxLength={20}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmarCodigo}
                    blurOnSubmit={false}
                    placeholderTextColor="#999"
                    selectionColor="#3a6f78"
                    textContentType="none"
                    autoCorrect={false}
                    autoCapitalize="none"
                    spellCheck={false}
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

                {/* Dica para usuário */}
                <View style={styles.tipContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#3a6f78"
                  />
                  <Text style={styles.tipText}>
                    Dica: O tombamento geralmente contém apenas números
                  </Text>
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
    width: "20%",
    height: "100%",
    backgroundColor: "#3a6f78",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
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
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  itemTitle: {
    fontSize: 18,
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
  emptyText: {
    opacity: 0.5,
    textAlign: "center",
    marginVertical: 20,
    fontSize: 16,
    color: "#666",
  },
  finishButton: {
    backgroundColor: "#3a6f78",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    elevation: 2,
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
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    paddingRight: 40, // Espaço para o botão de limpar
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
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f7ff",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  tipText: {
    fontSize: 12,
    color: "#3a6f78",
    marginLeft: 5,
    fontStyle: "italic",
  },
});

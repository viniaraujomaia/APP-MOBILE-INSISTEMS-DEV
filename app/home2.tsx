// app/home2.tsx - CÓDIGO COMPLETO COM STYLES
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system/next";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as XLSX from "xlsx";

export default function Home2() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasActiveCollection, setHasActiveCollection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [collectionStats, setCollectionStats] = useState({
    totalItems: 0,
    checkedItems: 0,
    uncheckedItems: 0,
    indeterminateItems: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Verifica se há coleta ativa (lista de ativos OU verificados)
        const listaAtivos = await AsyncStorage.getItem(
          "@insistems:lista_ativos",
        );
        const listaVerificados = await AsyncStorage.getItem(
          "@insistems:lista_verificados",
        );

        // Coleta ativa se qualquer uma dessas chaves existir
        const isActive = !!(listaAtivos || listaVerificados);

        if (isActive) {
          await loadCollectionStats();
        }

        setHasActiveCollection(isActive);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadCollectionStats = async () => {
    try {
      console.log("=== CARREGANDO ESTATÍSTICAS ===");

      // Carrega lista original de ativos
      const rawListaAtivos = await AsyncStorage.getItem(
        "@insistems:lista_ativos",
      );
      const listaAtivos = rawListaAtivos ? JSON.parse(rawListaAtivos) : [];

      // Carrega lista de itens verificados
      const rawListaVerificados = await AsyncStorage.getItem(
        "@insistems:lista_verificados",
      );
      const listaVerificados = rawListaVerificados
        ? JSON.parse(rawListaVerificados)
        : [];

      console.log("Total de ativos na lista original:", listaAtivos.length);
      console.log("Total de itens verificados:", listaVerificados.length);

      // Conta itens verificados únicos (por ID)
      const checkedItemsSet = new Set();
      listaVerificados.forEach((item: any) => {
        if (item.id) {
          checkedItemsSet.add(item.id);
        }
      });

      // Conta indeterminados (itens verificados que não estão na lista original)
      let indeterminados = 0;
      listaVerificados.forEach((item: any) => {
        if (
          item.id &&
          !listaAtivos.some((ativo: any) => ativo.id === item.id)
        ) {
          indeterminados++;
        }
      });

      const totalItems = listaAtivos.length;
      const totalChecked = checkedItemsSet.size;
      const totalUnchecked = totalItems - totalChecked;

      console.log("Estatísticas:", {
        totalItems,
        totalChecked,
        totalUnchecked,
        indeterminados,
      });

      setCollectionStats({
        totalItems,
        checkedItems: totalChecked,
        uncheckedItems: totalUnchecked < 0 ? 0 : totalUnchecked,
        indeterminateItems: indeterminados,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const getFileName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR").replace(/\//g, "-");
    const timeStr = now
      .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      .replace(/:/g, "-");
    return `Relatorio_Final_${dateStr}_${timeStr}.xlsx`;
  };

  const exportToExcel = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Erro", "Compartilhamento indisponível.");
        return false;
      }

      console.log("=== INICIANDO EXPORTAÇÃO ===");

      // Carrega lista verificada
      const rawListaVerificados = await AsyncStorage.getItem(
        "@insistems:lista_verificados",
      );
      const listaVerificados = rawListaVerificados
        ? JSON.parse(rawListaVerificados)
        : [];

      console.log("Itens verificados para exportar:", listaVerificados.length);

      // Prepara dados para Excel
      const dadosParaExcel: any[][] = [["Tombamento", "Nome", "Status"]];
      let totalItens = 0;

      // Agrupa por ID para evitar duplicatas
      const itensUnicos = new Map();

      for (const item of listaVerificados) {
        if (item.id && item.nome) {
          if (!itensUnicos.has(item.id)) {
            itensUnicos.set(item.id, {
              codigo: item.id,
              nome: item.nome,
            });
          }
        }
      }

      // Adiciona itens únicos ao Excel
      itensUnicos.forEach((item) => {
        dadosParaExcel.push([item.codigo, item.nome, "Presente"]);
        totalItens++;
      });

      console.log("Itens únicos para exportar:", totalItens);

      if (totalItens === 0) {
        Alert.alert("Aviso", "Nenhum item verificado para exportar.");
        return false;
      }

      // Gera o Excel
      const ws = XLSX.utils.aoa_to_sheet(dadosParaExcel);
      ws["!cols"] = [{ wch: 20 }, { wch: 50 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");

      const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      // Salva o arquivo
      const fileName = getFileName();
      console.log("Nome do arquivo:", fileName);

      const file = new File(Paths.cache, fileName);
      await file.create();
      const bytes = new Uint8Array(wbout);
      await file.write(bytes);

      console.log("Arquivo salvo em:", file.uri);

      // Compartilha
      await Sharing.shareAsync(file.uri, {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        dialogTitle: "Relatório Final de Coleta",
        UTI: "com.microsoft.excel.xlsx",
      });

      console.log("Exportação concluída com sucesso!");
      return true;
    } catch (error) {
      console.error("❌ Erro na exportação:", error);
      Alert.alert("Erro", "Falha ao gerar Excel: " + (error as any).message);
      return false;
    }
  };

  const clearAllCollectionData = async () => {
    try {
      console.log("=== LIMPANDO DADOS DA COLETA ===");

      // Remove todas as chaves relacionadas à coleta
      const keysToRemove = [
        "@insistems:lista_ativos",
        "@insistems:file_name",
        "@insistems:lista_verificados",
      ];

      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
        console.log("Removida chave:", key);
      }

      // Atualiza estado
      setHasActiveCollection(false);
      setCollectionStats({
        totalItems: 0,
        checkedItems: 0,
        uncheckedItems: 0,
        indeterminateItems: 0,
      });

      console.log("Dados limpos com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      return false;
    }
  };

  const handleFinalizeCollection = async () => {
    // Recarrega estatísticas antes de mostrar o modal
    await loadCollectionStats();
    setShowModal(true);
  };

  const handleConfirmFinalize = async () => {
    setShowModal(false);

    try {
      Alert.alert("Gerando relatório...", "Por favor, aguarde.");

      // Exporta para Excel
      const exportSuccess = await exportToExcel();

      if (exportSuccess) {
        // Limpa todos os dados
        const clearSuccess = await clearAllCollectionData();

        if (clearSuccess) {
          Alert.alert(
            "Coleta Finalizada",
            "A coleta foi finalizada com sucesso! O relatório foi gerado e os dados foram limpos.",
            [
              {
                text: "OK",
                onPress: () => router.push("/"),
              },
            ],
          );
        }
      }
    } catch (error) {
      console.error("Erro ao finalizar coleta:", error);
      Alert.alert("Erro", "Não foi possível finalizar a coleta.");
    }
  };

  // Botão de teste para ver dados
  const testVerificados = async () => {
    const lista = await AsyncStorage.getItem("@insistems:lista_verificados");
    console.log("Lista verificada:", lista);
    const parsed = lista ? JSON.parse(lista) : [];
    Alert.alert(
      "Dados Verificados",
      `Total de itens: ${parsed.length}\n` +
        `Exemplo: ${parsed.length > 0 ? JSON.stringify(parsed[0]) : "Nenhum item"}`,
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#E6F0F2",
        }}
      >
        <ActivityIndicator size="large" color="#3A6F78" />
        <Text style={{ marginTop: 20, color: "#3A6F78" }}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E6F0F2" }}>
      <StatusBar backgroundColor="#3A6F78" barStyle="light-content" />

      {/* MODAL DE CONFIRMAÇÃO */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finalizar Coleta</Text>

            <Text style={styles.modalText}>
              Ao finalizar a coleta, você não poderá continuar com a mesma
              coleta depois disso.
            </Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statItem}>
                • Total de itens:{" "}
                <Text style={styles.statValue}>
                  {collectionStats.totalItems}
                </Text>
              </Text>
              <Text style={styles.statItem}>
                • Itens verificados:{" "}
                <Text style={styles.statValue}>
                  {collectionStats.checkedItems}
                </Text>
              </Text>
              <Text style={styles.statItem}>
                • Itens não verificados:{" "}
                <Text style={styles.statValue}>
                  {collectionStats.uncheckedItems}
                </Text>
              </Text>
              <Text style={styles.statItem}>
                • Itens indeterminados:{" "}
                <Text style={styles.statValue}>
                  {collectionStats.indeterminateItems}
                </Text>
              </Text>
            </View>

            <Text style={styles.modalNote}>
              A lista final não contém os itens indeterminados.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmFinalize}
              >
                <Text style={styles.confirmButtonText}>Prosseguir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View
        style={{
          backgroundColor: "#3A6F78",
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 15,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <Text
          style={{
            color: "#F4F7FB",
            fontSize: 24,
            textAlign: "center",
            fontFamily: "poppins",
            fontStyle: "normal",
            fontWeight: 600,
            letterSpacing: 0.312,
          }}
        >
          Inventário Inteligente
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "#E6F0F2",
          padding: 20,
          paddingTop: 45,
          paddingHorizontal: 34,
          paddingBottom: 80,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "500",
              marginBottom: 10,
              fontFamily: "poppins",
              color: "#373F51",
              letterSpacing: 0.416,
            }}
          >
            Coleta em{"\n"}andamento
          </Text>

          <Text
            style={{
              fontSize: 20,
              marginBottom: 30,
              fontFamily: "poppins",
              fontWeight: 500,
              letterSpacing: 0.26,
              color: "#373F51",
            }}
          >
            Crie ambientes para{"\n"}organizar e transferir dados{"\n"}mais
            facilmente
          </Text>

          {/* Botão de teste (remova depois) */}
          <TouchableOpacity
            onPress={testVerificados}
            style={{
              backgroundColor: "#FF9800",
              padding: 10,
              marginBottom: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#FFF", textAlign: "center" }}>
              🔍 TESTE: Ver dados verificados
            </Text>
          </TouchableOpacity>

          {/* Botão Finalizar Coleta */}
          {hasActiveCollection && (
            <TouchableOpacity
              onPress={handleFinalizeCollection}
              style={{
                backgroundColor: "#d32f2f",
                padding: 17,
                marginBottom: 24,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#F4F7FB",
                  textAlign: "center",
                  fontSize: 20,
                  fontFamily: "poppins",
                  fontWeight: "semibold",
                  letterSpacing: 0.26,
                }}
              >
                Finalizar Coleta
              </Text>
            </TouchableOpacity>
          )}

          {/* Outros botões */}
          <TouchableOpacity
            disabled
            style={{
              backgroundColor: "#FFF",
              padding: 17,
              marginBottom: 24,
              opacity: 0.6,
              borderWidth: 1,
              borderColor: "#A4A4A4",
              borderStyle: "solid",
            }}
          >
            <Text
              style={{
                color: "#3A6F78",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Importar Lista
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/continue-collection")}
            style={{
              backgroundColor: "#3A6F78",
              padding: 17,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#F4F7FB",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Continuar Coleta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/reports")}
            style={{
              backgroundColor: "#3A6F78",
              padding: 17,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#F4F7FB",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Relatórios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/rooms")}
            style={{
              backgroundColor: "#3A6F78",
              padding: 17,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#F4F7FB",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>

          {/* Informação de debug */}
          <View
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#f5f5f5",
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "#666", fontSize: 12 }}>
              Debug: hasActiveCollection = {hasActiveCollection.toString()}
            </Text>
            <Text style={{ color: "#666", fontSize: 12 }}>
              Total de itens: {collectionStats.totalItems}
            </Text>
            <Text style={{ color: "#666", fontSize: 12 }}>
              Itens verificados: {collectionStats.checkedItems}
            </Text>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <View
        style={{
          backgroundColor: "#3A6F78",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.push("/compare")}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Pesquisa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.replace("/home2")}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.push("/camera/camera")}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "poppins",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statItem: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  statValue: {
    fontWeight: "bold",
    color: "#d32f2f",
  },
  modalNote: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#d32f2f",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "poppins",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "poppins",
  },
});

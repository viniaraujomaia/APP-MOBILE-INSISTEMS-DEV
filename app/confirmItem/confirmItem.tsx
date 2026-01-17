// app/confirmItem/confirmItem.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface AtivoConfirmacao {
  id: string;
  nome: string;
  codigoEscaneado: string;
  tipoCodigo: string;
}

const STORAGE_KEY_VERIFICADOS = "@insistems:itens_verificados";

export default function ConfirmItem() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ativo, setAtivo] = useState<AtivoConfirmacao | null>(null);
  const [dataHora, setDataHora] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dadosProcessados, setDadosProcessados] = useState(false); // Nova flag

  // Função para voltar de forma segura
  const voltarComSeguranca = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/camera/camera");
    }
  }, [router]);

  // Carrega os dados passados da câmera - CORRIGIDO
  useEffect(() => {
    // Se já processamos os dados, não processa novamente
    if (dadosProcessados) return;

    const processarDados = async () => {
      try {
        if (params.ativo && params.ativo !== "undefined") {
          const ativoData = JSON.parse(params.ativo as string);
          setAtivo(ativoData);
          setDataHora((params.dataHora as string) || new Date().toISOString());
          setDadosProcessados(true); // Marca como processado
        } else {
          // Se não tem dados, mostra alerta e volta
          Alert.alert("Aviso", "Nenhum item recebido para confirmação", [
            {
              text: "OK",
              onPress: () => {
                setTimeout(() => voltarComSeguranca(), 100);
              },
            },
          ]);
        }
      } catch (error) {
        console.error("Erro ao parsear dados do ativo:", error);
        Alert.alert("Erro", "Dados inválidos recebidos", [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => voltarComSeguranca(), 100);
            },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    processarDados();
  }, [params, dadosProcessados, voltarComSeguranca]); // Adicionado dependências

  // Função para salvar a verificação no AsyncStorage
  const salvarVerificacao = async () => {
    if (!ativo) return;

    setSalvando(true);
    try {
      // Carrega verificações existentes
      const verificacoesJson = await AsyncStorage.getItem(
        STORAGE_KEY_VERIFICADOS,
      );
      const verificacoes = verificacoesJson ? JSON.parse(verificacoesJson) : [];

      // Adiciona nova verificação
      const novaVerificacao = {
        ...ativo,
        dataHora: new Date().toISOString(),
        status: "confirmado",
      };

      verificacoes.push(novaVerificacao);

      // Salva no AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEY_VERIFICADOS,
        JSON.stringify(verificacoes),
      );

      console.log("✅ Verificação salva:", novaVerificacao);

      // Navega para a câmera após salvar
      setTimeout(() => {
        router.push("/camera/camera");
      }, 500);
    } catch (error) {
      console.error("❌ Erro ao salvar verificação:", error);
      Alert.alert("Erro", "Não foi possível salvar a verificação");
      setSalvando(false);
    }
  };

  // Função para cancelar/voltar
  const handleCancelar = () => {
    voltarComSeguranca();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar backgroundColor="#3A6F78" barStyle="light-content" />
        <Text style={styles.loadingText}>Carregando dados do item...</Text>
      </SafeAreaView>
    );
  }

  if (!ativo) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar backgroundColor="#3A6F78" barStyle="light-content" />
        <Text style={styles.errorText}>Nenhum item para confirmar</Text>
        <TouchableOpacity style={styles.button} onPress={voltarComSeguranca}>
          <Text style={styles.buttonText}>Voltar para Câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Formata a data/hora
  const dataFormatada = new Date(dataHora).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3A6F78" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confirmar Item</Text>
        <Text style={styles.headerSubtitle}>
          Verifique os dados antes de confirmar
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de informações */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>✅ Item Escaneado</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Encontrado na Lista</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID do Ativo:</Text>
              <Text style={styles.infoValue}>{ativo.id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>{ativo.nome}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Código Escaneado:</Text>
              <Text style={styles.infoValueCode}>{ativo.codigoEscaneado}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Código:</Text>
              <Text style={styles.infoValue}>{ativo.tipoCodigo}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data/Hora:</Text>
              <Text style={styles.infoValue}>{dataFormatada}</Text>
            </View>
          </View>

          {/* Separador */}
          <View style={styles.separator} />

          {/* Instruções */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instruções:</Text>
            <Text style={styles.instructionsText}>
              1. Verifique se o ID e nome correspondem ao item físico{"\n"}
              2. Confirme se o código escaneado está correto{"\n"}
              3. Clique em "Confirmar" para salvar a verificação
            </Text>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelar}
            disabled={salvando}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={salvarVerificacao}
            disabled={salvando}
          >
            {salvando ? (
              <Text style={styles.confirmButtonText}>Salvando...</Text>
            ) : (
              <Text style={styles.confirmButtonText}>✅ Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Informações adicionais */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoText}>
            ℹ️ Esta confirmação será salva no histórico e poderá ser exportada
            posteriormente nos relatórios.
          </Text>
        </View>
      </ScrollView>

      {/* Footer com link para voltar à câmera */}
      <TouchableOpacity
        style={styles.footerLink}
        onPress={() => router.push("/camera/camera")}
        disabled={salvando}
      >
        <Text style={styles.footerLinkText}>↻ Escanear outro item</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0F2",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F0F2",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#3A6F78",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    backgroundColor: "#3A6F78",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: "#F4F7FB",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "poppins",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: "#C8E6C9",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    fontFamily: "poppins",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3A6F78",
    fontFamily: "poppins",
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontFamily: "poppins",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "poppins",
    flex: 2,
    textAlign: "right",
  },
  infoValueCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A6F78",
    fontFamily: "poppins",
    flex: 2,
    textAlign: "right",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  instructions: {
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3A6F78",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3A6F78",
    marginBottom: 8,
    fontFamily: "poppins",
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontFamily: "poppins",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "poppins",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "poppins",
  },
  additionalInfo: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  additionalInfoText: {
    fontSize: 13,
    color: "#1976D2",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    backgroundColor: "#3A6F78",
    padding: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  footerLinkText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "poppins",
  },
  button: {
    backgroundColor: "#3A6F78",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "poppins",
  },
});

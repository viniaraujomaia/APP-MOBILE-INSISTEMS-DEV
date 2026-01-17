// app/confirmItem/confirmItem.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { adicionarItemVerificado } from "../services/verificados";

interface AtivoConfirmacao {
  id: string;
  nome: string;
  codigoEscaneado: string;
  tipoCodigo: string;
}

export default function ConfirmItem() {
  const params = useLocalSearchParams<{
    ativo: string;
    ambiente?: string;
  }>();

  const [ativo, setAtivo] = useState<AtivoConfirmacao | null>(null);
  const [ambiente, setAmbiente] = useState<string>("Geral");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    try {
      if (params.ativo) {
        const ativoData: AtivoConfirmacao = JSON.parse(params.ativo);
        setAtivo(ativoData);
      }

      if (params.ambiente) {
        setAmbiente(params.ambiente);
      } else {
        setAmbiente("Geral");
      }
    } catch (error) {
      console.error("❌ Erro ao parsear dados do ativo:", error);
      Alert.alert("Erro", "Dados inválidos recebidos");
      router.back();
    }
  }, [params.ativo, params.ambiente]); // ← CORREÇÃO: Apenas os valores específicos

  const handleConfirmar = async () => {
    if (!ativo) {
      Alert.alert("Erro", "Dados do ativo não encontrados");
      return;
    }

    setLoading(true);

    try {
      // Adiciona o item à lista de verificados
      const sucesso = await adicionarItemVerificado(
        {
          id: ativo.id,
          nome: ativo.nome,
        },
        ambiente,
        ativo.tipoCodigo === "manual" ? "manual" : "camera",
        ativo.codigoEscaneado,
        observacoes.trim() || undefined,
      );

      if (sucesso) {
        setConfirmado(true);

        // Mostra confirmação por 2 segundos antes de voltar
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        Alert.alert(
          "Aviso",
          "Este item já foi verificado neste ambiente anteriormente.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("❌ Erro ao confirmar item:", error);
      Alert.alert("Erro", "Não foi possível confirmar o item");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    router.back();
  };

  if (!ativo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A6F78" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (confirmado) {
    return (
      <View style={styles.confirmadoContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        <Text style={styles.confirmadoTitle}>Item Confirmado!</Text>
        <Text style={styles.confirmadoText}>
          O item foi adicionado aos verificados no ambiente {ambiente}.
        </Text>
        <Text style={styles.voltandoText}>Voltando em 2 segundos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar Item</Text>
        <Text style={styles.subtitle}>
          Verifique as informações antes de confirmar
        </Text>
      </View>

      {/* Informações do Item */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="barcode-outline" size={24} color="#3A6F78" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Código do Item</Text>
            <Text style={styles.infoValue}>{ativo.id}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={24} color="#3A6F78" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nome do Item</Text>
            <Text style={styles.infoValue}>{ativo.nome}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="scan-outline" size={24} color="#3A6F78" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Código Escaneado</Text>
            <Text style={styles.infoValue}>{ativo.codigoEscaneado}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={24} color="#3A6F78" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ambiente</Text>
            <Text style={styles.infoValue}>{ambiente}</Text>
          </View>
        </View>
      </View>

      {/* Campo de Observações */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Observações (Opcional)</Text>
        <TextInput
          style={styles.observacoesInput}
          placeholder="Adicione alguma observação sobre o item..."
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={4}
          maxLength={200}
        />
        <Text style={styles.charCount}>
          {observacoes.length}/200 caracteres
        </Text>
      </View>

      {/* Botões de Ação */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancelar}
          disabled={loading}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirmar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFF"
              />
              <Text style={styles.buttonText}>Confirmar Item</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Informações Adicionais */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#3A6F78" />
        <Text style={styles.infoText}>
          Ao confirmar, este item será marcado como "verificado" e aparecerá no
          progresso da coleta no ambiente {ambiente}.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  confirmadoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    padding: 30,
  },
  confirmadoTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#4CAF50",
  },
  confirmadoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  voltandoText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  observacoesInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 100,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
  },
  confirmButton: {
    backgroundColor: "#3A6F78",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#E8F4F8",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3A6F78",
    marginLeft: 12,
    lineHeight: 18,
  },
});

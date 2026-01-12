//importacoes principais
import * as DocumentPicker from "expo-document-picker";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as XLSX from "xlsx";

// Interface para ativo
interface Ativo {
  id: string;
  nome: string;
}

//componente principal
export default function Home() {
  //controle do modal de importacao
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados para a importação
  const [importing, setImporting] = useState(false);
  const [importedData, setImportedData] = useState<Ativo[]>([]);
  const [fileName, setFileName] = useState("");
  const [importCompleted, setImportCompleted] = useState(false);

  //router para navegacao
  const router = useRouter();

  // Função de importação
  const handleImport = async () => {
    try {
      setImporting(true);

      // 1. Selecionar arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Erro", "Nenhum arquivo selecionado");
        setImporting(false);
        return;
      }

      setFileName(file.name);

      // 2. Ler arquivo
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      // 3. Processar Excel
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as any[][];

      // 4. Extrair dados
      const novosAtivos: Ativo[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const linha = jsonData[i];

        if (Array.isArray(linha) && linha.length >= 2) {
          const numero = String(linha[0] || "").trim();
          const nome = String(linha[1] || "").trim();

          if (numero) {
            novosAtivos.push({
              id: `${numero}-${i}`,
              nome: nome || `Ativo ${numero}`,
            });
          }
        }
      }

      setImportedData(novosAtivos);
      setImportCompleted(true);

      Alert.alert(
        "✅ Importado!",
        `${novosAtivos.length} ativos importados com sucesso`,
      );
    } catch (error: any) {
      console.error("Erro na importação:", error);
      Alert.alert("❌ Erro", "Não foi possível importar o arquivo");
    } finally {
      setImporting(false);
    }
  };

  // Função para prosseguir para home2
  const handleProceed = () => {
    if (importedData.length === 0) {
      Alert.alert("Aviso", "Nenhum dado importado para prosseguir");
      return;
    }

    setShowImportModal(false);
    router.push({
      pathname: "/home2",
      params: {
        ativos: JSON.stringify(importedData),
        fileName: fileName,
        total: importedData.length.toString(),
      },
    });

    // Resetar estados após navegação
    setImportedData([]);
    setFileName("");
    setImportCompleted(false);
  };

  // Função para resetar a importação
  const resetImport = () => {
    setImportedData([]);
    setFileName("");
    setImportCompleted(false);
  };

  // Função principal do botão do modal
  const handleMainButton = () => {
    if (importCompleted) {
      handleProceed();
    } else {
      handleImport();
    }
  };

  // Fechar modal e resetar
  const handleCloseModal = () => {
    setShowImportModal(false);
    resetImport();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#E6F0F2",
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
          Inicie a sua coleta
        </Text>

        <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 30 }}>
          Importe o arquivo da lista de demandas para iniciar o seu inventário
        </Text>

        {/*importar lista ativo*/}
        <TouchableOpacity
          onPress={() => setShowImportModal(true)}
          style={{
            backgroundColor: "#3A6F78",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Importar Lista
          </Text>
        </TouchableOpacity>

        {/*continuar coleta desativado*/}
        <TouchableOpacity
          disabled
          style={{
            backgroundColor: "#FFF",
            padding: 16,
            marginBottom: 12,
            opacity: 0.6,
            borderWidth: 1,
            borderColor: "#3A6F78",
          }}
        >
          <Text style={{ color: "#3A6F78", textAlign: "center", fontSize: 16 }}>
            Continuar Coleta
          </Text>
        </TouchableOpacity>

        {/*relatorios desativado*/}
        <TouchableOpacity
          disabled
          style={{
            backgroundColor: "#FFF",
            padding: 16,
            marginBottom: 12,
            opacity: 0.6,
            borderWidth: 1,
            borderColor: "#3A6F78",
          }}
        >
          <Text style={{ color: "#3A6F78", textAlign: "center", fontSize: 16 }}>
            Relatórios
          </Text>
        </TouchableOpacity>

        {/*gerenciar ambientes ativo*/}
        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#3A6F78",
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text
        style={{ flex: 0.2, opacity: 0.5, textAlign: "center", fontSize: 14 }}
      >
        INSISTEMS - Inventário Inteligente - v1.0
      </Text>

      {/*modal de importacao*/}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFF",
              padding: 20,
              borderRadius: 8,
              maxHeight: "80%",
            }}
          >
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>

            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}
            >
              Importar Lista
            </Text>

            <Text style={{ marginBottom: 20, opacity: 0.7 }}>
              {importCompleted
                ? `✅ ${importedData.length} ativos importados de ${fileName}`
                : "Selecione um arquivo para importar os dados de inventário."}
            </Text>

            {/* Lista de itens importados (após sucesso) */}
            {importCompleted && importedData.length > 0 && (
              <View style={{ marginBottom: 20, maxHeight: 200 }}>
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  Itens importados:
                </Text>
                <ScrollView>
                  {importedData.slice(0, 10).map((ativo, index) => (
                    <View
                      key={ativo.id}
                      style={{
                        padding: 8,
                        marginBottom: 4,
                        backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff",
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>
                        <Text style={{ fontWeight: "bold" }}>
                          {ativo.id.split("-")[0]}
                        </Text>{" "}
                        - {ativo.nome}
                      </Text>
                    </View>
                  ))}
                  {importedData.length > 10 && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#666",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      ... e mais {importedData.length - 10} itens
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Botão principal que muda de função */}
            <TouchableOpacity
              onPress={handleMainButton}
              disabled={importing}
              style={{
                backgroundColor: importing
                  ? "#9E9E9E"
                  : importCompleted
                    ? "#3AA76D"
                    : "#3A6F78",
                padding: 14,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
              }}
            >
              {importing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text
                  style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}
                >
                  {importCompleted ? "Prosseguir" : "Carregar Arquivo"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

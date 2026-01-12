// app/import/index.tsx
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
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

interface Ativo {
  id: string;
  nome: string;
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (ativos: Ativo[], fileName: string) => void; // Mudei o nome para ficar mais claro
}

export default function ImportModal({
  visible,
  onClose,
  onProceed,
}: ImportModalProps) {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const importExcelFile = async () => {
    try {
      setLoading(true);
      setAtivos([]);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Erro", "Nenhum arquivo selecionado");
        setLoading(false);
        return;
      }

      setFileName(file.name);

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as any[][];

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

      setAtivos(novosAtivos);
      setImportSuccess(true);

      Alert.alert(
        "✅ Importado com sucesso!",
        `${novosAtivos.length} ativos encontrados no arquivo`,
      );
    } catch (error: any) {
      console.error("Erro na importação:", error);
      Alert.alert("❌ Erro", "Não foi possível importar o arquivo");
    } finally {
      setLoading(false);
    }
  };

  // Nova função para quando clicar em "Prosseguir"
  const handleProceed = () => {
    if (ativos.length === 0) {
      Alert.alert("Aviso", "Nenhum dado importado para prosseguir");
      return;
    }

    // Chama a função passada pelo pai (Home)
    onProceed(ativos, fileName);

    // Fecha o modal
    onClose();

    // Reseta os estados
    setAtivos([]);
    setFileName("");
    setImportSuccess(false);
  };

  // Função para limpar dados (importar outro)
  const handleImportAnother = () => {
    setAtivos([]);
    setFileName("");
    setImportSuccess(false);
  };

  const handleClose = () => {
    onClose();
    setAtivos([]);
    setFileName("");
    setImportSuccess(false);
  };

  // Botão principal - agora só faz importação
  const handleMainButton = () => {
    importExcelFile();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFF",
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: 8,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>✕</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            Importar Lista
          </Text>

          <Text style={{ marginBottom: 20, opacity: 0.7 }}>
            {importSuccess
              ? `Importação bem-sucedida! Comece seu inventário`
              : "Importe o arquivo da demanda no formato .xlsx para iniciar a sua coleta"}
          </Text>

          {/* Botão PRINCIPAL (só para importar) */}
          {!importSuccess && (
            <TouchableOpacity
              onPress={handleMainButton}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#9E9E9E" : "#3A6F78",
                padding: 14,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
                marginBottom: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text
                  style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}
                >
                  Carregar Arquivo
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* Lista de ativos importados */}
          {importSuccess && ativos.length > 0 && (
            <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
              <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                Itens importados:
              </Text>
              {ativos.slice(0, 10).map((ativo, index) => (
                <View
                  key={ativo.id}
                  style={{
                    padding: 8,
                    marginBottom: 4,
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff",
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
            </ScrollView>
          )}

          {/* Botões APÓS importação bem-sucedida */}
          {importSuccess && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* Botão PROSSEGUIR (para navegar) */}
              <TouchableOpacity
                onPress={handleProceed}
                style={{
                  flex: 1,
                  backgroundColor: "#3AA76D", // Verde para ação principal
                  padding: 12,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Prosseguir
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

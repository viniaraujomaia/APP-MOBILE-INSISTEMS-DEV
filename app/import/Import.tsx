import AsyncStorage from "@react-native-async-storage/async-storage"; // Importe o AsyncStorage
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import * as XLSX from "xlsx";

interface Ativo {
  id: string;
  nome: string;
}

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (ativos: Ativo[], fileName: string) => void;
}

const STORAGE_KEY = "@insistems:lista_ativos";
const FILE_NAME_KEY = "@insistems:file_name";

export default function ImportModal({
  visible,
  onClose,
  onProceed,
}: ImportModalProps) {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  // Estado exclusivo para a barra de progresso
  const [progress, setProgress] = useState(0);

  // Função para salvar no AsyncStorage
  const salvarListaNoStorage = async (
    listaAtivos: Ativo[],
    nomeArquivo: string,
  ) => {
    try {
      // Salva a lista de ativos
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(listaAtivos),
      );
      // Salva o nome do arquivo
      await AsyncStorage.setItem(FILE_NAME_KEY, nomeArquivo);
      // Salva a data de importação
      await AsyncStorage.setItem(
        "@insistems:import_date",
        new Date().toISOString(),
      );

      console.log(
        "Lista salva com sucesso! Total de itens:",
        listaAtivos.length,
      );
    } catch (error) {
      console.error("Erro ao salvar lista:", error);
      Alert.alert(
        "Aviso",
        "Lista importada, mas houve um erro ao salvar localmente.",
      );
    }
  };

  // Anima a barra de progresso de forma controlada (UX)
  const animateProgress = async (
    from: number,
    to: number,
    duration = 400,
  ) => {
    const steps = 20;
    const stepTime = duration / steps;
    const increment = (to - from) / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise((res) => setTimeout(res, stepTime));
      setProgress(Math.round(from + increment * i));
    }
  };

  const importExcelFile = async () => {
    try {
      setAtivos([]);
      setProgress(0);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Erro", "Nenhum arquivo selecionado");
        return;
      }

      // A PARTIR DAQUI o loading e a barra começam
      setLoading(true);
      setFileName(file.name);

      await animateProgress(0, 30);

      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();

      await animateProgress(30, 60);

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet =
        workbook.Sheets[workbook.SheetNames[0]];
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

      if (novosAtivos.length === 0) {
        Alert.alert(
          "Aviso",
          "Nenhum dado válido encontrado no arquivo.",
        );
        setLoading(false);
        return;
      }

      setAtivos(novosAtivos);

      // SALVA NO ASYNC STORAGE IMEDIATAMENTE APÓS IMPORTAR
      await animateProgress(60, 90);
      await salvarListaNoStorage(novosAtivos, file.name);

      await animateProgress(90, 100);
      setImportSuccess(true);
    } catch (error: any) {
      console.error("Erro na importação:", error);
      Alert.alert("❌ Erro", "Não foi possível importar o arquivo");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    if (ativos.length === 0) {
      Alert.alert("Aviso", "Nenhum dado importado para prosseguir");
      return;
    }

    // Verifica se salvou no AsyncStorage
    try {
      const listaSalva = await AsyncStorage.getItem(STORAGE_KEY);
      if (!listaSalva) {
        // Se não salvou, salva agora
        await salvarListaNoStorage(ativos, fileName);
      }
    } catch (error) {
      console.error("Erro ao verificar storage:", error);
    }

    // Chama a função passada pelo pai (Home)
    onProceed(ativos, fileName);

    // Fecha o modal
    onClose();

    // Reseta os estados
    setAtivos([]);
    setFileName("");
    setImportSuccess(false);
    setProgress(0);
  };

  const handleClose = () => {
    onClose();
    setAtivos([]);
    setFileName("");
    setImportSuccess(false);
    setProgress(0);
    setLoading(false);
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
          backgroundColor: "#3A6F7859",
          justifyContent: "center",
          padding: 25,
          paddingHorizontal: 34,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFF",
            padding: 20,
            paddingHorizontal: 27,
            maxHeight: "80%",
          }}
        >
          <Text
            style={{
              color: "#1B1B1E",
              fontSize: 24,
              fontWeight: "semibold",
              marginBottom: 10,
              fontFamily: "poppins",
              letterSpacing: 0.312,
            }}
          >
            Importar Lista
          </Text>

          <Text
            style={{
              marginBottom: 20,
              color: "#373F51",
              fontFamily: "poppins",
              fontWeight: "semibold",
              letterSpacing: 0.26,
              fontSize: 20,
            }}
          >
            {importSuccess
              ? `Importação bem-\nsucedida! Comece seu\ninventário`
              : "Importe o arquivo da\ndemanda no formato\n.xlsx para iniciar a sua\ncoleta"}
          </Text>

          {/* Barra de progresso */}
          {loading && (
            <View
              style={{
                backgroundColor: "#373F51",
                height: 44,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#58A4B0",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  paddingRight: 8,
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontFamily: "poppins",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {progress}%
                </Text>
              </View>
            </View>
          )}

          {/* Botão PRINCIPAL (só para importar) */}
          {!importSuccess && !loading && (
            <TouchableOpacity
              onPress={handleMainButton}
              style={{
                backgroundColor: "#3A6F78",
                padding: 14,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
                marginBottom: 16,
                paddingLeft: 27,
              }}
            >
              <Text
                style={{
                  color: "#F9FBFD",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "600",
                  letterSpacing: 0.26,
                  fontFamily: "poppins",
                }}
              >
                Carregar Arquivo
              </Text>
            </TouchableOpacity>
          )}

          {/* Botões APÓS importação bem-sucedida */}
          {importSuccess && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
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
                    color: "#F9FBFD",
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: "600",
                    letterSpacing: 0.26,
                    fontFamily: "poppins",
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

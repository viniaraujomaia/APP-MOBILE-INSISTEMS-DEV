// app/camera/camera.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router"; // ADICIONE ESTA IMPORT
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeTouchEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";

const { width, height } = Dimensions.get("window");

type ScannedCodeType = {
  value: string;
  type: string;
} | null;

// Interface para o ativo da lista
interface Ativo {
  id: string;
  nome: string;
}

// Constantes para o AsyncStorage
const STORAGE_KEY = "@insistems:lista_ativos";

export default function CameraScreen() {
  const router = useRouter(); // ADICIONE ESTE HOOK
  const [scannedCode, setScannedCode] = useState<ScannedCodeType>(null);
  const [isManualScanActive, setIsManualScanActive] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [ativosLista, setAtivosLista] = useState<Ativo[]>([]);
  const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
  const [codigoEncontrado, setCodigoEncontrado] = useState<Ativo | null>(null);
  const [cameraActive, setCameraActive] = useState(true);

  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);

  // Carrega a lista do AsyncStorage quando o componente monta
  useEffect(() => {
    const carregarLista = async () => {
      try {
        const listaJson = await AsyncStorage.getItem(STORAGE_KEY);
        if (listaJson) {
          const lista = JSON.parse(listaJson);
          setAtivosLista(lista);
          console.log(`✅ Lista carregada: ${lista.length} itens`);
        } else {
          console.log("⚠️ Nenhuma lista encontrada no AsyncStorage");
          Alert.alert(
            "Aviso",
            "Nenhuma lista importada encontrada.\n\nPor favor, importe uma lista primeiro na tela principal.",
            [
              {
                text: "Voltar",
                onPress: () => router.push("/"), // NAVEGA PARA HOME
              },
            ],
          );
        }
      } catch (error) {
        console.error("❌ Erro ao carregar lista:", error);
      }
    };

    carregarLista();

    // Cleanup para desativar câmera quando sair da tela
    return () => {
      setCameraActive(false);
    };
  }, []);

  // Função para verificar se o código está na lista
  const verificarCodigoNaLista = (
    codigo: string,
  ): { encontrado: boolean; ativo?: Ativo } => {
    if (ativosLista.length === 0) {
      console.log("⚠️ Lista vazia, não é possível verificar");
      return { encontrado: false };
    }

    // Remove espaços e formata o código para comparação
    const codigoLimpo = codigo.trim().toUpperCase();

    console.log(`🔍 Verificando código: ${codigoLimpo}`);

    // Procura na lista de ativos
    const ativoEncontrado = ativosLista.find((ativo) => {
      const idAtivo = ativo.id.toUpperCase();
      const nomeAtivo = ativo.nome.toUpperCase();

      // Retorna true se:
      const encontrou =
        idAtivo === codigoLimpo ||
        idAtivo.includes(codigoLimpo) ||
        codigoLimpo.includes(idAtivo.split("-")[0]) ||
        nomeAtivo.includes(codigoLimpo);

      return encontrou;
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

  // Função para navegar para a tela de confirmação
  const navegarParaConfirmacao = (ativo: Ativo) => {
    console.log("🚀 Navegando para tela de confirmação...");

    // Prepara os dados para passar para a próxima tela
    const dadosAtivo = {
      id: ativo.id,
      nome: ativo.nome,
      codigoEscaneado: scannedCode?.value || "",
      tipoCodigo: scannedCode?.type || "unknown",
    };

    // Navega para a tela ConfirmItem com os parâmetros
    router.push({
      pathname: "/confirmItem/confirmItem",
      params: {
        ativo: JSON.stringify(dadosAtivo),
        dataHora: new Date().toISOString(),
      },
    });
  };

  // Função para ativar a varredura manual
  const activateManualScan = useCallback(() => {
    console.log("👆 Ativando modo de varredura manual...");
    setIsManualScanActive(true);

    // Desativa a varredura após 2 segundos
    setTimeout(() => {
      setIsManualScanActive(false);
      console.log("⏸️ Modo de varredura manual desativado.");
    }, 2000);
  }, []);

  // Manipulador de toque na tela com controle de foco
  const handleTap = async (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const { locationX, locationY } = event.nativeEvent;

    // 1. Ativa o scanner imediatamente para responsividade
    activateManualScan();

    // 2. Lida com o foco apenas se já não estiver focando
    if (!isFocusing && cameraRef.current && device?.supportsFocus) {
      setIsFocusing(true);
      try {
        await cameraRef.current.focus({ x: locationX, y: locationY });
      } catch (error: any) {
        console.log("Erro de foco (não crítico):", error.message);
      } finally {
        setTimeout(() => setIsFocusing(false), 500);
      }
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: [
      "qr",
      "ean-13",
      "ean-8",
      "upc-a",
      "upc-e",
      "code-128",
      "code-39",
      "itf",
      "code-93",
    ],
    onCodeScanned: (codes: Code[]) => {
      // Só processa se o modo manual estiver ATIVO
      if (!isManualScanActive) return;

      if (codes.length > 0) {
        const code = codes[0];
        const codigoValor = code.value || "";

        // Verifica se já está processando este código (evita duplicação)
        if (scannedCode && scannedCode.value === codigoValor) {
          console.log("⚠️ Código já processado, ignorando...");
          return;
        }

        console.log("✅ Código escaneado (Manual):", codigoValor);

        // Verifica se o código está na lista
        const resultado = verificarCodigoNaLista(codigoValor);

        setScannedCode({
          value: codigoValor,
          type: code.type || "unknown",
        });

        // Atualiza estado baseado na verificação
        setIsCodeValid(resultado.encontrado);
        setCodigoEncontrado(resultado.ativo || null);

        // Desativa a varredura imediatamente após sucesso
        setIsManualScanActive(false);

        // Se encontrou o item na lista, navega para tela de confirmação
        if (resultado.encontrado && resultado.ativo) {
          // Espera 1 segundo para mostrar o feedback visual antes de navegar
          setTimeout(() => {
            navegarParaConfirmacao(resultado.ativo!);
          }, 1000);
        } else {
          // Se não encontrou, apenas mostra o feedback por 5 segundos
          setTimeout(() => {
            setScannedCode(null);
            setIsCodeValid(null);
            setCodigoEncontrado(null);
          }, 5000);
        }
      }
    },
  });

  // 📱 Dispositivo não encontrado
  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>
          Câmera não encontrada.{"\n"}
          Verifique se seu dispositivo tem câmera traseira.
        </Text>
      </View>
    );
  }

  // ✅ Tudo ok - mostrar câmera
  return (
    <View style={styles.container} onTouchEnd={handleTap}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={cameraActive}
        codeScanner={isManualScanActive ? codeScanner : undefined}
        audio={false}
      />

      {/* Overlay do código escaneado - AGORA COM VERIFICAÇÃO */}
      {scannedCode && (
        <View
          style={[
            styles.overlay,
            isCodeValid === true
              ? styles.overlayValid
              : isCodeValid === false
                ? styles.overlayInvalid
                : styles.overlayNeutral,
          ]}
        >
          <Text style={styles.scannedText}>
            {isCodeValid === true
              ? "✅ "
              : isCodeValid === false
                ? "❌ "
                : "📷 "}
            Código: {scannedCode.value}
          </Text>
          <Text style={styles.typeText}>📊 Tipo: {scannedCode.type}</Text>

          {/* Mensagem de validação */}
          {isCodeValid === true && codigoEncontrado && (
            <View style={styles.validationContainer}>
              <Text style={styles.validationTextValid}>
                ✅ Item encontrado na lista!
              </Text>
              <Text style={styles.detailText}>ID: {codigoEncontrado.id}</Text>
              <Text style={styles.detailText}>
                Nome: {codigoEncontrado.nome}
              </Text>
              <Text style={styles.navigationText}>
                🚀 Indo para confirmação...
              </Text>
            </View>
          )}

          {isCodeValid === false && (
            <View style={styles.validationContainer}>
              <Text style={styles.validationTextInvalid}>
                ❌ Este item não está na lista
              </Text>
              <Text style={styles.detailText}>
                Verifique se o código está correto
              </Text>
            </View>
          )}

          {isCodeValid === null && (
            <Text style={styles.validationTextNeutral}>
              Verificando na lista...
            </Text>
          )}
        </View>
      )}

      {/* Contador de itens na lista */}
      <View style={styles.counterOverlay}>
        <Text style={styles.counterText}>
          📋 Itens na lista: {ativosLista.length}
        </Text>
        {ativosLista.length === 0 && (
          <Text style={styles.warningText}>⚠️ Importe uma lista primeiro!</Text>
        )}
      </View>

      {/* Botão de voltar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/home2")}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Instruções que mudam conforme o estado */}
      <View style={styles.instructionOverlay}>
        <Text style={styles.instructionText}>
          {isManualScanActive
            ? "📷 Lendo código..."
            : "👆 Toque na tela com o código para escanear"}
        </Text>
      </View>
    </View>
  );
}

// Adicione estes novos estilos
const TouchableOpacity = require("react-native").TouchableOpacity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  centerText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  overlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 100, 0, 0.85)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
  },
  overlayValid: {
    backgroundColor: "rgba(0, 100, 0, 0.85)",
    borderColor: "#4CAF50",
  },
  overlayInvalid: {
    backgroundColor: "rgba(139, 0, 0, 0.85)",
    borderColor: "#FF5252",
  },
  overlayNeutral: {
    backgroundColor: "rgba(0, 0, 100, 0.85)",
    borderColor: "#2196F3",
  },
  scannedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  typeText: {
    color: "#C8E6C9",
    fontSize: 14,
    marginBottom: 10,
  },
  validationContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    width: "100%",
    alignItems: "center",
  },
  validationTextValid: {
    color: "#C8E6C9",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  validationTextInvalid: {
    color: "#FFCDD2",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  validationTextNeutral: {
    color: "#BBDEFB",
    fontSize: 14,
    fontStyle: "italic",
  },
  detailText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  navigationText: {
    color: "#FFEB3B",
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },
  counterOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 150,
  },
  counterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  warningText: {
    color: "#FF9800",
    fontSize: 10,
    marginTop: 2,
    fontStyle: "italic",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  instructionOverlay: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

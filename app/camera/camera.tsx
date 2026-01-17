// app/camera/camera.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeTouchEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Camera,
  CameraRuntimeError,
  Code,
  useCameraDevice,
  useCameraPermission,
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
  const router = useRouter();
  const params = useLocalSearchParams<{ ambiente?: string }>();

  const [scannedCode, setScannedCode] = useState<ScannedCodeType>(null);
  const [isManualScanActive, setIsManualScanActive] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [ativosLista, setAtivosLista] = useState<Ativo[]>([]);
  const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
  const [codigoEncontrado, setCodigoEncontrado] = useState<Ativo | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ambiente, setAmbiente] = useState<string>("Geral");

  // Hook de permissão da Vision Camera
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera>(null);

  // Solicitar permissões e carregar lista
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        console.log("📱 Inicializando câmera...");

        // 1. Definir ambiente (se veio como parâmetro ou padrão "Geral")
        if (params.ambiente) {
          setAmbiente(params.ambiente.toString());
          console.log(`📍 Ambiente definido: ${params.ambiente}`);
        }

        // 2. Verificar e solicitar permissões
        if (!hasPermission) {
          console.log("🔒 Solicitando permissão da câmera...");
          const granted = await requestPermission();
          if (!granted) {
            Alert.alert(
              "Permissão necessária",
              "Precisamos da permissão para usar a câmera para escanear códigos.",
              [
                {
                  text: "Configurar",
                  onPress: () => router.back(),
                },
              ],
            );
            return;
          }
        }

        // 3. Carregar lista do AsyncStorage
        await carregarListaAtivos();

        // 4. Aguardar um pouco para garantir que tudo está carregado
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error("❌ Erro na inicialização:", error);
        setCameraError("Falha ao inicializar câmera");
        setIsLoading(false);
      }
    };

    initializeCamera();

    // Cleanup
    return () => {
      console.log("🔄 Desativando câmera...");
      setCameraActive(false);
    };
  }, [hasPermission]);

  // Função para carregar lista de ativos
  const carregarListaAtivos = async () => {
    try {
      const listaJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (listaJson) {
        const lista = JSON.parse(listaJson);
        setAtivosLista(lista);
        console.log(`✅ Lista carregada: ${lista.length} itens`);
      } else {
        console.log("⚠️ Nenhuma lista encontrada");
        Alert.alert(
          "Aviso",
          "Nenhuma lista importada encontrada.\n\nPor favor, importe uma lista primeiro na tela principal.",
          [
            {
              text: "Voltar",
              onPress: () => router.push("/"),
            },
          ],
        );
      }
    } catch (error) {
      console.error("❌ Erro ao carregar lista:", error);
    }
  };

  // Handler para erros da câmera
  const handleCameraError = useCallback(
    (error: CameraRuntimeError) => {
      console.error("❌ Erro na câmera:", error);
      setCameraError(error.message);

      Alert.alert(
        "Erro na Câmera",
        `Não foi possível iniciar a câmera: ${error.message}\n\nTente reiniciar o aplicativo.`,
        [
          {
            text: "Voltar",
            onPress: () => router.back(),
          },
        ],
      );
    },
    [router],
  );

  // Configuração do codeScanner (MAIS SIMPLES)
  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13", "code-128", "code-39"],
    onCodeScanned: (codes: Code[]) => {
      if (!isManualScanActive || codes.length === 0) return;

      const code = codes[0];
      const codigoValor = code.value || "";

      // Evitar processamento duplicado
      if (scannedCode && scannedCode.value === codigoValor) return;

      console.log("✅ Código escaneado:", codigoValor);

      setScannedCode({
        value: codigoValor,
        type: code.type || "unknown",
      });

      // Verificar se está na lista
      const resultado = verificarCodigoNaLista(codigoValor);
      setIsCodeValid(resultado.encontrado);
      setCodigoEncontrado(resultado.ativo || null);

      // Desativar scanner temporariamente
      setIsManualScanActive(false);

      // Navegar se encontrado
      if (resultado.encontrado && resultado.ativo) {
        setTimeout(() => {
          navegarParaConfirmacao(resultado.ativo!);
        }, 1000);
      } else {
        // Limpar após 3 segundos
        setTimeout(() => {
          setScannedCode(null);
          setIsCodeValid(null);
          setCodigoEncontrado(null);
        }, 3000);
      }
    },
  });

  // Função para verificar código na lista
  const verificarCodigoNaLista = (
    codigo: string,
  ): { encontrado: boolean; ativo?: Ativo } => {
    if (ativosLista.length === 0) {
      return { encontrado: false };
    }

    const codigoLimpo = codigo.trim().toUpperCase();

    const ativoEncontrado = ativosLista.find((ativo) => {
      const idAtivo = ativo.id.toUpperCase();
      return idAtivo === codigoLimpo || idAtivo.includes(codigoLimpo);
    });

    return ativoEncontrado
      ? { encontrado: true, ativo: ativoEncontrado }
      : { encontrado: false };
  };

  // Navegar para confirmação - AGORA COM AMBIENTE
  const navegarParaConfirmacao = (ativo: Ativo) => {
    const dadosAtivo = {
      id: ativo.id,
      nome: ativo.nome,
      codigoEscaneado: scannedCode?.value || "",
      tipoCodigo: scannedCode?.type || "unknown",
    };

    router.push({
      pathname: "/confirmItem/confirmItem",
      params: {
        ativo: JSON.stringify(dadosAtivo),
        dataHora: new Date().toISOString(),
        ambiente: ambiente, // ← AMBIENTE ADICIONADO AQUI
      },
    });
  };

  // Ativar varredura manual
  const activateManualScan = useCallback(() => {
    if (isLoading) return;

    console.log("👆 Ativando scanner...");
    setIsManualScanActive(true);

    setTimeout(() => {
      setIsManualScanActive(false);
    }, 2000);
  }, [isLoading]);

  // Handler de toque
  const handleTap = async (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const { locationX, locationY } = event.nativeEvent;

    activateManualScan();

    // Tentar foco
    if (!isFocusing && cameraRef.current && device?.supportsFocus) {
      setIsFocusing(true);
      try {
        await cameraRef.current.focus({ x: locationX, y: locationY });
      } catch (error) {
        console.log("Foco não disponível");
      } finally {
        setTimeout(() => setIsFocusing(false), 500);
      }
    }
  };

  // Tela de loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3A6F78" />
        <Text style={styles.loadingText}>Preparando câmera...</Text>
      </View>
    );
  }

  // Sem permissão
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permissão necessária</Text>
        <Text style={styles.permissionText}>
          Para escanear códigos, precisamos da permissão para usar a câmera.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Dispositivo não encontrado
  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>
          Câmera não disponível no dispositivo
        </Text>
      </View>
    );
  }

  // Erro na câmera
  if (cameraError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro na Câmera</Text>
        <Text style={styles.errorText}>{cameraError}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tela principal da câmera
  return (
    <View style={styles.container} onTouchEnd={handleTap}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={cameraActive}
        codeScanner={isManualScanActive ? codeScanner : undefined}
        audio={false}
        onError={handleCameraError}
        torch="off"
        zoom={device.neutralZoom}
        enableZoomGesture={false}
      />

      {/* Overlay do código escaneado */}
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

          {isCodeValid === true && codigoEncontrado && (
            <View style={styles.validationContainer}>
              <Text style={styles.validationTextValid}>
                ✅ Item encontrado na lista!
              </Text>
              <Text style={styles.detailText}>ID: {codigoEncontrado.id}</Text>
              <Text style={styles.detailText}>
                Nome: {codigoEncontrado.nome}
              </Text>
              <Text style={styles.detailText}>📍 Ambiente: {ambiente}</Text>
              <Text style={styles.navigationText}>
                🚀 Indo para confirmação...
              </Text>
            </View>
          )}

          {isCodeValid === false && (
            <View style={styles.validationContainer}>
              <Text style={styles.validationTextInvalid}>
                ❌ Item não está na lista
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Botão voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Instruções - AGORA MOSTRANDO AMBIENTE */}
      <View style={styles.instructionOverlay}>
        <Text style={styles.instructionText}>
          {isManualScanActive
            ? "📷 Lendo código..."
            : "👆 Toque na tela para escanear"}
        </Text>
        <Text style={styles.instructionSubtext}>
          {ativosLista.length} itens na lista | Ambiente: {ambiente}
        </Text>
      </View>

      {/* Indicador de foco */}
      {isFocusing && (
        <View style={styles.focusIndicator}>
          <View style={styles.focusCircle} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    padding: 30,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#3A6F78",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F8",
    padding: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#D32F2F",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: "#3A6F78",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
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
    marginBottom: 5,
  },
  instructionSubtext: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
  },
  focusIndicator: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  focusCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },
});

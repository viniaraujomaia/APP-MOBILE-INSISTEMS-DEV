import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    NativeSyntheticEvent,
    NativeTouchEvent,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Camera,
    Code,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');

type ScannedCodeType = {
    value: string;
    type: string;
} | null;

export default function App() {
    const [scannedCode, setScannedCode] = useState<ScannedCodeType>(null);
    const [isManualScanActive, setIsManualScanActive] = useState(false);
    const [isFocusing, setIsFocusing] = useState(false);

    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);


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
                // 'focus' retorna uma Promise
                await cameraRef.current.focus({ x: locationX, y: locationY });
            } catch (error: any) {
                // Tipamos o erro como 'any' para acessar '.message' com segurança
                console.log("Erro de foco (não crítico):", error.message);
            } finally {
                // Permite um novo pedido de foco após um pequeno atraso
                setTimeout(() => setIsFocusing(false), 500);
            }
        }
    };

    const codeScanner = useCodeScanner({
        codeTypes: [
            'qr',
            'ean-13',
            'ean-8',
            'upc-a',
            'upc-e',
            'code-128',
            'code-39',
            'itf',
            'code-93',
        ],
        onCodeScanned: (codes: Code[]) => {
            // Só processa se o modo manual estiver ATIVO
            if (!isManualScanActive) return;

            if (codes.length > 0) {
                const code = codes[0];
                console.log('✅ Código escaneado (Manual):', code.value);
                setScannedCode({
                    value: code.value || '',
                    type: code.type || 'unknown',
                });

                // Desativa a varredura imediatamente após sucesso
                setIsManualScanActive(false);
                // Resetar após 5 segundos
                setTimeout(() => {
                    setScannedCode(null);
                }, 5000);
            }
        },
    });

    // 📱 Dispositivo não encontrado
    if (!device) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.centerText}>
                    Câmera não encontrada.{'\n'}
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
                isActive={true}
                // Passa o scanner SOMENTE quando o modo manual estiver ativo
                codeScanner={isManualScanActive ? codeScanner : undefined}
            />

            {/* Overlay do código escaneado */}
            {scannedCode && (
                <View style={styles.overlay}>
                    <Text style={styles.scannedText}>
                        ✅ Código: {scannedCode.value}
                    </Text>
                    <Text style={styles.typeText}>
                        📊 Tipo: {scannedCode.type}
                    </Text>
                </View>
            )}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
    centerText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
    },
    overlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 100, 0, 0.85)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    scannedText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    typeText: {
        color: '#C8E6C9',
        fontSize: 14,
    },
    instructionOverlay: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    instructionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});
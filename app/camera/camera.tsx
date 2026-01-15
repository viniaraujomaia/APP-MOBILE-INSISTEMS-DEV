import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import {
    Camera,
    Code,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';


type ScannedCodeType = {
    value: string;
    type: string;
} | null;

export default function App() {
    const [isActive, setIsActive] = useState(true);
    const [scannedCode, setScannedCode] = useState<ScannedCodeType>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const device = useCameraDevice('back');
    const cameraRef = useRef<Camera>(null);

    // ✅ FLUXO CORRETO DE PERMISSÃO
    useEffect(() => {
        const checkAndRequestPermission = async () => {
            console.log("🔍 Iniciando verificação de permissão...");

            // 1. Verificar status atual da permissão
            const currentStatus = await Camera.getCameraPermissionStatus();
            console.log("📋 Status atual:", currentStatus);

            // Se já tem permissão
            if (currentStatus === 'granted') {
                console.log("✅ Permissão já concedida!");
                setHasPermission(true);
                return;
            }

            // Se foi negada anteriormente
            if (currentStatus === 'denied') {
                console.log("❌ Permissão negada anteriormente");
                setHasPermission(false);

                Alert.alert(
                    'Permissão Necessária',
                    'Você negou a permissão da câmera anteriormente. Para usar o scanner, permita o acesso à câmera nas configurações do app.',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Abrir Configurações',
                            onPress: () => Linking.openSettings()
                        }
                    ]
                );
                return;
            }

            // Se NUNCA foi solicitado (mostrar diálogo nativo)
            console.log("🔄 Solicitando permissão pela primeira vez...");
            const newPermission = await Camera.requestCameraPermission();
            console.log("🎯 Resposta do usuário:", newPermission);

            if (newPermission === 'granted') {
                console.log("🎉 Usuário aceitou!");
                setHasPermission(true);
            } else {
                console.log("😞 Usuário negou");
                setHasPermission(false);
            }
        };

        // Pequeno delay para garantir que o app está carregado
        setTimeout(() => {
            checkAndRequestPermission();
        }, 500);
    }, []);

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
            if (codes.length > 0) {
                const code = codes[0];
                console.log('✅ Código escaneado:', code.value);
                console.log('📊 Tipo:', code.type);
                setScannedCode({
                    value: code.value || '',
                    type: code.type || 'unknown',
                });

                // Resetar após 3 segundos
                setTimeout(() => {
                    setScannedCode(null);
                }, 3000);
            }
        },
    });

    // ⏳ Carregando/Verificando
    if (hasPermission === null) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.centerText}>Verificando permissões da câmera...</Text>
            </View>
        );
    }

    // ❌ Permissão negada
    if (!hasPermission) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.centerText}>
                    Permissão da câmera necessária.{'\n'}
                    Habilite nas configurações do app.
                </Text>
            </View>
        );
    }

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
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                codeScanner={codeScanner}
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

            {/* Instruções */}
            <View style={styles.instructionOverlay}>
                <Text style={styles.instructionText}>
                    📸 Aponte para um código QR ou de barras
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
// app/camera/camera.tsx - VERSÃO CORRIGIDA
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

export default function CameraScreen() {
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const camera = useRef<Camera>(null);
    const [isActive, setIsActive] = useState(true);

    // Configurar scanner de código
    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            console.log(`Scanned ${codes.length} codes!`);
            codes.forEach(code => {
                Alert.alert('Código Escaneado', `Valor: ${code.value}`);
            });
        },
    });

    useEffect(() => {
        // Solicitar permissão quando o componente montar
        if (!hasPermission) {
            requestPermission().then(granted => {
                if (!granted) {
                    Alert.alert(
                        'Permissão necessária',
                        'O app precisa de acesso à câmera para funcionar.',
                        [
                            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
                            { text: 'Cancelar', style: 'cancel' }
                        ]
                    );
                }
            });
        }
    }, [hasPermission]);

    if (!hasPermission) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Aguardando permissão da câmera...</Text>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Câmera não disponível</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                codeScanner={codeScanner}
                video={false}
                audio={false}
            />

            <View style={styles.overlay}>
                <View style={styles.scanArea} />
                <Text style={styles.instruction}>Posicione o código QR no quadrado</Text>
            </View>

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsActive(false)}
            >
                <Text style={styles.closeText}>Fechar Câmera</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'white',
        backgroundColor: 'transparent',
    },
    instruction: {
        color: 'white',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    closeButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    closeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    text: {
        color: 'white',
        fontSize: 18,
    }
});
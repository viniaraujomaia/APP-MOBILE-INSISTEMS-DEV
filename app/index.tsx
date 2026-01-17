// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImportModal from "./import/Import";

interface Ativo {
  id: string;
  nome: string;
}

const STORAGE_KEY = "@insistems:lista_ativos";
const FILE_NAME_KEY = "@insistems:file_name";

export default function Home() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [hasSavedList, setHasSavedList] = useState(false);
  const [savedFileName, setSavedFileName] = useState("");
  const [savedItemCount, setSavedItemCount] = useState(0);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const router = useRouter();

  // Carrega a lista salva quando a tela é aberta
  useEffect(() => {
    const checkAndNavigate = async () => {
      try {
        const listaJson = await AsyncStorage.getItem(STORAGE_KEY);
        const fileName = await AsyncStorage.getItem(FILE_NAME_KEY);

        if (listaJson) {
          const lista = JSON.parse(listaJson);
          setHasSavedList(true);
          setSavedItemCount(lista.length);
          setSavedFileName(fileName || "Lista salva");

          // Navega automaticamente para home2
          router.replace({
            pathname: "/home2",
            params: {
              ativos: listaJson,
              fileName: fileName || "Lista salva",
              total: lista.length.toString(),
            },
          });
        } else {
          setHasSavedList(false);
        }
      } catch (error) {
        console.error("Erro ao carregar lista salva:", error);
        setHasSavedList(false);
      } finally {
        setIsCheckingStorage(false);
      }
    };

    checkAndNavigate();
  }, []);

  // Função para limpar a lista salva
  const limparListaSalva = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(FILE_NAME_KEY);
      await AsyncStorage.removeItem("@insistems:import_date");

      // Também limpa as chaves do sistema de progresso
      await AsyncStorage.removeItem("@imported_items");
      await AsyncStorage.removeItem("@verified_items");
      await AsyncStorage.removeItem("@total_items");

      setHasSavedList(false);
      setSavedFileName("");
      setSavedItemCount(0);

      Alert.alert("Sucesso", "Lista salva foi removida");
    } catch (error) {
      console.error("Erro ao limpar lista:", error);
      Alert.alert("Erro", "Não foi possível limpar a lista salva");
    }
  };

  // Função chamada quando clica em "Prosseguir" no modal
  const handleProceed = async (ativos: Ativo[], fileName: string) => {
    try {
      console.log("💾 Salvando lista importada...");
      console.log("📊 Itens a salvar:", ativos.length);

      // 1. SALVA PARA O SISTEMA DE PROGRESSO (ContinueCollection)
      await AsyncStorage.setItem("@imported_items", JSON.stringify(ativos));
      await AsyncStorage.setItem("@verified_items", JSON.stringify([])); // Inicializa vazio
      await AsyncStorage.setItem("@total_items", ativos.length.toString());

      // 2. SALVA PARA O SEU FLUXO ATUAL (já existente)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ativos));
      await AsyncStorage.setItem(FILE_NAME_KEY, fileName);
      await AsyncStorage.setItem(
        "@insistems:import_date",
        new Date().toISOString(),
      );

      console.log("✅ Lista salva em TODAS as chaves!");

      // Atualiza o estado local
      setHasSavedList(true);
      setSavedItemCount(ativos.length);
      setSavedFileName(fileName);

      // Navega para home2
      router.replace({
        pathname: "/home2",
        params: {
          ativos: JSON.stringify(ativos),
          fileName: fileName,
          total: ativos.length.toString(),
        },
      });
    } catch (error: any) {
      console.error("❌ Erro ao salvar lista:", error);
      Alert.alert(
        "Erro",
        `Não foi possível salvar a lista importada: ${error.message}`,
      );
    }
  };

  // Se não tem lista salva, mostra a tela Home normal
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E6F0F2" }}>
      <StatusBar backgroundColor="#3A6F78" barStyle="light-content" />

      {/* HEADER */}
      <View
        style={{
          backgroundColor: "#3A6F78",
          paddingHorizontal: 20,
          paddingTop: 40,
          paddingBottom: 15,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <Text
          style={{
            color: "#F4F7FB",
            fontSize: 24,
            textAlign: "center",
            fontFamily: "poppins-semibold",
            fontStyle: "normal",
            fontWeight: 600,
            letterSpacing: 0.312,
          }}
        >
          Inventário Inteligente
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
          paddingTop: 30,
          paddingLeft: 34,
          paddingRight: 34,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: "poppins",
              fontSize: 32,
              fontWeight: "medium",
              marginBottom: 10,
              color: "#373F51",
              letterSpacing: 0.416,
            }}
          >
            Inicie{"\n"}a sua coleta
          </Text>

          <Text
            style={{
              fontSize: 20,
              opacity: 0.7,
              marginBottom: 30,
              lineHeight: 28,
            }}
          >
            Importe o arquivo da lista de{"\n"}demandas para iniciar o seu{"\n"}
            inventário
          </Text>

          {/* Botão Importar Lista */}
          <TouchableOpacity
            onPress={() => setShowImportModal(true)}
            style={{
              backgroundColor: "#3A6F78",
              padding: 17,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#F4F7FB",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Importar Lista
            </Text>
          </TouchableOpacity>

          {/* Botão Continuar Coleta (desativado porque não tem lista) */}
          <TouchableOpacity
            disabled
            style={{
              backgroundColor: "#FFF",
              padding: 17,
              marginBottom: 24,
              opacity: 0.6,
              borderWidth: 1,
              borderColor: "#A4A4A4",
              borderStyle: "solid",
            }}
          >
            <Text
              style={{
                color: "#3A6F78",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Continuar Coleta
            </Text>
          </TouchableOpacity>

          {/* Botão Relatórios (desativado) */}
          <TouchableOpacity
            disabled
            style={{
              backgroundColor: "#FFF",
              padding: 17,
              marginBottom: 24,
              opacity: 0.6,
              borderWidth: 1,
              borderColor: "#A4A4A4",
              borderStyle: "solid",
            }}
          >
            <Text
              style={{
                color: "#3A6F78",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Relatórios
            </Text>
          </TouchableOpacity>

          {/* Botão Gerenciar Ambientes */}
          <Link href="/rooms" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: "#3A6F78",
                padding: 17,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: "#F4F7FB",
                  textAlign: "center",
                  fontSize: 20,
                  fontFamily: "poppins",
                  fontWeight: "semibold",
                  letterSpacing: 0.26,
                }}
              >
                Gerenciar Ambientes
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Rodapé */}
        <Text
          style={{
            opacity: 0.5,
            textAlign: "center",
            fontSize: 14,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          INSISTEMS - Inventário Inteligente - v1.0
        </Text>

        {/* Modal de importação */}
        <ImportModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
          onProceed={handleProceed}
        />
      </View>
    </SafeAreaView>
  );
}

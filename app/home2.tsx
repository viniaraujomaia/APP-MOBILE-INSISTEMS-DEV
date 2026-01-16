// app/home2.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Ativo {
  id: string;
  nome: string;
}

const STORAGE_KEY = "@insistems:lista_ativos";
const FILE_NAME_KEY = "@insistems:file_name";

export default function Home2() {
  const router = useRouter();
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carrega do AsyncStorage
        console.log("Carregando do AsyncStorage...");
        const listaJson = await AsyncStorage.getItem(STORAGE_KEY);
        const storedFileName = await AsyncStorage.getItem(FILE_NAME_KEY);

        if (listaJson) {
          const ativosArray = JSON.parse(listaJson);
          setAtivos(ativosArray);
          setFileName(storedFileName || "Lista salva");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
            fontFamily: "poppins",
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
          backgroundColor: "#E6F0F2",
          padding: 20,
          paddingTop: 45,
          paddingHorizontal: 34,
          paddingBottom: 80, // Espaço para o footer
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "500",
              marginBottom: 10,
              fontFamily: "poppins",
              color: "#373F51",
              letterSpacing: 0.416,
            }}
          >
            Coleta em{"\n"}andamento
          </Text>

          <Text
            style={{
              fontSize: 20,
              marginBottom: 30,
              fontFamily: "poppins",
              fontWeight: 500,
              letterSpacing: 0.26,
              color: "#373F51",
            }}
          >
            Crie ambientes para{"\n"}organizar e transferir dados{"\n"}mais
            facilmente
          </Text>

          {/*importar lista desativado*/}
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
              Importar Lista
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/continue-collection")}
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
              Continuar Coleta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/reports")}
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
              Relatórios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/rooms")}
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

          {/* Botão para voltar e limpar lista */}
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem(STORAGE_KEY);
              await AsyncStorage.removeItem(FILE_NAME_KEY);
              router.push("/");
            }}
            style={{
              backgroundColor: "#FF6B6B",
              padding: 17,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                textAlign: "center",
                fontSize: 20,
                fontFamily: "poppins",
                fontWeight: "semibold",
                letterSpacing: 0.26,
              }}
            >
              Limpar Lista e Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER FIXO COM 3 BOTÕES */}
      <View
        style={{
          backgroundColor: "#3A6F78",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 10,
          // Para ficar fixo na parte inferior
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {/* Botão 1 - Início */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.push("/compare")}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Pesquisa
          </Text>
        </TouchableOpacity>

        {/* Botão 2 - Coletas */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => {
            // Se já está na tela de coletas, apenas faz nada ou recarrega
            console.log("Coletas pressionado");
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Botão 3 - Perfil */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flex: 1,
            marginHorizontal: 5,
            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.push("/camera/camera")}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

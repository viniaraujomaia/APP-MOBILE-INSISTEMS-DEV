// importacoes
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//componente principal
export default function Home2() {
  //router para navegacao
  const router = useRouter();

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
          elevation: 4, // Sombra para Android
          shadowColor: "#000", // Sombra para iOS
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

      {/* CONTEÚDO PRINCIPAL */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#E6F0F2",
          padding: 20,
          paddingTop: 45,
          paddingHorizontal: 34,
          paddingBottom: 80, // Adicionado espaço para o footer não cobrir conteúdo
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

        {/* Texto do rodapé removido e substituído pelo footer abaixo */}
      </View>

      {/* FOOTER FIXO COM 3 BOTÕES */}
      <View
        style={{
          backgroundColor: "#3A6F78",
          borderTopWidth: 1,
          borderTopColor: "#3A6F78",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",

          // Para ficar fixo na parte inferior
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          top: 900,
        }}
      >
        {/* Botão 1 - Início */}
        <TouchableOpacity
          style={{
            alignItems: "center",

            paddingVertical: 8,
            flex: 1,

            backgroundColor: "#3A6F78",
          }}
          onPress={() => router.push("/")} // Navega para a home
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "600",
              fontFamily: "poppins",
            }}
          >
            Início
          </Text>
        </TouchableOpacity>

        {/* Botão 2 - home */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingVertical: 8,
            flex: 1,

            backgroundColor: "#3A6F78",
          }}
          onPress={() => {
            // Se já está na tela de coletas, podemos apenas rolar para o topo
            // ou navegar para uma tela específica de coletas
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
            home
          </Text>
        </TouchableOpacity>

        {/* Botão 3 - camera */}
        <TouchableOpacity
          style={{
            alignItems: "center",

            paddingVertical: 8,
            flex: 1,

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
            camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Texto da versão no rodapé (opcional - pode remover se quiser) */}
      <View
        style={{
          position: "absolute",
          bottom: 70, // Acima do footer
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      ></View>
    </SafeAreaView>
  );
}

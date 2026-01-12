// app/index.tsx
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ImportModal from "./import/Import";

interface Ativo {
  id: string;
  nome: string;
}

export default function Home() {
  const [showImportModal, setShowImportModal] = useState(false);
  const router = useRouter();

  // Função chamada quando clica em "Prosseguir" no modal
  const handleProceed = (ativos: Ativo[], fileName: string) => {
    console.log("Navegando para home2 com:", ativos.length, "itens");

    router.push({
      pathname: "/home2",
      params: {
        ativos: JSON.stringify(ativos),
        fileName: fileName,
        total: ativos.length.toString(),
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#E6F0F2",
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
          Inicie a sua coleta
        </Text>

        <Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 30 }}>
          Importe o arquivo da lista de demandas para iniciar o seu inventário
        </Text>

        {/* Botão Importar Lista */}
        <TouchableOpacity
          onPress={() => setShowImportModal(true)}
          style={{
            backgroundColor: "#3A6F78",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
            Importar Lista
          </Text>
        </TouchableOpacity>

        {/* Botão Continuar Coleta (desativado) */}
        <TouchableOpacity
          disabled
          style={{
            backgroundColor: "#FFF",
            padding: 16,
            marginBottom: 12,
            opacity: 0.6,
            borderWidth: 1,
            borderColor: "#3A6F78",
          }}
        >
          <Text style={{ color: "#3A6F78", textAlign: "center", fontSize: 16 }}>
            Continuar Coleta
          </Text>
        </TouchableOpacity>

        {/* Botão Relatórios (desativado) */}
        <TouchableOpacity
          disabled
          style={{
            backgroundColor: "#FFF",
            padding: 16,
            marginBottom: 12,
            opacity: 0.6,
            borderWidth: 1,
            borderColor: "#3A6F78",
          }}
        >
          <Text style={{ color: "#3A6F78", textAlign: "center", fontSize: 16 }}>
            Relatórios
          </Text>
        </TouchableOpacity>

        {/* Botão Gerenciar Ambientes */}
        <Link href="/rooms" asChild>
          <TouchableOpacity
            style={{
              backgroundColor: "#3A6F78",
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#FFF", textAlign: "center", fontSize: 16 }}>
              Gerenciar Ambientes
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Rodapé */}
      <Text
        style={{
          flex: 0.2,
          opacity: 0.5,
          textAlign: "center",
          fontSize: 14,
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
  );
}

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ReportsPage() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7F9" }}>
      {/* Cabeçalho */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
          paddingTop: 50,
        }}
      >
        {/* Botão de voltar */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: "Poppins",
            marginLeft: 100,
            fontSize: 20,
            fontWeight: "500",
          }}
        >
        Relatórios
        </Text>
      </View>

      {/* Conteúdo */}
      <View style={{ paddingHorizontal: 27 }}>
        <Text
          style={{
            fontFamily: "Poppins",
            fontSize: 32,
            fontWeight: "600",
            marginTop: 10,
            letterSpacing: 0.416,
          }}
        >
          Relatórios
        </Text>

        <Text
          style={{
            color: "#6B7280",
            marginBottom: 20,
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: 0.26,
          }}
        >
          Acesse os relatórios anteriores
        </Text>

        {/* Lista de relatórios */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {Array.from({ length: 6 }).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={{
                borderWidth: 1,
                borderColor: "#9DB6C1",
                padding: 14,
                borderRadius: 2,
                marginBottom: 12,
                backgroundColor: "#FFF",
              }}
            >
              <Text style={{ color: "#4B5563" }}>Data da conclusão</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

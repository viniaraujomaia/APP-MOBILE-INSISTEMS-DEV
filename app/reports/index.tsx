import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ReportsPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7F9" }}>

      {/* Cabeçalho */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
        }}
      >
        {/* Botão de voltar */}
        {/*<TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity> 

        <Text
          style={{
            marginLeft: 12,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Relatórios
        </Text> */} 
      </View>

      {/* Conteúdo */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          Relatórios
        </Text>

        <Text
          style={{
            color: "#6B7280",
            marginBottom: 20,
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
              <Text style={{ color: "#4B5563" }}>
                Data da conclusão
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

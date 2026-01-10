import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ContinueCollection() {
  const environments = ["Geral", "Sala 01", "Sala 02", "Sala 03", "Sala 04"];

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      
      {/* título */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Continuar Coleta
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Seu Progresso
      </Text>

      {/* barra de progresso fake */}
      <View style={{ height: 10, backgroundColor: "#DDD", marginBottom: 10 }}>
        <View
          style={{
            width: "20%",
            height: "100%",
            backgroundColor: "#3A6F78",
          }}
        />
      </View>

      <Text style={{ marginBottom: 20 }}>
        1014 itens já foram verificados nesta coleta
      </Text>

      {/* botão comparar itens sem plaqueta */}
     <TouchableOpacity
  onPress={() => router.push("/compare")} /*tá dando conflito entre o router e tipagem, pois /compare/index não está funcionando, vou deixar assim que funciona. */
  style={{
    backgroundColor: "#3A6F78",
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  }}
>
  <Text style={{ color: "#FFF", fontWeight: "bold" }}>
    Comparar itens sem plaqueta
  </Text>
</TouchableOpacity>


      {/* lista de ambientes */}
      <ScrollView>
        {environments.map((env) => (
          <TouchableOpacity
            key={env}
            onPress={() => router.push(`/rooms/${env}`)}
            style={{
              backgroundColor: "#FFF",
              padding: 14,
              borderWidth: 1,
              borderColor: "#CCC",
              marginBottom: 10,
            }}
          >
            <Text>{env}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

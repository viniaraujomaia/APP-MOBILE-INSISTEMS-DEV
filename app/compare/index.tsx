import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompareIndex() {
  const items = [
    "Mesa de Computador",
    "Desktop",
    "Mesa de gabinete",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      
      {/* título */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Comparar Itens
      </Text>

      {/* pesquisar */}
      <TextInput
        placeholder="Pesquisar item"
        style={{
          backgroundColor: "#3A6F78",
          color: "#FFF",
          padding: 12,
          marginBottom: 15,
        }}
        placeholderTextColor="#EEE"
      />

      {/* lista */}
      <ScrollView>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push("/compare/details")}
            style={{
              backgroundColor: "#FFF",
              borderWidth: 1,
              borderColor: "#3A6F78",
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ContinueCollection() {
  const environments = ["Geral", "Sala 01", "Sala 02", "Sala 03", "Sala 04"];

  // Estados apenas para o progresso
  const [importedItems, setImportedItems] = useState<any[]>([]);
  const [verifiedItems, setVerifiedItems] = useState<any[]>([]);

  // Função para carregar dados
  const loadData = useCallback(async () => {
    try {
      // 1. Carrega itens importados
      const importedJson = await AsyncStorage.getItem(
        "@insistems:lista_ativos",
      );
      if (importedJson) {
        const items = JSON.parse(importedJson);
        setImportedItems(items);
      } else {
        setImportedItems([]);
      }

      // 2. Carrega itens verificados
      const verifiedJson = await AsyncStorage.getItem("@verified_items");
      if (verifiedJson) {
        const items = JSON.parse(verifiedJson);
        setVerifiedItems(items);
      } else {
        setVerifiedItems([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  // Carregar dados quando a tela é montada
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualizar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Cálculos do progresso
  const totalItems = importedItems.length;
  const verifiedCount = verifiedItems.length;
  const progressPercentage =
    totalItems > 0 ? (verifiedCount / totalItems) * 100 : 0;

  // Texto dinâmico do progresso
  const getProgressText = () => {
    if (totalItems === 0) return "Importe uma lista primeiro";
    if (verifiedCount === 0) return `Nenhum item verificado de ${totalItems}`;
    if (verifiedCount === totalItems)
      return `🎉 Todos os ${totalItems} itens verificados!`;
    return `${verifiedCount} de ${totalItems} itens já foram verificados`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      {/* título */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Continuar Coleta
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>Seu Progresso</Text>

      {/* BARRA DE PROGRESSO DINÂMICA */}
      <View style={{ height: 10, backgroundColor: "#DDD", marginBottom: 10 }}>
        <View
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            backgroundColor: progressPercentage === 100 ? "#4CAF50" : "#3A6F78",
          }}
        />
      </View>

      {/* Texto dinâmico do progresso */}
      <Text style={{ marginBottom: 20 }}>{getProgressText()}</Text>

      {/* botão comparar itens sem plaqueta */}
      <TouchableOpacity
        onPress={() => router.push("/compare")}
        style={{
          backgroundColor:
            totalItems === 0 || verifiedCount === 0 ? "#9E9E9E" : "#3A6F78",
          padding: 14,
          alignItems: "center",
          marginBottom: 20,
        }}
        disabled={totalItems === 0 || verifiedCount === 0}
      >
        <Text style={{ color: "#FFF", fontWeight: "bold" }}>
          {verifiedCount === 0
            ? "Verifique alguns itens primeiro"
            : "Comparar itens sem plaqueta"}
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

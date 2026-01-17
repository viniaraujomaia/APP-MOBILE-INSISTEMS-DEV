import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Constantes (MESMAS DAS SALAS)
const LISTA_ATIVOS_KEY = "@insistems:lista_ativos";
const LISTA_VERIFICADOS_KEY = "@insistems:lista_verificados";

export default function ContinueCollection() {
  const environments = ["Geral", "Sala 01", "Sala 02", "Sala 03", "Sala 04"];

  // Estados para o progresso GERAL (todas as salas juntas)
  const [progressoGeral, setProgressoGeral] = useState({
    total: 0,
    verificados: 0,
    porcentagem: 0,
  });

  // Função para calcular progresso de TODAS as salas
  const calcularProgressoGeral = useCallback(async () => {
    try {
      // 1. Carrega lista de ativos
      const listaJson = await AsyncStorage.getItem(LISTA_ATIVOS_KEY);
      const listaAtivos = listaJson ? JSON.parse(listaJson) : [];

      // 2. Carrega itens verificados
      const verificadosJson = await AsyncStorage.getItem(LISTA_VERIFICADOS_KEY);
      const listaVerificados = verificadosJson
        ? JSON.parse(verificadosJson)
        : [];

      // 3. Calcula totais GERAIS
      const totalGeral = listaAtivos.length;
      const verificadosGeral = listaVerificados.length;
      const porcentagemGeral =
        totalGeral > 0 ? (verificadosGeral / totalGeral) * 100 : 0;

      setProgressoGeral({
        total: totalGeral,
        verificados: verificadosGeral,
        porcentagem: Math.min(porcentagemGeral, 100),
      });
    } catch (error) {
      console.error("Erro ao calcular progresso geral:", error);
    }
  }, []);

  // Carregar progresso quando a tela é montada
  useEffect(() => {
    calcularProgressoGeral();
  }, [calcularProgressoGeral]);

  // Atualizar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      calcularProgressoGeral();
    }, [calcularProgressoGeral]),
  );

  // Texto dinâmico do progresso GERAL
  const getProgressText = () => {
    const { total, verificados } = progressoGeral;

    if (total === 0) return "Importe uma lista primeiro";
    if (verificados === 0) return `Nenhum item verificado de ${total}`;
    if (verificados === total) return `🎉 Todos os ${total} itens verificados!`;
    return `${verificados} de ${total} itens já foram verificados`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      {/* título */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Continuar Coleta
      </Text>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Seu Progresso Geral
      </Text>

      {/* BARRA DE PROGRESSO GERAL */}
      <View style={{ height: 10, backgroundColor: "#DDD", marginBottom: 10 }}>
        <View
          style={{
            width: `${progressoGeral.porcentagem}%`,
            height: "100%",
            backgroundColor:
              progressoGeral.porcentagem === 100 ? "#4CAF50" : "#3A6F78",
          }}
        />
      </View>

      {/* Texto dinâmico do progresso GERAL */}
      <Text style={{ marginBottom: 20 }}>{getProgressText()}</Text>

      {/* botão comparar itens sem plaqueta */}
      <TouchableOpacity
        onPress={() => router.push("/compare")}
        style={{
          backgroundColor:
            progressoGeral.total === 0 || progressoGeral.verificados === 0
              ? "#9E9E9E"
              : "#3A6F78",
          padding: 14,
          alignItems: "center",
          marginBottom: 20,
        }}
        disabled={
          progressoGeral.total === 0 || progressoGeral.verificados === 0
        }
      >
        <Text style={{ color: "#FFF", fontWeight: "bold" }}>
          {progressoGeral.verificados === 0
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

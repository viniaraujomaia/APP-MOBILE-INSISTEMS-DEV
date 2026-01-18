import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// propriedades recebidas pelo card
interface Props {
  room: string; // nome do ambiente
  onEdit: (room: string) => void; // ação de editar
  onDelete: (room: string) => void; // ação de excluir
}

export function RoomCard({ room, onEdit, onDelete }: Props) {
  // controla se o card está expandido ou não
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      {/* ÁREA PRINCIPAL DO CARD */}
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.8}
        // navega para a tela do ambiente
        onPress={() => router.push(`/rooms/${room}`)}
      >
        {/* Nome do ambiente */}
        <Text style={styles.cardTitle}>{room}</Text>

        {/* BOTÃO DA SETA (expandir / recolher) */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.arrowButton}
          hitSlop={10}
        >
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#FFF"
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* AÇÕES (EDITAR / EXCLUIR) */}
      {expanded && (
        <View style={styles.actions}>
          {/* Botão Editar */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(room)}
          >
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          {/* Botão Excluir */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(room)}
          >
            <Text style={styles.actionText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// estilos do card
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 0,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // cabeçalho do card (área clicável principal)
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#3A6F78",
  },

  // título do ambiente
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  // área dos botões editar / excluir
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    gap: 2, // espaço entre os botões
  },

  // botão editar
  editButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#3A6F78",
    alignItems: "center",
  },

  // botão excluir
  deleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#D64545",
    alignItems: "center",
  },

  // texto dos botões de ação
  actionText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  // botão da seta
  arrowButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#FFF",
    backgroundColor: "#3A6F78", // quadrado ao redor do botão
    justifyContent: "center",
    alignItems: "center",
  },
});

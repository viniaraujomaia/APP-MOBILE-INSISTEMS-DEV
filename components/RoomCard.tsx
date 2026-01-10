import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  room: string;
  onEdit: (room: string) => void;
  onDelete: (room: string) => void;
}

export function RoomCard({ room, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      {/* ÁREA PRINCIPAL DO CARD */}
      <TouchableOpacity
        style={styles.cardHeader}
        activeOpacity={0.8}
        onPress={() => router.push(`/rooms/${room}`)}
      >
        <Text style={styles.cardTitle}>{room}</Text>

        {/* BOTÃO DA SETA */}
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
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(room)}
          >
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#3A6F78",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
  flexDirection: "row",
  borderTopWidth: 1,
  borderColor: "#eee",
  gap: 2, // espaço entre os botões
  },
  editButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#3A6F78",
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#D64545",
    alignItems: "center",
  },
  actionText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  arrowButton: {
  width: 32,
  height: 32,
  borderWidth: 1,
  borderColor: "#FFF",
  backgroundColor: "#3A6F78", /*(quadrado ao retor do botão ^*/
  justifyContent: "center",
  alignItems: "center",
},
});

import { Link } from "expo-router"; //para navegação entre telas
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function RoomCard({ room, onEdit, onDelete }) {
  const [showOptions, setShowOptions] = useState(false); //controle de exibição das opções extras

  return (
    <View style={styles.card}>
      {/*cabeçalho do card: nome do ambiente e botão de opções*/}
      <View style={styles.header}>
        <Text style={styles.roomName}>{room}</Text>
        <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
          <Text style={styles.optionsIcon}>=</Text>
        </TouchableOpacity>
      </View>

      {/*botão para abrir ambiente*/}
      <View style={{ marginTop: 10 }}>
        <Link href={`/rooms/${room}`} asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.buttonText}>Abrir Ambiente</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/*opções extras exibidas ao clicar no botão de opções*/}
      {showOptions && (
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { marginBottom: 10 }]}
            onPress={() => onEdit(room)}
          >
            <Text style={styles.buttonText}>Editar Ambiente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => onDelete(room)}>
            <Text style={styles.cancelButtonText}>Excluir Ambiente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

//estilos do card do ambiente
const styles = StyleSheet.create({
  card: { //card branco com bordas arredondadas e sombra
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },

    cardAbrirAmbiente: { //card branco com bordas arredondadas e sombra
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#3A6F78",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  header: { //linha do cabeçalho: nome + opções
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomName: { //nome do ambiente
    fontSize: 18,
    fontWeight: "bold",
  },
  optionsIcon: { //ícone de opções
    fontSize: 28,
    fontWeight: "bold",
    color: "#888",
  },
  primaryButton: { //botão principal (abrir/editar)
    backgroundColor: "#3A6F78",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { //texto dos botões principais
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: { //botão de cancelar/excluir
    backgroundColor: "#D64545",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: { //texto do botão cancelar/excluir
    color: "#ffffffff",
    fontSize: 16,
  },
});

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RoomCard } from "../../components/RoomCard";

export default function Home() {
  const router = useRouter();

  // ===== ESTADOS PRINCIPAIS =====
  const [rooms, setRooms] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null); // ambiente em edição
  const [editValue, setEditValue] = useState(""); // novo nome
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showModal, setShowModal] = useState(false); // modal para novo ambiente
  const [newRoom, setNewRoom] = useState(""); // nome do novo ambiente
  const [addError, setAddError] = useState(""); // erro de validação ao adicionar

  // ===== CARREGA AMBIENTES =====
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    const raw = await AsyncStorage.getItem("rooms");
    setRooms(raw ? JSON.parse(raw) : []);
  };

  // ===== ADICIONAR AMBIENTE =====
  const addRoom = async () => {
    const name = newRoom.trim();
    if (!name) return setAddError("O nome do ambiente não pode ser vazio.");
    if (rooms.includes(name))
      return setAddError("Esse ambiente já está registrado.");

    const updated = [...rooms, name];
    await AsyncStorage.setItem("rooms", JSON.stringify(updated));
    setNewRoom("");
    setAddError("");
    setShowModal(false);
    loadRooms();
  };

  // ===== INICIAR EDIÇÃO =====
  const startEditing = (room: string) => {
    setEditing(room);
    setEditValue(room);
  };

  // ===== SALVAR EDIÇÃO =====
  const saveEdit = async () => {
    if (!editing) return;

    const newName = editValue.trim();
    if (!newName) return;

    if (rooms.includes(newName) && newName !== editing) return;

    const updatedRooms = rooms.map((r) => (r === editing ? newName : r));

    const rawItems = await AsyncStorage.getItem(`items-${editing}`);
    if (rawItems) {
      await AsyncStorage.setItem(`items-${newName}`, rawItems);
      await AsyncStorage.removeItem(`items-${editing}`);
    }

    await AsyncStorage.setItem("rooms", JSON.stringify(updatedRooms));
    setEditing(null);
    loadRooms();
  };

  // ===== EXCLUIR AMBIENTE =====
  const deleteRoom = async () => {
    if (!deleting) return;

    const updated = rooms.filter((r) => r !== deleting);
    await AsyncStorage.setItem("rooms", JSON.stringify(updated));
    await AsyncStorage.removeItem(`items-${deleting}`);
    setDeleting(null);
    setConfirmDelete(false);
    loadRooms();
  };

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 15,
          paddingTop: 50,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "500" }}>
            Gerenciar Ambientes
          </Text>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <View style={{ paddingHorizontal: 27, flex: 1 }}>
        <Text style={{ fontSize: 32, fontWeight: "600", marginTop: 20 }}>
          Ambientes
        </Text>

        {/* BOTÃO NOVO AMBIENTE */}
        <TouchableOpacity
          style={[styles.primaryButton, { marginTop: 24 }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buttonText}>Novo Ambiente</Text>
        </TouchableOpacity>

        {/* ===== MODAL NOVO AMBIENTE ===== */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Novo Ambiente</Text>

              <TextInput
                placeholder="Nome do Ambiente"
                value={newRoom}
                onChangeText={(v) => {
                  setNewRoom(v);
                  setAddError("");
                }}
                style={styles.input}
              />

              {addError && <Text style={styles.errorText}>{addError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={addRoom}
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ===== MODAL EDITAR AMBIENTE ===== */}
        <Modal visible={!!editing} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Editar Ambiente</Text>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditing(null)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={saveEdit}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ===== MODAL EXCLUIR AMBIENTE ===== */}
        <Modal visible={!!deleting} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Ionicons
                name={confirmDelete ? "alert-circle-outline" : "trash-outline"}
                size={36}
                color="#D64545"
                style={{ alignSelf: "center", marginBottom: 10 }}
              />

              <Text style={{ textAlign: "center", fontSize: 20 }}>
                Excluir {deleting}
              </Text>

              <Text
                style={[
                  styles.deleteWarning,
                  confirmDelete && { color: "#D64545", fontWeight: "600" },
                ]}
              >
                {!confirmDelete
                  ? "Deseja excluir esse ambiente?"
                  : "Os itens deste ambiente serão movidos para a sala geral.\nExcluir mesmo assim?"}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setDeleting(null);
                    setConfirmDelete(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() =>
                    confirmDelete ? deleteRoom() : setConfirmDelete(true)
                  }
                >
                  <Text style={styles.modalButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* LISTA DE AMBIENTES */}
        <ScrollView style={{ flex: 1, marginTop: 20 }}>
          {rooms.map((room, i) => (
            <RoomCard
              key={i}
              room={room}
              onEdit={startEditing}
              onDelete={() => setDeleting(room)}
            />
          ))}
        </ScrollView>

        {/* BOTÃO DE IMPLEMENTAÇÕES PARA DEPOIS 
        <View style={{ marginTop: 25, flex: 0.1 }}>
          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>Implementações a posteriori</Text>
            </TouchableOpacity>
          </Link> 
        </View>*/}
      </View>
    </View>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#3A6F78",
    padding: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#D64545",
    padding: 12,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#3A6F78",
    padding: 12,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
  deleteWarning: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 15,
  },
  errorText: { color: "red", marginBottom: 10 },
});

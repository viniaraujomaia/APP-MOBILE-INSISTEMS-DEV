//salva e le dados localmente
import AsyncStorage from "@react-native-async-storage/async-storage";

//navegacao e parametros da rota
import { router, useLocalSearchParams } from "expo-router";

//icones
import { Ionicons } from "@expo/vector-icons";

//react e hooks
import React, { useEffect, useState } from "react";

//componentes nativos
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//tela do ambiente
export default function roompage() {
  //nome do ambiente vindo da rota
  const { room } = useLocalSearchParams<{ room: string }>();

  //lista de itens cadastrados
  const [items, setItems] = useState<string[][]>([]);

  //controla qual item esta expandido
  const [expandedindex, setExpandedindex] = useState<number | null>(null);

  //campos do novo item
  const [newcode, setNewcode] = useState("");
  const [newname, setNewname] = useState("");
  const [newtype, setNewtype] = useState("");

  //controla exibicao do formulario manual
  const [showmanual, setShowmanual] = useState(false);

  //carrega itens ao entrar na tela
  useEffect(() => {
    loaditems();
  }, []);

  //carrega itens do asyncstorage
  const loaditems = async () => {
    const raw = await AsyncStorage.getItem(`items-${room}`);
    setItems(raw ? JSON.parse(raw) : []);
  };

  //adiciona novo item
  const additem = async () => {
    if (!newcode || !newname || !newtype) return;

    const updated = [...items, [newcode, newname, newtype]];
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));

    setNewcode("");
    setNewname("");
    setNewtype("");
    setShowmanual(false);

    loaditems();
  };

  //exclui item pelo indice
  const deleteitem = async (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    await AsyncStorage.setItem(`items-${room}`, JSON.stringify(updated));
    setExpandedindex(null);
    loaditems();
  };

  return (
    <View style={styles.container}>
      {/*cabecalho*/}
      <View style={styles.header}>
       {/* <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity> 

        <Text style={styles.headerTitle}>{room}</Text> CÓDIGO DO BOTÃO DE VOLTAR*/}

       {/* <Ionicons name="help-circle-outline" size={22} color="#3a6f78" /> CÓDIGO DO BOTÃO DE HELP (?) */}
      </View>

      {/*titulo do progresso*/}
      <Text style={styles.sectionTitle}>Seu progresso</Text>

      {/*barra de progresso*/}
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      {/*texto do progresso*/}
      <Text style={styles.progressText}>
        {items.length} itens já foram verificados neste ambiente
      </Text>

      {/*botoes principais*/}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowmanual(!showmanual)}
        >
          <Ionicons name="create-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Novo item</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="camera-outline" size={50} color="#fff" />
          <Text style={styles.actionText}>Novo item</Text>
        </TouchableOpacity>
      </View>

      {/*formulario manual*/}
      {showmanual && (
        <View style={styles.card}>
          <TextInput
            placeholder="Tombamento"
            value={newcode}
            onChangeText={setNewcode}
            style={styles.input}
          />

          <TextInput
            placeholder="Nome"
            value={newname}
            onChangeText={setNewname}
            style={styles.input}
          />

          <TextInput
            placeholder="Tipo"
            value={newtype}
            onChangeText={setNewtype}
            style={styles.input}
          />

          {/*acoes do formulario*/}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveButton} onPress={additem}>
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowmanual(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/*lista de itens*/}
      <ScrollView>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item cadastrado ainda</Text>
        ) : (
          items.map((item, index) => {
            const expanded = expandedindex === index;

            return (
              <View key={index} style={styles.itemCard}>
                {/*cabecalho do item*/}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() =>
                    setExpandedindex(expanded ? null : index)
                  }
                >
                  <Text style={styles.itemTitle}>{item[1]}</Text>

                  {/*botao da seta com quadrado*/}
                  <View style={styles.arrowButton}>
                    <Ionicons
                      name={expanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>

                {/*detalhes colapsaveis*/}
                {expanded && (
                  <View style={styles.itemDetails}>
                    <Text style={styles.detailText}>
                      Tombamento: {item[0]}
                    </Text>

                    <Text style={styles.detailText}>
                      Tipo: {item[2]}
                    </Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteitem(index)}
                    >
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/*botao finalizar*/}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => router.push("/rooms")}
          
        >
          <Text style={styles.finishText}>Finalizar Ambiente</Text>
          
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

//estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 20

  },

  progressBar: {
    height: 10,
    backgroundColor: "#ddd",
    marginBottom: 10,
  },

  progressFill: {
    width: "20%",
    height: "100%",
    backgroundColor: "#3a6f78",
  },

  progressText: {
    marginBottom: 20,
  },

  actionRow: {
    flexDirection: "row",
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#3a6f78",
    marginHorizontal: 5,
    padding: 14,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#eee",
    padding: 12,
    marginBottom: 10,
  },

  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  saveButton: {
    backgroundColor: "#3a6f78",
    padding: 12,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#d64545",
    padding: 12,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "bold",
    color: "#FFF"
  },

  itemCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5dc",
    marginBottom: 10,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },

  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  itemDetails: {
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 14,
  },

  detailText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },

  deleteButton: {
    backgroundColor: "#d64545",
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyText: {
    opacity: 0.5,
    marginBottom: 20,
  },

  finishButton: {
    backgroundColor: "#3a6f78",
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  
  },

  finishText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#3a6f78",
    justifyContent: "center",
    alignItems: "center",
  },
});

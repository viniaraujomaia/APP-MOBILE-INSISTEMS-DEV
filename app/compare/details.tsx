import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CompareDetails() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const items = [
    "Cadeira Secretária",
    "Mesa Para Microcomputador",
    "Mesa Para Microcomputador",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F6F8", padding: 20 }}>
      
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Comparar Itens
      </Text>

      {/* card dados */}
      <View
        style={{
          backgroundColor: "#FFF",
          borderWidth: 1,
          borderColor: "#3A6F78",
          padding: 15,
          marginBottom: 15,
        }}
      >
        <Text>Categoria:</Text>
        <Text>Móveis</Text>

        <Text style={{ marginTop: 8 }}>Descrição:</Text>
        <Text>Mesa de Computador</Text>

        <Text style={{ marginTop: 8 }}>Tombamento:</Text>
        <Text>XX98XX5</Text>
      </View>

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
            onPress={() => setShowConfirm(true)}
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

      {/* popup confirmar */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#FFF", padding: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Identificar item utilizando esse nº?
            </Text>

            <Text>Tombamento: 5698555</Text>
            <Text>Categoria: Mesa Para Microcomputador</Text>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#D64545", padding: 10 }}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={{ color: "#FFF", textAlign: "center" }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#3A9F5A",
                  padding: 10,
                  marginLeft: 10,
                }}
                onPress={() => {
                  setShowConfirm(false);
                  setShowSuccess(true);
                }}
              >
                <Text style={{ color: "#FFF", textAlign: "center" }}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* popup sucesso */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={{ backgroundColor: "#FFF", padding: 20 }}>
            <Text style={{fontWeight: "bold", marginBottom: 20 }}>
              Item Identificado
            </Text>

            <TouchableOpacity
              style={{ backgroundColor: "#3A9F5A", padding: 12 }}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={{ color: "#FFF", textAlign: "center" }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

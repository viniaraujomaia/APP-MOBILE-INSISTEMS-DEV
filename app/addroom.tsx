//importa o AsyncStorage para salvar dados localmente no celular
import AsyncStorage from "@react-native-async-storage/async-storage";

//importa o hook de navegação do expo router
import { useRouter } from "expo-router";

//importa o react e o hook de estado
import React, { useState } from "react";

//importa componentes básicos do react native
import { Button, Text, TextInput, View } from "react-native";

//componente da tela "adicionar ambiente"
export default function AddRoom() {

  //estado para armazenar o nome digitado do ambiente
  const [ambienteName, setAmbienteName] = useState("");

  //estado para armazenar mensagens de erro
  const [error, setError] = useState("");

  //hook para controlar a navegação entre telas
  const router = useRouter();

  //função chamada ao clicar em salvar
  const saveAmbiente = async () => {

    //remove espaços extras do nome
    const name = ambienteName.trim();

    //validação: campo vazio
    if (!name) {
      setError("Digite o nome do ambiente.");
      return;
    }

    //busca os ambientes salvos no asyncstorage
    const raw = await AsyncStorage.getItem("ambientes");

    //converte o json salvo em array
    const ambientes = raw ? JSON.parse(raw) : [];

    //validação: se o ambiente já existe
    if (ambientes.includes(name)) {
      setError("Esse ambiente já está registrado.");
      return;
    }

    //limpa o erro se passou na validação
    setError("");

    //adiciona o novo ambiente ao array
    ambientes.push(name);

    //salva o array atualizado no asyncstorage
    await AsyncStorage.setItem("ambientes", JSON.stringify(ambientes));

    //limpa o campo de texto
    setAmbienteName("");

    //volta para a tela inicial
    router.push("/");
  };

  //renderização da interface
  return (
    <View style={{ flex: 1, padding: 20 }}>

      {/* título da tela */}
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        adicionar ambiente
      </Text>

      {/* campo de input do nome do ambiente */}
      <TextInput
        placeholder="nome do ambiente"
        value={ambienteName}
        onChangeText={(v) => {
          setAmbienteName(v);
          setError("");
        }}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 0,
          marginBottom: 5,
        }}
      />

      {/* mensagem de erro */}
      {error ? (
        <Text style={{ color: "red", marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}

      {/* botão salvar */}
      <Button title="salvar" onPress={saveAmbiente} />

    </View>
  );
}

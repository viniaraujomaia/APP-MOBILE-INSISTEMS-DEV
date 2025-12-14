//importa o asyncstorage para ler os dados salvos localmente
import AsyncStorage from "@react-native-async-storage/async-storage";

//importa componentes básicos do react native
import { Alert, Button, Text, View } from "react-native";

//componente da tela de exportação de dados
export default function ExportScreen() {

  //função assíncrona responsável por gerar o conteúdo do arquivo txt
  const exportTxt = async () => {

    //variável que irá armazenar o texto final do arquivo
    let output = "";

    //lê do asyncstorage a lista de ambientes salvos
    const rawRooms = await AsyncStorage.getItem("rooms");

    //converte o json salvo em array ou define array vazio
    const rooms = rawRooms ? JSON.parse(rawRooms) : [];

    //percorre cada ambiente salvo
    for (const room of rooms) {

      //adiciona o nome do ambiente no texto
      output += `${room}\n`;

      //lê os itens associados ao ambiente atual
      const rawItems = await AsyncStorage.getItem(`items-${room}`);

      //converte os itens salvos em array ou define array vazio
      const items = rawItems ? JSON.parse(rawItems) : [];

      //percorre todos os itens do ambiente
      for (const item of items) {

        //adiciona o item no texto do arquivo
        output += `${item}\n`;
      }

      //quebra de linha entre ambientes
      output += `\n`;
    }

    //exibe um alerta com o conteúdo do txt gerado
    Alert.alert("TXT Gerado", output);
  };

  //renderização da interface da tela
  return (
    //container principal da tela
    <View style={{ flex: 1, padding: 20 }}>

      {/*título da tela*/}
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Exportar Dados
      </Text>

      {/*botão para gerar o arquivo txt*/}
      <Button title="Gerar .TXT" onPress={exportTxt} />

    </View>
  );
}

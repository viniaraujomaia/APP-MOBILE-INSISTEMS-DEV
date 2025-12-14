//importa o asyncstorage para manipular dados salvos localmente no dispositivo
import AsyncStorage from "@react-native-async-storage/async-storage";

//importa o componente link do expo-router para navegação entre telas
import { Link } from "expo-router";

//importa componentes básicos do react native
import { Alert, Button, Text, View } from "react-native";

//componente da tela de configurações
export default function Settings() {

  //função assíncrona para apagar todos os dados salvos no aplicativo
  const clearAll = async () => {

    //remove todos os dados armazenados no asyncstorage
    await AsyncStorage.clear();

    //exibe um alerta informando que os dados foram apagados
    Alert.alert("Pronto!", "Todos os dados foram apagados.");
  };

  //renderização da interface da tela
  return (
    //container principal da tela
    <View style={{ flex: 1, padding: 20 }}>

      {/*título da tela*/}
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Configurações
      </Text>

      {/*botão para navegar para a tela de importação*/}
      <Link href="/import" asChild>
        <Button title="Importar dados" />
      </Link>

      {/*espaçamento entre botões*/}
      <View style={{ marginTop: 10 }}>

        {/*botão para navegar para a tela de exportação*/}
        <Link href="/export" asChild>
          <Button title="Exportar dados" />
        </Link>
      </View>

      {/*espaçamento entre botões*/}
      <View style={{ marginTop: 10 }}>

        {/*botão para apagar todos os dados do aplicativo*/}
        <Button title="Apagar tudo" color="red" onPress={clearAll} />
      </View>

    </View>
  );
}

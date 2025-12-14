//importa os componentes text e view do react native
import { Text, View } from "react-native";

//componente da tela de importação de arquivos
export default function ImportScreen() {

  //renderização da interface da tela
  return (
    //container principal da tela
    <View style={{ flex: 1, padding: 20 }}>

      {/*título da tela*/}
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Importar Arquivo
      </Text>

      {/*texto informativo sobre a funcionalidade futura*/}
      <Text style={{ marginTop: 20 }}>
        Aqui será implantado o sistema de importação de PDF/XLS.
      </Text>

    </View>
  );
}

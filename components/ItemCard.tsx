//importa os componentes text e view do react native
import { Text, View } from "react-native";

//componente visual que representa um card de item
export function ItemCard({ text }: { text: string }) {

  //renderização do card do item
  return (
    //container principal do card
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 0,
        marginBottom: 10,
      }}
    >

      {/*texto exibido dentro do card*/}
      <Text>
        {text}
      </Text>

    </View>
  );
}

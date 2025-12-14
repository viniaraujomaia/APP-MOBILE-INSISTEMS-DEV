//importa o componente stack do expo-router para gerenciar a navegação em pilha
import { Stack } from "expo-router";

//componente de layout raiz usado pelo expo-router
export default function Layout() {

  //retorna o stack com o header desativado em todas as telas
  return <Stack screenOptions={{ headerShown: false }} />;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from 'expo-sharing';
import { Alert, Button, Text, View } from "react-native";
import * as XLSX from 'xlsx';


// Usa 'expo-file-system/next' para garantir compatibilidade futura
import { File, Paths } from 'expo-file-system/next';

export default function ExportScreen() {

  // --- 1. FUNÇÃO (TXT) ---
  // geração rápida de relatórios simples em texto
  const exportTxt = async () => {
    let output = "";
    const rawRooms = await AsyncStorage.getItem("rooms");
    const rooms = rawRooms ? JSON.parse(rawRooms) : [];
    
    // percorre todas as salas
    for (const room of rooms) {
      output += `${room}\n`;
      const rawItems = await AsyncStorage.getItem(`items-${room}`);
      const items = rawItems ? JSON.parse(rawItems) : [];
      
      for (const item of items) {
        // Verificação de compatibilidade: se for array (novo formato), junta com traço
        if (Array.isArray(item)) {
            output += `${item.join(' - ')}\n`;
        } else {
            // Se for formato antigo (string ou objeto), tenta converter para string
            output += `${item}\n`;
        }
      }
      output += `\n`;
    }
    Alert.alert("TXT Gerado", output);
  };

  // --- 2. AUXILIAR: DATA NO NOME DO ARQUIVO ---
  const getFileName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}).replace(/:/g, '-');
    return `Relatorio_${dateStr}_${timeStr}.xlsx`;
  };

  // --- 3. GERAR E COMPARTILHAR EXCEL (MODERNO) ---
  const shareExcel = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Erro", "Compartilhamento indisponível.");
        return;
      }

      /* * =============================================================================
       * Caso seja necessário comparar itens coletados com a lista original,
       * descomente o bloco abaixo para carregar a lista do AsyncStorage.
       * ==============================================================================
       */
      // const rawLoadItems = await AsyncStorage.getItem("loadItems");
      // const loadItems = rawLoadItems ? JSON.parse(rawLoadItems) : [];

      // 1. Coleta os dados das salas
      const rawRooms = await AsyncStorage.getItem("rooms");
      const rooms = rawRooms ? JSON.parse(rawRooms) : [];
      
      const dadosParaExcel: any[][] = [["Tombamento", "Nome", "Status"]];
      let totalItens = 0;

      for (const room of rooms) {
        const rawItems = await AsyncStorage.getItem(`items-${room}`);
        if (!rawItems) continue;
        const items = JSON.parse(rawItems);

        for (const item of items) {
          if (Array.isArray(item)) {
             const codigo = item[0] || "";
             const nome = item[1] || "";
             
             /* * ==============================================================================
              * Atualmente, assume-se que qualquer item registrado em uma sala está "Presente".
              * ==============================================================================
              */
             const status = "Presente";// Lógica simples: todos os itens coletados são "Presentes"

             dadosParaExcel.push([ codigo, nome, status ]);
             totalItens++;
          }
        }
      }

      if (totalItens === 0) {
          Alert.alert("Aviso", "Nada para exportar.");
          return;
      }

      // 2. Gera o Binário (Array de Bytes)
      const ws = XLSX.utils.aoa_to_sheet(dadosParaExcel);

      ws['!cols'] = [
        { wch: 15 }, // Define largura da coluna
        { wch: 40 },// Define largura da coluna
        { wch: 15 }];// Define largura da coluna
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      
      // Gera como ARRAY (ArrayBuffer) para compatibilidade com Expo FileSystem 
      const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

      // 3. Salva o Arquivo 
      const fileName = getFileName();
      // Define o caminho no cache do app
      const file = new File(Paths.cache, fileName);
      
      await file.create(); // Cria o arquivo vazio no disco

      // Converte o ArrayBuffer do XLSX para Uint8Array, que a nova API aceita nativamente
      const bytes = new Uint8Array(wbout);

      // Escreve os bytes diretamente no arquivo
      await file.write(bytes);

      // 4. Compartilha
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exportar Inventário',
        UTI: 'com.microsoft.excel.xlsx'
      });

    } catch (error) {
      console.error("Erro export:", error);
      Alert.alert("Erro", "Falha ao gerar Excel: " + (error as any).message);
    }
  };

return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>Exportar Dados</Text>
      
      <View style={{ marginBottom: 15 }}>
        <Button title="Gerar .TXT (Simples)" onPress={exportTxt} />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Button 
            title="Gerar Excel e Compartilhar" 
           onPress={shareExcel}
            color="#2e7d32"
        />
      </View>
      
      <Text style={{ marginTop: 20, color: '#666', fontStyle: 'italic' }}>
        Compartilhe e salve seus dados.
      </Text>
    </View>
  );
}

  

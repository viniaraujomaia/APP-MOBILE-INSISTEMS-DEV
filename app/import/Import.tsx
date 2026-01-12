// Importa os componentes do React Native
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  View
} from "react-native";
import * as XLSX from 'xlsx';

// Interface para ativo
interface Ativo {
  id: string;      // Número do ativo
  nome: string;    // Nome
}

// Componente da tela de importação de arquivos
export default function ImportScreen() {
  // Estados para gerenciar a importação
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  // Router para navegação
  const router = useRouter();

  // Função principal de importação
  const importExcelFile = async () => {
    try {
      setLoading(true);
      setAtivos([]);
      
      // 1. Selecionar arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert('Erro', 'Nenhum arquivo selecionado');
        setLoading(false);
        return;
      }

      setFileName(file.name);
      
      // 2. Ler arquivo
      const response = await fetch(file.uri);
      const arrayBuffer = await response.arrayBuffer();
      
      // 3. Processar Excel
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      }) as any[][];

      // 4. Extrair apenas as 2 primeiras colunas
      const novosAtivos: Ativo[] = [];
      
      // Pula a primeira linha (cabeçalho) e processa o resto
      for (let i = 1; i < jsonData.length; i++) {
        const linha = jsonData[i];
        
        if (Array.isArray(linha) && linha.length >= 2) {
          const numero = String(linha[0] || '').trim();
          const nome = String(linha[1] || '').trim();
          
          // Só adiciona se tiver número
          if (numero) {
            novosAtivos.push({
              id: `${numero}-${i}`, // CHAVE ÚNICA: combina número com índice
              nome: nome || `Ativo ${numero}`,
            });
          }
        }
      }

      // Logs para debugging
      console.log('📊 DADOS BRUTOS DA PLANILHA (primeiras 5 linhas):');
      jsonData.slice(0, 5).forEach((linha, idx) => {
        console.log(`Linha ${idx}:`, linha);
      });

      console.log('🎯 ATIVOS EXTRAÍDOS:', novosAtivos);

      setAtivos(novosAtivos);
      
      Alert.alert(
        '✅ Importado com sucesso!',
        `${novosAtivos.length} ativos encontrados no arquivo`
      );
      
    } catch (error: any) {
      console.error('Erro na importação:', error);
      Alert.alert('❌ Erro', 'Não foi possível importar o arquivo');
    } finally {
      setLoading(false);
    }
  };

  // Limpar dados
  const limparDados = () => {
    setAtivos([]);
    setFileName('');
    console.log('🗑️ Dados limpos com sucesso');
  };

  // Função para navegar para /home2 com os dados
  const irParaHome2 = () => {
    if (ativos.length === 0) {
      Alert.alert('Aviso', 'Nenhum dado para enviar. Importe um arquivo primeiro.');
      return;
    }
    
    // Navega para /home2 passando os dados como parâmetros
    router.push({
      pathname: "/home2",
      params: { 
        ativos: JSON.stringify(ativos),
        fileName: fileName,
        total: ativos.length.toString()
      }
    });
  };

  // Renderização da interface da tela
  return (
    // Container principal da tela
    <View style={{ flex: 1, padding: 20 }}>
      {/* Título da tela */}
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
        Importar Arquivo
      </Text>

      {/* Botão de importação */}
      <View style={{ marginBottom: 20 }}>
        <Button
          title={loading ? "Importando..." : "Importar Excel/CSV"}
          onPress={importExcelFile}
          disabled={loading}
          color="#2196F3"
        />
      </View>

      {/* Indicador de carregamento */}
      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={{ marginTop: 8, color: '#666' }}>
            Processando arquivo...
          </Text>
        </View>
      )}

      {/* Informações do arquivo */}
      {fileName && !loading && (
        <View style={{ 
          backgroundColor: '#e3f2fd', 
          padding: 12, 
          borderRadius: 8,
          marginBottom: 16 
        }}>
          <Text style={{ fontSize: 14, color: '#0d47a1' }}>
            📄 Arquivo: {fileName}
          </Text>
        </View>
      )}

      {/* Resumo da importação */}
      {ativos.length > 0 && (
        <View style={{ 
          backgroundColor: '#e8f5e9', 
          padding: 12, 
          borderRadius: 8,
          marginBottom: 12 
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#2e7d32' }}>
            📊 {ativos.length} ativos importados
          </Text>
        </View>
      )}

      {/* Lista de ativos importados */}
      <ScrollView style={{ flex: 1, marginBottom: 20 }}>
        {ativos.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              {fileName 
                ? 'Nenhum ativo encontrado no arquivo' 
                : 'Importe um arquivo Excel ou CSV'
              }
            </Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
              Formato esperado: Número do Ativo | Nome
            </Text>
          </View>
        ) : (
          ativos.map((ativo, index) => (
            <View 
              key={ativo.id}
              style={{ 
                padding: 12,
                marginBottom: 8,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#e0e0e0',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#666', fontWeight: '600' }}>
                  #{index + 1}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2196f3' }}>
                  {ativo.id.split('-')[0]}
                </Text>
              </View>
              <Text style={{ fontSize: 15, color: '#333' }}>
                {ativo.nome}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botões de ação */}
      {ativos.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* Botão para ir para home2 */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button
              title="Prosseguir"
              onPress={irParaHome2}
              color="#3AA76D"
            />
          </View>
        </View>
      )}
    </View>
  );
}
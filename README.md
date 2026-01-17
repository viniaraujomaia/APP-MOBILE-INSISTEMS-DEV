Inventário Inteligente é uma aplicação dedicada a realização de verificações de inventários extensivos, com recursos para facilitar a organização e registro desses processos.

A aplicação está disponível para dispositivos Android 14 ou superior, funciona de forma offline e foi desenvolvida com React Native no framework Expo.

Instalação:
    • Baixe e instale o apk no seu dispositivo.

Como Utilizar:
    • Ao iniciar o aplicativo pela primeira vez, o usuário deve importar uma planilha no formato .xlsx através da Opção “Importar Lista” no menu Home para gerar uma lista de objetos a serem verificados. Essa planilha deve estar organizada de forma que cada linha contem: Número de Tombamento; Nome do Objeto, Tipo do Objeto (Se houver).
    • O usuário pode criar tags dentro do aplicativo para facilitar a organização através do recurso Criar Ambiente no menu Gerenciar Ambientes. 
    • Se o usuário preferir por não criar nenhuma tag, conforme for realizando a coleta, o aplicativo registrará todos os objetos com a tag Geral.
    • Ao selecionar um ambiente no menu Continuar Coleta, o usuário pode verificar itens de forma manual ou por leitura de código de barras. 
    • A criação de código de barras deve ser feita de forma externa ao aplicativo. O aplicativo só será capaz de ler o código de barras se ele corresponder à um valor numérico
    • O usuário pode acessar a câmera diretamente pela barra inferior para fazer o registro por leitura (todos os itens registrados dessa forma recebem a tag Geral)
    • se o usuário encontrar algum item o qual não seja possível identificar, seja de forma manual ou pela leitura do código de barras, o usuário pode marcar o objeto como “Não Identificado” e, em qualquer ponto da coleta, comparar esse objeto com os itens que ainda não foram verificados atráves da opção “Comparar Itens sem Plaqueta”, no menu “Continuar Coleta”.
    • O usuário pode observar o progresso da coleta no menu Continuar coleta e em qualquer ambiente.
    • Ao finalizar a coleta, o usuário pode gerar um arquivo .xlsx com a opção “Finalizar Coleta”, no menu Home. Uma planilha contendo em cada linha: Número de Tombamento; Status do objeto (presente ou não encontrado). Observação: ao finalizar a coleta, os dados da coleta são usados para gerar o relatório e apagados para que uma nova coleta possa ser iniciada.

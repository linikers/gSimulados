# Guia: Banco de Questões e Gerador de Simulados

Este guia explica como configurar o Banco de Questões (via Google Drive) e como utilizar o Gerador de Simulados no estado atual do sistema.

## 1. Banco de Questões (Google Drive)

O sistema utiliza pastas do Google Drive como fonte de PDFs de provas.

### Passo a Passo para Configurar

1. **Acesse o Painel Admin**:
   - Faça login com um usuário ADMIN.
   - No menu lateral, vá em **Banco de Questões > Configurar Drive**.

2. **Adicione uma Nova Configuração**:
   - **Vestibular**: Selecione o vestibular (ex: ENEM, FUVEST). Se não houver, cadastre antes em *Vestibulares > Gerenciar*.
   - **URL da Pasta**: Cole o link da pasta do Google Drive onde estão os PDFs.
     - *Exemplo*: `https://drive.google.com/drive/folders/1abc...`
   - **Nome da Pasta**: Dê um nome para identificar (ex: "Provas 2023-2024").
   - Clique em **Salvar Configuração**.

3. **Sincronizar PDFs**:
   - Na lista de pastas configuradas, clique no ícone de **Sincronizar** (🔄).
   - O sistema irá listar os arquivos da pasta (atualmente simulado com dados de teste).

## 2. Gerador de Simulados (Extração de Questões)

O "Gerador" é o processo de extrair questões dos PDFs sincronizados usando IA.

### Passo a Passo para Usar

1. **Acesse a Lista de PDFs**:
   - Vá em **Banco de Questões > PDFs**.
   - Você verá a lista de arquivos sincronizados.

2. **Iniciar Extração**:
   - Encontre o PDF desejado e clique no botão **Extrair Questões** (ou ícone de "raio" ⚡).
   - O status mudará para "Processando".

3. **Verificar Resultados**:
   - Após o processamento (que é instantâneo no modo de teste atual), o status mudará para "Concluído".
   - O número de questões extraídas será atualizado.

## 3. Estado Atual e Próximos Passos

### O que está funcionando (Frontend & Backend)
- ✅ **Integração Real com Google Drive**: O sistema conecta via API oficial (Service Account) para listar e baixar arquivos.
- ✅ **Extração com IA (Gemini)**: O sistema envia os PDFs para o Google Gemini Flash, que analisa e retorna as questões estruturadas.
- ✅ **Fluxo de Revisão**: Interface para validar as questões extraídas pela IA antes de oficializá-las.
- ✅ **Gestão de Vestibulares**: CRUD completo de vestibulares.

### Pontos de Atenção (Melhorias Futuras)
- **Otimização de Imagens**: O recorte automático de imagens das questões ainda pode ser aprimorado.
- **Feedback de Erro na IA**: Melhorar mensagens para o usuário caso o Gemini falhe em ler um PDF específico (ex: Scanned PDF de baixa qualidade).
- **Edição Avançada**: Adicionar suporte a LaTeX no editor de enunciados da revisão.

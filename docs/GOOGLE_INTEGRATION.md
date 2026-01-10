# Integração Google Cloud (Drive e Gemini)

Este documento explica como configurar as credenciais necessárias para o funcionamento do **Google Drive Sync** e da **Extração com IA (Gemini)**.

## 1. Google Drive (Service Account)

Para que o sistema possa ler os arquivos do Google Drive, usamos uma **Service Account** (Conta de Serviço).

### Como criar e baixar o JSON:

1.  Acesse o **[Google Cloud Console - Credenciais](https://console.cloud.google.com/apis/credentials)**.
2.  Selecione seu projeto (ou crie um novo).
3.  Clique em **+ CRIAR CREDENCIAIS** > **Conta de serviço**.
4.  Preencha os dados (ex: Nome: `gsimulados-bot`) e clique em **CRIAR E CONTINUAR**.
5.  (Opcional) Em "Papel", selecione **Editor** ou **Leitor** (para garantir acesso). Clique em **CONCLUIR**.
6.  Na lista de contas de serviço, clique no email da conta que você acabou de criar (ex: `gsimulados-bot@...`).
7.  Vá na aba **CHAVES**.
8.  Clique em **ADICIONAR CHAVE** > **Criar nova chave**.
9.  Escolha o formato **JSON** e clique em **CRIAR**.
10. O download do arquivo será feito automaticamente.

### Onde colocar o arquivo:

1.  Renomeie o arquivo para: **`service-account.json`**.
2.  Coloque-o na pasta: **`apps/api/`** (na raiz da API).

> **IMPORTANTE:** Dê permissão de leitura na pasta do Google Drive para o email da Service Account (`...@...iam.gserviceaccount.com`).

---

## 2. Gemini AI (Google AI Studio)

Para a leitura inteligente das questões, usamos a API do Google Gemini.

### Como gerar a API Key:

1.  Acesse o **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  Faça login com sua conta Google.
3.  Clique em **Create API key**.
4.  Copie a chave gerada (começa com `AIza...`).

### Onde configurar:

1.  Abra o arquivo `.env` na pasta `apps/api/`.
2.  Adicione a variável `GEMINI_API_KEY`:

```env
GEMINI_API_KEY="AIzaSyB..."
```

---

## 3. Cloudinary (Hospedagem de Imagens)

As imagens das questões extraídas são salvas no Cloudinary.

1.  Crie uma conta gratuita no **[Cloudinary](https://cloudinary.com/)**.
2.  No Dashboard, copie o **Cloud Name**, **API Key** e **API Secret**.
3.  Adicione no arquivo `.env`:

```env
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
```

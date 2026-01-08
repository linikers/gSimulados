# Documentação: Fluxo de Extração de PDFs com Gemini

Este documento descreve a arquitetura e os arquivos envolvidos no processo de extração automática de questões a partir de arquivos PDF e o fluxo de revisão subsequente.

## 1. Visão Geral do Fluxo

O processo foi otimizado para enviar o PDF diretamente para a IA (Gemini 1.5/2.0 Flash), eliminando a necessidade de conversão intermediária para imagens ou upload para serviços externos como Cloudinary.

1.  **Sincronização**: O sistema identifica novos PDFs em pastas do Google Drive.
2.  **Extração**: O PDF é baixado para memória, enviado ao Gemini, que retorna as questões estruturadas em JSON.
3.  **Staging**: As questões são salvas temporariamente na coleção `ExtractedQuestion` com status `pending`.
4.  **Revisão**: Um administrador revisa, edita e aprova as questões via interface web.
5.  **Persistência**: Ao aprovar, a questão é movida para a coleção principal `Question`.

---

## 2. Rastreamento de Arquivos

### Backend (apps/api)

| Arquivo                                        | Função                                                                                             |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `src/services/drive.service.ts`                | Gerencia a comunicação com o Google Drive (Listagem, Download via Buffer).                         |
| `src/services/gemini-vision.service.ts`        | Interface direta com a API do Google Generative AI. Configura o prompt e envia o PDF.              |
| `src/controllers/pdf-extraction.controller.ts` | Orquestrador principal. Coordena download, chamada à IA, salvamento no banco e estatísticas.       |
| `src/controllers/drive-config.controller.ts`   | Cuida da configuração das pastas e o gatilho inicial de sincronização de metadados.                |
| `src/routes/pdf-extraction.routes.ts`          | Define os endpoints de extração (`/extract`) e as rotas de listagem/revisão de questões pendentes. |
| `src/models/PdfSource.ts`                      | Modelo que rastreia os arquivos PDF (ID do Drive, Status de Extração, Nome, etc).                  |
| `src/models/ExtractedQuestion.ts`              | Modelo para armazenamento "em rascunho" das questões recém-extraídas pela IA.                      |
| `src/models/Question.ts`                       | Modelo definitivo para as questões que serão usadas nos simulados.                                 |
| `src/config/env.ts`                            | Validação das variáveis de ambiente necessárias (`GEMINI_API_KEY`, `GOOGLE_SERVICE_ACCOUNT`).      |

### Frontend (apps/web)

| Arquivo                                             | Função                                                                              |
| :-------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `src/pages/admin/BancoQuestoes/ListaPdfs.tsx`       | Painel para listar arquivos sincronizados e disparar o botão "Extrair com IA".      |
| `src/pages/admin/BancoQuestoes/RevisarQuestoes.tsx` | Interface de "Tinder de questões": permite editar, aprovar ou rejeitar uma por uma. |
| `src/services/pdf-extraction.service.ts`            | Cliente Axios para as rotas de listagem de PDFs e comando de extração.              |
| `src/services/question-review.service.ts`           | Cliente Axios para as rotas de listagem pendente, aprovação e rejeição.             |

---

## 3. Variáveis de Ambiente Cruciais

Para que a extração funcione (local ou produção), estas variáveis devem estar configuradas:

- `GEMINI_API_KEY`: Chave do Google AI Studio.
- `GOOGLE_SERVICE_ACCOUNT`: JSON (minificado) da conta de serviço para acessar o Drive.
- `MONGO_URI`: Conexão com o banco onde as extrações são salvas.

---

## 4. Manutenção e Solução de Problemas

- **Erro 404/429 no Gemini**: Verifique se o nome do modelo em `gemini-vision.service.ts` (`gemini-1.5-flash` ou `gemini-flash-latest`) é aceito pelo seu plano no AI Studio.
- **Erro de Validação**: Se o banco recusar salvar, verifique o enum de `respostaCorreta` no modelo `ExtractedQuestion.ts`. O controlador atual já sanitiza automaticamente valores fora de A-E.

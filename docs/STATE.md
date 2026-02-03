# Estado Atual do Projeto (STATE)

Resumo do que está operacional e o que está em desenvolvimento.

## ✅ Funcionalidades Implementadas

- **Ingestão de Questões**: Fluxo completo de sincronização com Google Drive.
- **Extração via IA**: Extração de enunciados, alternativas e gabaritos usando Gemini 1.5 Flash.
- **Auditoria de IA**: Sistema de auditoria acadêmica com feedback visual e resiliência (Graceful Degradation).
- **Gestão Multi-tenancy**: Cadastro de escolas e alunos com controle de acesso (Roles).
- **Geração de Simulados**: Alunos podem gerar simulados por matéria/assunto.

## 🚧 Em Progresso

- **Extração de Imagens**: Automatização do recorte e salvamento de imagens das questões via Cloudinary.
- **Refatoração de Tipos**: Substituição de tipos remanescentes por interfaces
- **Aprimoramento da Revisão**: Melhoria da tela de revisão para suporte a LaTeX e tabelas.

## ❌ Pendente

- **Dashboard Analítico**: Gráficos e métricas de desempenho avançadas.
- **Filas de Processamento**: Implementação de RabbitMQ/Redis para processamento em larga escala.

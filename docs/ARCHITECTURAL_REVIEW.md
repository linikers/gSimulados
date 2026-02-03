# Revisão Arquitetural - gSimulados

**Data:** 03/02/2026  
**Responsável:** Antigravity (Senior SE Role)

## 1. Resumo Executivo

O projeto `gSimulados` apresenta uma base sólida e moderna, utilizando uma arquitetura Monorepo que facilita a consistência entre o ecossistema de API e a interface Web. A escolha da stack (Node.js/TypeScript/React) é adequada para a agilidade necessária em um produto SaaS. O sistema de extração baseado em IA (Gemini) é o grande diferencial competitivo, e sua implementação atual foca na resiliência e auditoria humana.

---

## 2. Pontos Fortes (Strengths)

- **Monorepo Estruturado**: O uso de `Yarn Workspaces` permite o compartilhamento de tipos e lógica de forma eficiente entre os módulos.
- **Stack Consistente**: Uso de TypeScript em 100% da base, garantindo segurança de tipos e melhor experiência de desenvolvimento.
- **Resiliência na Integração com IA**: A implementação do `Graceful Degradation` no serviço de auditoria demonstra maturidade, evitando que falhas em serviços externos derrubem o fluxo crítico.
- **Integração Nativa com Google Cloud**: O fluxo direto Drive -> Gemini otimiza o processamento e reduz latência de transferência de dados.
- **Interface Moderna (MUI v5)**: O uso de um sistema de design robusto garante consistência visual e acessibilidade.

---

## 3. Riscos e Dívida Técnica (Risks & Tech Debt)

- **Acoplamento em Controllers**: Foi identificada lógica de negócio densa dentro dos controllers (ex: `PdfExtractionController.ts`). Isso dificulta a testabilidade unitária e a reutilização de código.
- **Processamento Síncrono e Bloqueante**: A extração de PDFs ocorre durante o ciclo de vida de uma requisição HTTP. PDFs grandes ou latência na API do Gemini podem causar timeouts e prejudicar a experiência do usuário.
- **Gerenciamento de Estado**: Embora o `Zustand` esteja presente, há um uso intensivo de `Context API` para autenticação. Em escala, isso pode causar re-renderizações desnecessárias se não for bem isolado.
- **Ausência de Transações**: Operações que envolvem múltiplos modelos (ex: Aprovar Questão) não utilizam transações atômicas, o que pode levar a inconsistências no banco de dados em caso de falhas parciais.
- **Segurança de Tipos (Shared)**: O pacote `shared` ainda parece subutilizado, com muitas interfaces sendo duplicadas ou mantidas localmente nos apps.

---

## 4. Sugestões de Melhoria Prática (Recommendations)

1. **Desacoplamento (Service Layer)**: Migrar a lógica de orquestração dos controllers para serviços dedicados. O controller deve apenas validar a entrada e formatar a saída.
2. **Implementação de Mensageria**: Migrar o fluxo de extração para um modelo de "Worker". Sugere-se RabbitMQ para maior controle de filas ou BullMQ (Redis) se a stack for manter-se 100% Node.js.
3. **Persistência Atômica**: Implementar o uso de `ClientSession` do Mongoose em fluxos críticos (Extração -> Auditoria -> Aprovação) para garantir a integridade dos dados.
4. **Centralização de Tipos**: Priorizar a migração de todas as interfaces de API e Models para o pacote `@gsimulados/shared`, eliminando a necessidade de re-declaração.
5. **Monitoramento e Observabilidade**: Implementar logs estruturados e talvez uma ferramenta de Tracing (como Sentry ou OpenTelemetry) para monitorar falhas silenciosas em chamadas de IA.
6. **Custom Hooks para Lógica de API**: No frontend, abstrair chamadas de serviços e gerenciamento de estado de loading/error para Hooks customizados, limpando os componentes de página.

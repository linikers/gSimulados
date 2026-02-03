# Restrições e Convenções (CONSTRAINTS)

Regras fundamentais para o desenvolvimento e manutenção do `gSimulados`.

## Código e Tipagem

- **TypeScript Estrito**: Uso obrigatório de tipos. Proibido o uso de `any`.
- **Backend (API)**:
  - Controllers devem ser classes com métodos estáticos.
  - Models seguem o padrão Mongoose Schema + Interface TS.
- **Frontend (Web)**:
  - Componentes funcionais com Hooks.
  - Estilização via Material-UI (MUI v5).
  - Serviços organizados em `src/services/`.

## Documentação

- **Localização**: Toda a documentação técnica DEVE residir na pasta `./docs`.
- **Idioma**: Novos documentos, comentários e notas devem ser em **pt-BR**.
- **Sincronização**: Atualizar `docs/STATUS_ATUAL.md` ao finalizar features importantes.

## Fluxo de Trabalho

- **Git**: Repositório funcional é obrigatório.
- **Estrutura**: Não criar arquivos fora de `apps/` ou `packages/` (exceto configurações globais e docs na pasta `./docs`).
- **Segurança**: Variáveis de ambiente sensíveis devem estar em arquivos `.env` (não versionados).

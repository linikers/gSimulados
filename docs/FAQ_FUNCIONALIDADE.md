# Funcionalidade: FAQ (Perguntas Frequentes)

## Visão Geral

A página de FAQ (`/faq`) visa centralizar as dúvidas de **Escolas** e **Alunos**, reduzindo a necessidade de suporte direto.

## Estrutura Técnica

- **Componente:** `src/pages/public/FAQ.tsx`
- **Rota:** `/faq` (Pública)
- **Framework:** React + Material UI

## Como Gerenciar o Conteúdo

Atualmente, as perguntas e respostas são estáticas (hardcoded) no arquivo `FAQ.tsx` para simplicidade e performance.

### Para Adicionar/Editar Perguntas:

1. Abra o arquivo `apps/web/src/pages/public/FAQ.tsx`.
2. Localize as constantes `faqEscola` ou `faqAluno`.
3. Adicione um novo objeto ao array:
   ```javascript
   {
     pergunta: "Sua nova pergunta aqui?",
     resposta: "A resposta explicativa aqui.",
   },
   ```

## Próximos Passos (Melhorias Futuras)

- Transformar em conteúdo dinâmico vindo do banco de dados (MongoDB), permitindo que o Admin edite pelo painel sem mexer no código.

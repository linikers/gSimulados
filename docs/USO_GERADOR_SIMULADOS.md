# 🎓 Guia de Uso: Gerador de Simulados IA

Este documento descreve como utilizar o Gerador de Simulados baseado em Inteligência Artificial (Gemini).

## 🚀 Como Funciona

O gerador utiliza um banco de questões pré-existente (alimentado pelo extrator de PDF) e utiliza IA para selecionar as questões mais equilibradas com base nos critérios do usuário.

### 📝 Passo a Passo

1. **Acesse as Ferramentas**: No menu principal, navegue até "Simulados".
2. **Gerar Novo Simulado**:
   - Clique em **"+ Novo Simulado"**.
   - Defina um **Nome** descritivo (ex: "Revisão Fuvest - Física").
   - Selecione a **Matéria** desejada ou deixe em "Todas" para um simulado misto.
   - Escolha o nível de **Dificuldade** (Fácil, Médio, Difícil ou Misto).
   - Ajuste a **Quantidade de Questões** (de 5 a 50).
   - Clique em **"Gerar Simulado Agora ✨"**.
3. **Aguarde a IA**: A IA analisará o banco de dados e selecionará as melhores questões. Isso leva apenas alguns segundos.
4. **Responda e Visualize**: Você será redirecionado para a tela de visualização do simulado, onde poderá ler e marcar as alternativas.

## 🎨 Design Premium

O sistema utiliza uma interface **Glassmorphism** otimizada para foco e leitura:

- **Tema Dark**: Reduz o cansaço visual durante os estudos.
- **Micro-interações**: Feedback visual ao selecionar alternativas e progresso de leitura.
- **Responsividade**: Funciona perfeitamente em tablets e desktops.

## 🛠️ Notas Técnicas para Administradores

- O serviço de backend (`SimuladoService`) utiliza o modelo `gemini-flash-latest` para seleção performática.
- As questões são selecionadas com base em metadados (`enunciado`, `materia`, `assunto`) para garantir diversidade sem sobrecarregar a API.
- Os simulados gerados ficam vinculados ao seu perfil de usuário.

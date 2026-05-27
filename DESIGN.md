# DESIGN.md — Mentoria GS

## Marca

- **Nome:** Mentoria GS / Prof. Jean Ribeiro
- **Segmento:** Educação / Preparatório para Vestibulares
- **Foco:** Vestibulares do Paraná (UEM, UEL, UEPG, UNICENTRO, UFPR) + ENEM

## Paleta de Cores

### Primária — Azul (Confiança, Educação)

| Token | Cor | Hex |
|-------|-----|-----|
| `primary.main` | Azul escuro | `#1565C0` |
| `primary.light` | Azul médio | `#1E88E5` |
| `primary.dark` | Azul profundo | `#0D47A1` |

### Secundária — Verde (Crescimento, Conhecimento)

| Token | Cor | Hex |
|-------|-----|-----|
| `secondary.main` | Verde escuro | `#2E7D32` |
| `secondary.light` | Verde médio | `#43A047` |
| `secondary.dark` | Verde profundo | `#1B5E20` |

### Neutros

| Token | Uso | Hex |
|-------|-----|-----|
| `background.default` | Fundo da página | `#FAFBFC` |
| `background.paper` | Cards/superfícies | `#FFFFFF` |
| `text.primary` | Títulos/texto principal | `#1A1A2E` |
| `text.secondary` | Subtítulos/descrições | `#546E7A` |

## Tipografia

- **Fonte principal:** Inter (Google Fonts)
- **Pesos:** 400 (regular), 500, 600 (semibold), 700 (bold), 800 (extrabold)
- **Fallback:** Roboto, Helvetica, Arial, sans-serif

### Escala

| Nível | Peso | Uso |
|-------|------|-----|
| `h3` | 700 | Títulos de seção |
| `h4` | 700 | Subtítulos |
| `h5` | 600 | Cards, módulos |
| `h6` | 600 | Navegação |
| `button` | 600 | Botões (sem uppercase) |

## Shape

- **Border radius padrão:** 12px
- **Botões:** 10px, padding 10px 24px
- **Cards:** 16px

## Componentes

### Botões
- `textTransform: none` (sem uppercase)
- `fontWeight: 600`
- `borderRadius: 10px`
- Padding generoso: 10px 24px

### Cards
- `borderRadius: 16px`
- Elevação consistente via MUI

## Princípios de Design

1. **Clareza > Decoração** — Interface limpa, foco no conteúdo educacional
2. **Cores com propósito** — Azul para navegação/ação, verde para sucesso/confirmação
3. **Hierarquia clara** — Títulos em negrito, espaçamento generoso
4. **Acessibilidade** — Contraste suficiente, alvos de toque ≥ 44px

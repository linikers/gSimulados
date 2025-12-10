# 🤖 Script de Scraping de Vestibulares

## Visão Geral

Script automatizado para coletar informações de vestibulares de sites oficiais e popular o banco de dados.

## Localização

`scripts/scrape-vestibulares.ts`

## Como Usar

### 1. Instalar Dependências

```bash
yarn add axios cheerio
yarn add -D @types/cheerio
```

### 2. Executar Script

```bash
# Compilar TypeScript
cd apps/api
yarn tsc scripts/scrape-vestibulares.ts --outDir dist/scripts

# Executar
node dist/scripts/scrape-vestibulares.js
```

**Ou criar comando no package.json:**

```json
{
  "scripts": {
    "seed:vestibulares": "ts-node scripts/scrape-vestibulares.ts"
  }
}
```

Então rodar:

```bash
yarn seed:vestibulares
```

## O que o Script Faz

### 1. Scraping Dinâmico

- **UTFPR**: Busca links de vestibular em `utfpr.edu.br`
- **UEL**: Busca editais e informações em `sites.uel.br/vestibular`

### 2. Dados Estáticos (Fallback)

Popula dados básicos de:

- ENEM
- UEM
- UEPG
- UFPR
- UNIOESTE
- UNICENTRO

### 3. Upsert no MongoDB

- Se o vestibular já existe (por `codigo`), atualiza
- Se não existe, cria novo
- Marca todos como `ativo: true`

## Estrutura de Dados Coletados

```typescript
{
  codigo: string,        // 'uem', 'enem', etc
  nome: string,          // 'UEM'
  nomeCompleto: string,  // 'Universidade Estadual de Maringá'
  descricao: string,     // Descrição + links encontrados
  siteOficial: string,   // URL oficial
  cidade?: string,       // 'Maringá'
  estado?: string,       // 'PR'
  ordem: number,         // Ordem de exibição
  ativo: true
}
```

## Expandindo o Script

### Adicionar Novo Vestibular (Scraping)

```typescript
async function scrapeUNICENTRO(): Promise<Partial<VestibularData>> {
  const url = "https://www.unicentro.br/vestibular";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  // Lógica de extração específica

  return {
    codigo: "unicentro",
    nome: "UNICENTRO",
    // ...
  };
}
```

### Adicionar Novo Vestibular (Estático)

```typescript
const vestibularesEstaticos: VestibularData[] = [
  // ... existentes
  {
    codigo: "puc",
    nome: "PUC-PR",
    nomeCompleto: "Pontifícia Universidade Católica do Paraná",
    descricao: "Universidade privada",
    siteOficial: "https://www.pucpr.br",
    cidade: "Curitiba",
    estado: "PR",
    ordem: 9,
  },
];
```

## Automação (Futuro)

### Cron Job (Atualização Semanal)

```typescript
// Em apps/api/src/server.ts
import cron from "node-cron";

// Atualiza todo domingo às 2h
cron.schedule("0 2 * * 0", async () => {
  console.log("🔄 Atualizando dados de vestibulares...");
  await popularVestibulares();
});
```

### Endpoint Admin (Trigger Manual)

```typescript
// Em apps/api/src/routes/vestibulares.routes.ts
router.post("/sync", authMiddleware, async (req, res) => {
  await popularVestibulares();
  res.json({ message: "Sincronização iniciada" });
});
```

## Limitações

### Sites Dinâmicos (JavaScript)

Se o site usa React/Vue (conteúdo carregado via JS), o Cheerio não funciona.

**Solução:** Use Puppeteer:

```typescript
import puppeteer from "puppeteer";

async function scrapeComPuppeteer(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  await browser.close();
  return content;
}
```

### Rate Limiting

Alguns sites bloqueiam muitas requisições.

**Solução:** Adicione delay:

```typescript
await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s
```

## Alternativa: Arquivo Markdown

Se preferir manter os dados em Markdown (como seu script Python):

1. **Gerar MD:**

```typescript
const mdContent = `# Vestibulares\n\n## UEM\n- [Link 1](url1)\n...`;
fs.writeFileSync("public/vestibulares.md", mdContent);
```

2. **Ler no Frontend:**

```typescript
const response = await fetch("/vestibulares.md");
const markdown = await response.text();
// Renderizar com react-markdown
```

**Mas recomendo popular o MongoDB diretamente** (mais flexível).

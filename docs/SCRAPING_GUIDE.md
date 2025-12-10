# 🎯 Guia Completo: Sistema de Scraping de Vestibulares

## 📊 Como Funciona (Passo a Passo)

### Primeira Sincronização (Banco Vazio)

```
Você clica em "Sincronizar"
         ↓
Sistema executa syncVestibulares()
         ↓
┌─────────────────────────────────────┐
│ 1. Scraping Dinâmico (Sites Reais) │
├─────────────────────────────────────┤
│ • scrapeUTFPR() → Busca site UTFPR │
│ • scrapeUEL() → Busca site UEL     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 2. Dados Estáticos (vestibularesBase)│
├─────────────────────────────────────┤
│ • ENEM (Nacional)                   │
│ • UEM (Maringá)                     │
│ • UEPG (Ponta Grossa)               │
│ • UFPR (Curitiba)                   │
│ • UNIOESTE (Cascavel)               │
│ • UNICENTRO (Guarapuava)            │
└─────────────────────────────────────┘
         ↓
Cria 8 vestibulares no MongoDB
Todos com fonte: "scraping"
```

**Resultado:** Banco agora tem 8 vestibulares

---

## 🔄 Sincronizações Futuras

### Cenário A: Você NÃO cadastrou nada manualmente

```
Clica "Sincronizar" novamente
         ↓
Para cada vestibular:
  ENEM → Existe, fonte=scraping → ATUALIZA
  UEM → Existe, fonte=scraping → ATUALIZA
  UTFPR → Existe, fonte=scraping → ATUALIZA
  ...
```

**Resultado:** Todos atualizados com dados frescos

### Cenário B: Você cadastrou "PUC-PR" manualmente

```
Você vai em "Novo Vestibular":
  Código: puc
  Nome: PUC-PR
  fonte: "manual" (automático)
         ↓
Clica "Sincronizar"
         ↓
Para cada vestibular:
  ENEM → fonte=scraping → ATUALIZA
  PUC → fonte=manual → IGNORA ✋ (preserva!)
  UEM → fonte=scraping → ATUALIZA
```

**Resultado:** PUC-PR nunca é sobrescrito!

---

## 🛠️ Como Adicionar Nova Universidade

### Opção 1: Cadastro Manual (Recomendado para casos únicos)

1. Vá em "Gerenciar Vestibulares"
2. Clique em "Novo Vestibular"
3. Preencha o formulário
4. Salvar

**Vantagem:** Controle total, nunca será sobrescrito

### Opção 2: Adicionar ao Scraping (Para atualização automática)

#### Se TEM site para raspar:

Edite `apps/api/src/services/scraping.service.ts`:

```typescript
// 1. Criar função de scraping
async function scrapePUC(): Promise<Partial<VestibularData>> {
  try {
    const url = "https://www.pucpr.br/vestibular";
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    // Lógica de extração específica do site

    return {
      codigo: "puc",
      nome: "PUC-PR",
      nomeCompleto: "Pontifícia Universidade Católica do Paraná",
      descricao: "Universidade privada",
      siteOficial: "https://www.pucpr.br",
      cidade: "Curitiba",
      estado: "PR",
      regiao: "Sul",
      fonte: "scraping",
    };
  } catch (error) {
    console.error("Erro ao fazer scraping da PUC:", error);
    return {};
  }
}

// 2. Adicionar na função syncVestibulares (linha 169)
const pucData = await scrapePUC();

// 3. Adicionar no array (linha 173)
const vestibulares = [
  ...vestibularesBase,
  { ...uelData, ordem: 7 } as VestibularData,
  { ...utfprData, ordem: 8 } as VestibularData,
  { ...pucData, ordem: 9 } as VestibularData, // NOVO
].filter((v) => v.codigo);
```

#### Se NÃO TEM site (ou site é complexo):

Adicione aos **dados estáticos** (linha 92):

```typescript
const vestibularesBase: VestibularData[] = [
  // ... existentes
  {
    codigo: "puc",
    nome: "PUC-PR",
    nomeCompleto: "Pontifícia Universidade Católica do Paraná",
    descricao: "Universidade privada do Paraná",
    siteOficial: "https://www.pucpr.br",
    cidade: "Curitiba",
    estado: "PR",
    regiao: "Sul",
    ordem: 7, // Ajustar ordem dos outros
    fonte: "scraping",
  },
];
```

---

## 🤔 Perguntas Frequentes

### "Devo cadastrar manualmente ou adicionar ao scraping?"

| Situação                                  | Recomendação            |
| ----------------------------------------- | ----------------------- |
| Vestibular único, sem mudanças frequentes | **Manual**              |
| Vestibular com site que atualiza dados    | **Scraping**            |
| Muitos vestibulares de uma vez            | **Scraping (estático)** |

### "O que acontece se eu editar um vestibular que veio do scraping?"

**Problema:** Ele será sobrescrito na próxima sincronização!

**Solução:** Edite e mude `fonte` para "manual":

```typescript
// No FormularioVestibular, adicione campo:
<FormControlLabel
  control={
    <Switch
      checked={formData.fonte === "manual"}
      onChange={(e) =>
        handleChange("fonte", e.target.checked ? "manual" : "scraping")
      }
    />
  }
  label="Proteger de sincronização automática"
/>
```

### "Posso ter vestibulares de outras regiões?"

**Sim!** Basta adicionar ao `vestibularesBase`:

```typescript
{
  codigo: 'usp',
  nome: 'USP',
  nomeCompleto: 'Universidade de São Paulo',
  descricao: 'Universidade estadual de São Paulo',
  siteOficial: 'https://www.usp.br',
  cidade: 'São Paulo',
  estado: 'SP',
  regiao: 'Sudeste', // ← Região diferente
  ordem: 9,
  fonte: 'scraping',
}
```

---

## 📝 Resumo

1. **Scraping Service** = Lista de vestibulares que o sistema conhece
2. **Sincronizar** = Atualiza apenas os que vieram do scraping
3. **Manual** = Você tem controle total, nunca é sobrescrito
4. **Adicionar novo** = Editar `scraping.service.ts` OU cadastrar manual

**Regra de Ouro:**

- `fonte: "scraping"` → Sistema gerencia
- `fonte: "manual"` → Você gerencia

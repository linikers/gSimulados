# 📚 Módulo de Vestibulares - Documentação

## Visão Geral

Sistema para gerenciar informações sobre vestibulares e processos seletivos (ENEM, UEM, UEPG, UEL, UFPR, UNIOESTE, UNICENTRO).

## Alterações Implementadas

### Backend

#### 1. Modelo de Dados (`Vestibular.ts`)

**Localização:** `apps/api/src/models/Vestibular.ts`

**Campos Principais:**

- `codigo`: Identificador único (ex: "uem", "enem")
- `nome`: Nome curto (ex: "UEM")
- `nomeCompleto`: Nome completo da instituição
- `descricao`: Texto descritivo
- `siteOficial`: URL do site oficial
- `proximaProva`: Objeto com informações da próxima prova
  - `data`: Data da prova
  - `inscricoes`: Período de inscrições e status
  - `taxa`: Valor da inscrição
  - `siteInscricao`: URL para inscrição
- `googleDriveFolders`: IDs das pastas do Drive (para sync futuro)
- `ativo`: Se o vestibular está ativo
- `ordem`: Ordem de exibição

#### 2. Controller (`vestibulares.controller.ts`)

**Localização:** `apps/api/src/controllers/vestibulares.controller.ts`

**Endpoints Implementados:**

- `list()`: Lista todos os vestibulares ativos
- `getByCode()`: Busca vestibular por código
- `create()`: Cria novo vestibular (Admin)
- `update()`: Atualiza vestibular (Admin)

#### 3. Rotas (`vestibulares.routes.ts`)

**Localização:** `apps/api/src/routes/vestibulares.routes.ts`

| Método | Rota                    | Proteção | Descrição                 |
| ------ | ----------------------- | -------- | ------------------------- |
| GET    | `/vestibulares`         | Pública  | Lista vestibulares        |
| GET    | `/vestibulares/:codigo` | Pública  | Detalhes de um vestibular |
| POST   | `/vestibulares`         | Admin    | Criar vestibular          |
| PUT    | `/vestibulares/:codigo` | Admin    | Atualizar vestibular      |

**Integração:** Registrado em `apps/api/src/app.ts` como `/vestibulares`

### Frontend

#### 1. Service (`vestibulares.service.ts`)

**Localização:** `apps/web/src/services/vestibulares.service.ts`

**Métodos:**

- `list()`: Busca lista de vestibulares
- `getByCode(codigo)`: Busca detalhes de um vestibular

#### 2. Página de Listagem (`ListaVestibulares.tsx`)

**Localização:** `apps/web/src/pages/public/Vestibulares/ListaVestibulares.tsx`

**Funcionalidades:**

- Grid responsivo com cards de vestibulares
- Exibe status das inscrições (aberto/encerrado/em breve)
- Link para detalhes
- Link para site oficial
- Informações da próxima prova (data, taxa)

**Design:**

- Cards Material-UI
- Chips coloridos por status
- Ícones informativos
- Responsivo (mobile-first)

## Próximos Passos

### 1. Adicionar Rota no Frontend

Editar `apps/web/src/App.tsx`:

```typescript
import { ListaVestibulares } from "./pages/public/Vestibulares/ListaVestibulares";

// Adicionar rota pública
<Route path="/vestibulares" element={<ListaVestibulares />} />;
```
### 2. Criar Página de Detalhes

Criar `apps/web/src/pages/public/Vestibulares/DetalhesVestibular.tsx`:

- Informações completas
- Histórico de provas
- Notas de corte
- Links para recursos

### 3. Popular Dados Iniciais

Criar script de seed com dados das universidades:

```typescript
// scripts/seed-vestibulares.ts
const vestibulares = [
  {
    codigo: "uem",
    nome: "UEM",
    nomeCompleto: "Universidade Estadual de Maringá",
    descricao: "...",
    siteOficial: "https://www.uem.br",
    // ...
  },
  // ENEM, UEPG, UEL, etc
];
```

### 4. Adicionar ao Menu

Editar `apps/web/src/config/navigation.ts`:

```typescript
// Adicionar item público no menu
{ title: "Vestibulares", path: "/vestibulares", icon: SchoolIcon }
```

## Integração com Google Drive (Futuro)

### Campos Preparados

O modelo já possui `googleDriveFolders` para armazenar:

- Pasta de provas
- Pasta de informações
- Pasta de notas de corte

### Workflow Planejado

1. Admin cadastra vestibular
2. Admin vincula pastas do Google Drive
3. Sistema sincroniza PDFs automaticamente
4. Extrai questões com GPT-4 Vision
5. Admin revisa e aprova questões

## Exemplos de Uso

### Criar Vestibular (API)

```bash
POST /vestibulares
{
  "codigo": "uem",
  "nome": "UEM",
  "nomeCompleto": "Universidade Estadual de Maringá",
  "descricao": "Universidade pública do Paraná",
  "siteOficial": "https://www.uem.br",
  "cidade": "Maringá",
  "estado": "PR",
  "proximaProva": {
    "data": "2024-12-15",
    "inscricoes": {
      "inicio": "2024-10-01",
      "fim": "2024-11-30",
      "status": "aberto"
    },
    "taxa": 150.00,
    "siteInscricao": "https://cvuem.uem.br"
  },
  "ativo": true,
  "ordem": 1
}
```

### Listar Vestibulares (Frontend)

```typescript
const vestibulares = await VestibularesService.list();
// Retorna array de vestibulares ativos, ordenados
```

## Arquivos Modificados/Criados

### Backend

- ✅ `apps/api/src/models/Vestibular.ts` (NOVO)
- ✅ `apps/api/src/controllers/vestibulares.controller.ts` (NOVO)
- ✅ `apps/api/src/routes/vestibulares.routes.ts` (NOVO)
- ✅ `apps/api/src/app.ts` (MODIFICADO - adicionada rota)

### Frontend

- ✅ `apps/web/src/services/vestibulares.service.ts` (NOVO)
- ✅ `apps/web/src/pages/public/Vestibulares/ListaVestibulares.tsx` (NOVO)
- ⏳ `apps/web/src/App.tsx` (PENDENTE - adicionar rota)
- ⏳ `apps/web/src/config/navigation.ts` (PENDENTE - adicionar menu)

### Documentação

- ✅ `docs/GPT4_VISION_INTEGRATION.md` (NOVO)
- ✅ `docs/VESTIBULARES_MODULE.md` (ESTE ARQUIVO)

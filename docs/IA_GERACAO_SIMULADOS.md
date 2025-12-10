# 🤖 IA para Criação Automática de Simulados

## Visão Geral

Sistema para gerar simulados automaticamente usando IA (GPT-4, Claude, Gemini, etc.) com base no banco de questões existente.

---

## Arquitetura Proposta

### Fluxo Completo

```
1. Admin define critérios → Matéria, dificuldade, quantidade, vestibular
2. IA seleciona questões → Algoritmo inteligente de seleção
3. IA gera simulado → Ordena questões, cria gabarito
4. Revisão opcional → Admin pode ajustar antes de publicar
5. Publicação → Simulado disponível para alunos
```

---

## Implementação

### 1. Model: `Simulado`

```typescript
// apps/api/src/models/Simulado.ts
export interface ISimulado extends Document {
  titulo: string;
  descricao: string;
  vestibularCodigo: string;

  // Critérios de geração
  criterios: {
    materias: string[]; // ["Matemática", "Física"]
    dificuldade: "facil" | "medio" | "dificil" | "mista";
    totalQuestoes: number; // 50
    distribuicao?: {
      // Opcional: distribuição por matéria
      materia: string;
      quantidade: number;
    }[];
  };

  // Questões selecionadas
  questoes: mongoose.Types.ObjectId[]; // Referências a Question
  gabarito: string[]; // ["A", "B", "C", ...]

  // Metadados
  geradoPorIA: boolean;
  modeloIA?: string; // "gpt-4", "claude-3", etc
  status: "rascunho" | "publicado" | "arquivado";
  criadoPor: mongoose.Types.ObjectId;

  // Estatísticas
  totalRealizacoes: number;
  mediaAcertos: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Service: `simulado-generator.service.ts`

```typescript
// apps/api/src/services/simulado-generator.service.ts
import OpenAI from "openai";
import { Question } from "../models/Question";

interface GenerateSimuladoParams {
  vestibularCodigo: string;
  materias: string[];
  dificuldade: string;
  totalQuestoes: number;
  distribuicao?: { materia: string; quantidade: number }[];
}

export async function generateSimuladoWithAI(params: GenerateSimuladoParams) {
  const {
    vestibularCodigo,
    materias,
    dificuldade,
    totalQuestoes,
    distribuicao,
  } = params;

  // 1. Buscar questões disponíveis
  const questoesDisponiveis = await Question.find({
    materia: { $in: materias },
    ...(dificuldade !== "mista" && { dificuldade }),
  });

  // 2. Preparar contexto para IA
  const contexto = {
    totalQuestoes,
    materias,
    dificuldade,
    distribuicao,
    questoesDisponiveis: questoesDisponiveis.map((q) => ({
      id: q._id,
      materia: q.materia,
      assunto: q.assunto,
      dificuldade: q.dificuldade,
    })),
  };

  // 3. Chamar IA para seleção inteligente
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Você é um especialista em criar simulados de vestibular.

CONTEXTO:
- Vestibular: ${vestibularCodigo.toUpperCase()}
- Total de questões: ${totalQuestoes}
- Matérias: ${materias.join(", ")}
- Dificuldade: ${dificuldade}
${distribuicao ? `- Distribuição: ${JSON.stringify(distribuicao)}` : ""}

QUESTÕES DISPONÍVEIS:
${JSON.stringify(contexto.questoesDisponiveis, null, 2)}

TAREFA:
Selecione ${totalQuestoes} questões para criar um simulado balanceado e educativo.

CRITÉRIOS:
1. Respeite a distribuição solicitada (se fornecida)
2. Varie os assuntos dentro de cada matéria
3. Se dificuldade = "mista", distribua: 40% fácil, 40% médio, 20% difícil
4. Evite questões muito similares
5. Ordene do mais fácil ao mais difícil

RETORNE JSON:
{
  "questoesSelecionadas": ["id1", "id2", ...],
  "justificativa": "Explicação da seleção",
  "distribuicaoFinal": {
    "Matemática": { "facil": 5, "medio": 8, "dificil": 2 },
    ...
  }
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const resultado = JSON.parse(response.choices[0].message.content!);

  return {
    questoesSelecionadas: resultado.questoesSelecionadas,
    justificativa: resultado.justificativa,
    distribuicaoFinal: resultado.distribuicaoFinal,
  };
}
```

### 3. Controller: `simulados.controller.ts`

```typescript
// apps/api/src/controllers/simulados.controller.ts
import { Request, Response } from "express";
import { Simulado } from "../models/Simulado";
import { generateSimuladoWithAI } from "../services/simulado-generator.service";

export class SimuladosController {
  // Gerar simulado com IA
  static async generateWithAI(req: Request, res: Response) {
    try {
      const {
        vestibularCodigo,
        materias,
        dificuldade,
        totalQuestoes,
        distribuicao,
      } = req.body;

      // Chamar IA
      const resultado = await generateSimuladoWithAI({
        vestibularCodigo,
        materias,
        dificuldade,
        totalQuestoes,
        distribuicao,
      });

      // Criar simulado em rascunho
      const simulado = await Simulado.create({
        titulo: `Simulado ${vestibularCodigo.toUpperCase()} - ${new Date().toLocaleDateString()}`,
        descricao: resultado.justificativa,
        vestibularCodigo,
        criterios: { materias, dificuldade, totalQuestoes, distribuicao },
        questoes: resultado.questoesSelecionadas,
        gabarito: [], // Será preenchido ao buscar as questões
        geradoPorIA: true,
        modeloIA: "gpt-4-turbo",
        status: "rascunho",
        criadoPor: req.user._id,
      });

      res.json({
        message: "Simulado gerado com sucesso!",
        simulado,
        distribuicaoFinal: resultado.distribuicaoFinal,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Listar simulados
  static async list(req: Request, res: Response) {
    try {
      const { status, vestibularCodigo } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (vestibularCodigo) filter.vestibularCodigo = vestibularCodigo;

      const simulados = await Simulado.find(filter)
        .populate("questoes")
        .populate("criadoPor", "name email")
        .sort({ createdAt: -1 });

      res.json(simulados);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Publicar simulado
  static async publish(req: Request, res: Response) {
    try {
      const simulado = await Simulado.findByIdAndUpdate(
        req.params.id,
        { status: "publicado" },
        { new: true }
      );

      if (!simulado) {
        return res.status(404).json({ error: "Simulado não encontrado" });
      }

      res.json(simulado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

### 4. Frontend: `GerarSimulado.tsx`

```typescript
// apps/web/src/pages/admin/Simulados/GerarSimulado.tsx
export function GerarSimulado() {
  const [formData, setFormData] = useState({
    vestibularCodigo: "",
    materias: [],
    dificuldade: "mista",
    totalQuestoes: 50,
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const result = await SimuladosService.generateWithAI(formData);
      showToast(`Simulado gerado! ${result.message}`, "success");
      navigate(`/admin/simulados/${result.simulado._id}/revisar`);
    } catch (error) {
      showToast(`Erro: ${error}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Gerar Simulado com IA</Typography>

      {/* Formulário de critérios */}
      <TextField select label="Vestibular" {...} />
      <TextField select label="Matérias" multiple {...} />
      <TextField select label="Dificuldade" {...} />
      <TextField type="number" label="Total de Questões" {...} />

      <Button onClick={handleGenerate}>
        Gerar Simulado
      </Button>
    </Box>
  );
}
```

---

## Alternativas de IA

### 1. OpenAI GPT-4

**Prós:**

- Melhor qualidade de seleção
- Entende contexto complexo
- JSON estruturado

**Contras:**

- Mais caro (~$0.03/1K tokens)

### 2. Anthropic Claude 3

**Prós:**

- Contexto maior (200K tokens)
- Ótimo para raciocínio
- Preço similar ao GPT-4

**Contras:**

- Requer API key separada

### 3. Google Gemini

**Prós:**

- Gratuito (tier básico)
- Integração com Google Drive
- Multimodal

**Contras:**

- Menos preciso que GPT-4

### 4. Algoritmo Próprio (Sem IA)

**Prós:**

- Grátis
- Controle total
- Rápido

**Contras:**

- Menos inteligente
- Requer lógica manual

---

## Custo Estimado

### Geração de 1 Simulado (50 questões)

- **Input:** ~2K tokens (questões disponíveis)
- **Output:** ~500 tokens (seleção)
- **Custo GPT-4:** ~$0.08 por simulado
- **Custo Gemini:** Grátis (até 60 req/min)

### Escala

- 100 simulados/mês = $8 (GPT-4) ou $0 (Gemini)
- 1000 simulados/mês = $80 (GPT-4) ou $0 (Gemini)

---

## Próximos Passos

1. ✅ Criar model `Simulado`
2. ✅ Implementar `simulado-generator.service.ts`
3. ✅ Criar controller e routes
4. ✅ Criar página de geração
5. ⏳ Página de revisão (ajustar questões)
6. ⏳ Página de visualização (alunos)
7. ⏳ Sistema de realização (timer, gabarito)

---

## Integração com Estrutura Atual

**Vantagens da arquitetura modular:**

1. **Reutilização:** Usa `Question` model existente
2. **Flexibilidade:** Fácil trocar de IA (GPT-4 → Gemini)
3. **Escalabilidade:** Service separado, fácil de testar
4. **Manutenibilidade:** Código organizado por domínio

**Exemplo de troca de IA:**

```typescript
// Trocar de GPT-4 para Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const result = await model.generateContent(prompt);
const response = JSON.parse(result.response.text());
```

**Apenas 5 linhas mudam!** 🎉

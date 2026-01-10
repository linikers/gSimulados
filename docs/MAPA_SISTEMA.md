# Mapa Técnico de Integração: ENEM Parser -> gSimulados

Este documento mapeia tecnicamente como trazer a inteligência do projeto Python (`ENEM_PDF_PARSER`) para o ecossistema `gSimulados` (Node.js/React).

## 1. O que o projeto Python usa (Tech Stack)

O projeto Python é um **Script de Linha de Comando (CLI)**, não uma API web. Isso significa que ele **não tem rotas** (endpoints HTTP), ele roda, processa e termina.

| Componente Python           | Biblioteca Usada | Função no Parser                                        | Equivalente Node.js (Se fosse reescrever)                                     |
| :-------------------------- | :--------------- | :------------------------------------------------------ | :---------------------------------------------------------------------------- |
| **Leitura de PDF**          | `pymupdf` (fitz) | Extrai texto e coordenadas (blocos) preservando layout. | `pdfjs-dist` ou `pdf-parse` (Geralmente menos robustos para layout complexo). |
| **Regex**                   | `re` (Nativo)    | Identifica padrões como "91 - " (início de questão).    | `RegExp` (Nativo JS).                                                         |
| **Estruturação**            | `json` (Nativo)  | Salva os dados processados em arquivo.                  | `fs` + `JSON.stringify`.                                                      |
| **Manipulação de Arquivos** | `os` (Nativo)    | Lê pastas e cria caminhos de output.                    | `path` e `fs` (Nativo Node).                                                  |

---

## 2. Mapa de Dados: Python -> gSimulados

Para integrar, precisaremos transformar o JSON de saída do Python para o Schema do MongoDB do gSimulados.

### Estrutura de Saída (Python JSON)

```json
{
  "numero": 91,
  "conteudo": "Texto da questão...",
  "gabarito": "A",
  "page_images": ["img_91_1.png"]
}
```

### Estrutura de Destino (gSimulados Schema)

Precisaremos de um adaptador (script Node.js) que faça este "De -> Para":

| Campo Python (`json`) | Campo gSimulados (`MongoDB`) | Tratamento Necessário                                                                                                                                                                                                                    |
| :-------------------- | :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `numero`              | `questionNumber`             | Cópia direta.                                                                                                                                                                                                                            |
| `conteudo`            | `statement`                  | Limpeza de espaços extras.                                                                                                                                                                                                               |
| `gabarito`            | `correctAlternative`         | Cópia direta.                                                                                                                                                                                                                            |
| **N/A**               | `alternatives`               | **Atenção:** O Python separa as alternativas ou entrega tudo no `conteudo`? _Análise do código mostra que ele entrega tudo misturado no conteúdo atualmente._ **Ajuste necessário:** Melhorar o regex Python para separar A, B, C, D, E. |
| `page_images`         | `images`                     | Upload para S3/Cloudinary e salvar URL, ou servir estático.                                                                                                                                                                              |
| **N/A**               | `subject`                    | Inferir pelo número (91-135=Natureza) no momento da importação.                                                                                                                                                                          |
| **N/A**               | `year`                       | Pegar do nome do arquivo ou parâmetro do script.                                                                                                                                                                                         |

---

## 3. Fluxo de Adaptação (Roadmap)

Como o projeto Python não tem rotas, a integração não será "chamar uma API". Será um **Pipeline de Dados**.

### Cenário A: Importação em Massa (Seed)

_Ideal para popular o banco de dados inicialmente._

1.  **Execução Python:**
    - Rodar `python enem_pdf_extractor.py` localmente.
    - Gera: `output/2024_natureza.json`.
2.  **Adaptação (Novo Script Node no gSimulados):**
    - Criar arquivo `scripts/import_questions.ts`.
    - Lê o JSON gerado.
    - Para cada questão:
      - Verifica se já existe no Banco.
      - Salva no MongoDB usando o Mongoose model `Question`.

### Cenário B: Processamento Sob Demanda (Upload no Site)

_Ideal se você quiser que o professor faça upload de um PDF novo no site e o sistema processe na hora._

1.  **Serviço Python:**
    - Transformar o script Python em uma API simples usando `FastAPI` ou `Flask`.
    - Criar rota `POST /parse-pdf`.
2.  **Integração Node:**
    - O Backend Node recebe o Upload.
    - Envia o arquivo para a API Python.
    - Recebe o JSON de volta e salva no banco.

## 4. Conclusão e Recomendação

O projeto `ENEM TESTE` é um **extrator simples**. Ele faz o trabalho sujo de ler PDF da prova do INEP.
Para "ligá-lo" ao gSimulados sem mudar a stack do projeto principal para Python, a melhor rota é o **Cenário A**:
Use o Python como uma ferramenta de bastidor para gerar os dados, e o Node.js apenas importa esses dados prontos.

**Próximo Passo Prático:**
Ajustar o Regex do Python (`extractor_utils.py`) para tentar separar o Texto Base das Alternativas, pois o gSimulados provavelmente vai querer exibir as alternativas como botões clicáveis, e não apenas texto corrido.

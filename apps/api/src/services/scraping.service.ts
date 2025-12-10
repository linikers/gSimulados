import axios from "axios";
import * as cheerio from "cheerio";
import { Vestibular } from "../models/Vestibular";

interface VestibularData {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  descricao: string;
  siteOficial: string;
  cidade?: string;
  estado?: string;
  regiao?: string;
  ordem: number;
  fonte: "scraping";
}

async function scrapeUTFPR(): Promise<Partial<VestibularData>> {
  try {
    const url =
      "https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/resultados";
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    const links: string[] = [];
    $("a").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (text && href && href.toLowerCase().includes("vestibular")) {
        links.push(`${text}: ${href}`);
      }
    });

    return {
      codigo: "utfpr",
      nome: "UTFPR",
      nomeCompleto: "Universidade Tecnológica Federal do Paraná",
      descricao: `Universidade federal com foco em tecnologia. Links: ${links
        .slice(0, 2)
        .join(", ")}`,
      siteOficial: "https://www.utfpr.edu.br",
      estado: "PR",
      regiao: "Sul",
      fonte: "scraping",
    };
  } catch (error) {
    console.error("Erro ao fazer scraping da UTFPR:", error);
    return {};
  }
}

async function scrapeUEL(): Promise<Partial<VestibularData>> {
  try {
    const url = "https://sites.uel.br/vestibular/";
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    const links: string[] = [];
    $("a").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (
        text &&
        href &&
        (text.toLowerCase().includes("vestibular") ||
          text.toLowerCase().includes("edital"))
      ) {
        links.push(`${text}: ${href}`);
      }
    });

    return {
      codigo: "uel",
      nome: "UEL",
      nomeCompleto: "Universidade Estadual de Londrina",
      descricao: `Universidade estadual do Paraná. Links: ${links
        .slice(0, 2)
        .join(", ")}`,
      siteOficial: "https://sites.uel.br/vestibular/",
      cidade: "Londrina",
      estado: "PR",
      regiao: "Sul",
      fonte: "scraping",
    };
  } catch (error) {
    console.error("Erro ao fazer scraping da UEL:", error);
    return {};
  }
}

// Dados estáticos base
const vestibularesBase: VestibularData[] = [
  {
    codigo: "enem",
    nome: "ENEM",
    nomeCompleto: "Exame Nacional do Ensino Médio",
    descricao: "Principal exame de acesso ao ensino superior no Brasil",
    siteOficial:
      "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem",
    regiao: "Nacional",
    ordem: 1,
    fonte: "scraping",
  },
  {
    codigo: "uem",
    nome: "UEM",
    nomeCompleto: "Universidade Estadual de Maringá",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.uem.br",
    cidade: "Maringá",
    estado: "PR",
    regiao: "Sul",
    ordem: 2,
    fonte: "scraping",
  },
  {
    codigo: "uepg",
    nome: "UEPG",
    nomeCompleto: "Universidade Estadual de Ponta Grossa",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.uepg.br",
    cidade: "Ponta Grossa",
    estado: "PR",
    regiao: "Sul",
    ordem: 3,
    fonte: "scraping",
  },
  {
    codigo: "ufpr",
    nome: "UFPR",
    nomeCompleto: "Universidade Federal do Paraná",
    descricao: "Universidade federal do Paraná",
    siteOficial: "https://www.ufpr.br",
    cidade: "Curitiba",
    estado: "PR",
    regiao: "Sul",
    ordem: 4,
    fonte: "scraping",
  },
  {
    codigo: "unioeste",
    nome: "UNIOESTE",
    nomeCompleto: "Universidade Estadual do Oeste do Paraná",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.unioeste.br",
    cidade: "Cascavel",
    estado: "PR",
    regiao: "Sul",
    ordem: 5,
    fonte: "scraping",
  },
  {
    codigo: "unicentro",
    nome: "UNICENTRO",
    nomeCompleto: "Universidade Estadual do Centro-Oeste",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.unicentro.br",
    cidade: "Guarapuava",
    estado: "PR",
    regiao: "Sul",
    ordem: 6,
    fonte: "scraping",
  },
];

export async function syncVestibulares() {
  try {
    console.log("🔍 Fazendo scraping de dados...");
    const utfprData = await scrapeUTFPR();
    const uelData = await scrapeUEL();

    // Mesclar dados scraped com base
    const vestibulares = [
      ...vestibularesBase,
      { ...uelData, ordem: 7 } as VestibularData,
      { ...utfprData, ordem: 8 } as VestibularData,
    ].filter((v) => v.codigo);

    console.log(`📚 Sincronizando ${vestibulares.length} vestibulares...`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const vestibular of vestibulares) {
      const existing = await Vestibular.findOne({ codigo: vestibular.codigo });

      // Se existe e foi criado manualmente, NÃO sobrescreve
      if (existing && existing.fonte === "manual") {
        console.log(`⏭️  ${vestibular.nome} - Pulado (cadastro manual)`);
        skipped++;
        continue;
      }

      // Se existe e veio de scraping, atualiza
      if (existing) {
        await Vestibular.findOneAndUpdate(
          { codigo: vestibular.codigo },
          { ...vestibular, ativo: true },
          { new: true }
        );
        console.log(`🔄 ${vestibular.nome} - Atualizado`);
        updated++;
      } else {
        // Se não existe, cria
        await Vestibular.create({ ...vestibular, ativo: true });
        console.log(`✅ ${vestibular.nome} - Criado`);
        created++;
      }
    }

    return {
      success: true,
      created,
      updated,
      skipped,
      total: vestibulares.length,
    };
  } catch (error: any) {
    console.error("❌ Erro ao sincronizar vestibulares:", error);
    throw error;
  }
}

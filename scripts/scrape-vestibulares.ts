/**
 * Script para fazer scraping de informações de vestibulares
 * e popular o banco de dados automaticamente
 *
 * Uso: node scripts/scrape-vestibulares.js
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { connectDB } from "../apps/api/src/config/database";
import { Vestibular } from "../apps/api/src/models/Vestibular";

interface VestibularData {
  codigo: string;
  nome: string;
  nomeCompleto: string;
  descricao: string;
  siteOficial: string;
  cidade?: string;
  estado?: string;
  ordem: number;
}

async function scrapeUTFPR(): Promise<Partial<VestibularData>> {
  try {
    const url =
      "https://www.utfpr.edu.br/cursos/estudenautfpr/vestibular/resultados";
    const { data } = await axios.get(url);
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
      descricao: `Universidade federal com foco em tecnologia. Links encontrados: ${links
        .slice(0, 3)
        .join(", ")}`,
      siteOficial: "https://www.utfpr.edu.br",
      estado: "PR",
    };
  } catch (error) {
    console.error("Erro ao fazer scraping da UTFPR:", error);
    return {};
  }
}

async function scrapeUEL(): Promise<Partial<VestibularData>> {
  try {
    const url = "https://sites.uel.br/vestibular/";
    const { data } = await axios.get(url);
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
      descricao: `Universidade estadual do Paraná. Links encontrados: ${links
        .slice(0, 3)
        .join(", ")}`,
      siteOficial: "https://sites.uel.br/vestibular/",
      cidade: "Londrina",
      estado: "PR",
    };
  } catch (error) {
    console.error("Erro ao fazer scraping da UEL:", error);
    return {};
  }
}

// Dados estáticos (fallback caso scraping falhe)
const vestibularesEstaticos: VestibularData[] = [
  {
    codigo: "enem",
    nome: "ENEM",
    nomeCompleto: "Exame Nacional do Ensino Médio",
    descricao: "Principal exame de acesso ao ensino superior no Brasil",
    siteOficial:
      "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem",
    ordem: 1,
  },
  {
    codigo: "uem",
    nome: "UEM",
    nomeCompleto: "Universidade Estadual de Maringá",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.uem.br",
    cidade: "Maringá",
    estado: "PR",
    ordem: 2,
  },
  {
    codigo: "uepg",
    nome: "UEPG",
    nomeCompleto: "Universidade Estadual de Ponta Grossa",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.uepg.br",
    cidade: "Ponta Grossa",
    estado: "PR",
    ordem: 3,
  },
  {
    codigo: "ufpr",
    nome: "UFPR",
    nomeCompleto: "Universidade Federal do Paraná",
    descricao: "Universidade federal do Paraná",
    siteOficial: "https://www.ufpr.br",
    cidade: "Curitiba",
    estado: "PR",
    ordem: 4,
  },
  {
    codigo: "unioeste",
    nome: "UNIOESTE",
    nomeCompleto: "Universidade Estadual do Oeste do Paraná",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.unioeste.br",
    cidade: "Cascavel",
    estado: "PR",
    ordem: 5,
  },
  {
    codigo: "unicentro",
    nome: "UNICENTRO",
    nomeCompleto: "Universidade Estadual do Centro-Oeste",
    descricao: "Universidade estadual do Paraná",
    siteOficial: "https://www.unicentro.br",
    cidade: "Guarapuava",
    estado: "PR",
    ordem: 6,
  },
];

async function popularVestibulares() {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    await connectDB();

    console.log("🔍 Fazendo scraping de dados...");
    const utfprData = await scrapeUTFPR();
    const uelData = await scrapeUEL();

    // Mesclar dados scraped com estáticos
    const vestibulares = [
      ...vestibularesEstaticos,
      {
        ...vestibularesEstaticos.find((v) => v.codigo === "uel"),
        ...uelData,
        ordem: 7,
      },
      { ...utfprData, ordem: 8 } as VestibularData,
    ].filter((v) => v.codigo); // Remove vazios

    console.log(`📚 Populando ${vestibulares.length} vestibulares...`);

    for (const vestibular of vestibulares) {
      await Vestibular.findOneAndUpdate(
        { codigo: vestibular.codigo },
        { ...vestibular, ativo: true },
        { upsert: true, new: true }
      );
      console.log(`✅ ${vestibular.nome} - ${vestibular.nomeCompleto}`);
    }

    console.log("🎉 Vestibulares populados com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao popular vestibulares:", error);
    process.exit(1);
  }
}

popularVestibulares();

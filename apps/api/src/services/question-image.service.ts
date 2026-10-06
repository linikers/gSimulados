import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { convertPdfPagesToImages } from "./pdf-processing.service";
import { uploadImage } from "./cloudinary.service";

const execFileAsync = promisify(execFile);

const DPI = Number(process.env.FIGURAS_DPI || 150);

export interface PaginaPublicada {
  pageNumber: number;
  url: string;
  publicId: string;
  largura?: number;
  altura?: number;
}

/** Lê largura/altura direto do cabeçalho PNG (sem dependência extra). */
function dimensoesPng(buffer: Buffer): { largura: number; altura: number } | null {
  if (buffer.length > 24 && buffer.toString("latin1", 1, 4) === "PNG") {
    return { largura: buffer.readUInt32BE(16), altura: buffer.readUInt32BE(20) };
  }
  return null;
}

/**
 * Renderiza uma página com o `pdftoppm` (poppler).
 *
 * Por que não usar o `pdf-img-convert`: ele depende do node-canvas e estoura
 * "Image or Canvas expected" exatamente nas páginas que possuem imagem embutida
 * — ou seja, justamente as páginas com figura. O poppler é um rasterizador de
 * PDF maduro e dá conta dessas páginas.
 */
async function renderizarPaginaComPoppler(
  pdfBuffer: Buffer,
  pageNumber: number,
): Promise<Buffer> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "figura-"));
  const pdfPath = path.join(dir, "entrada.pdf");
  const prefixo = path.join(dir, "pagina");

  try {
    await fs.writeFile(pdfPath, pdfBuffer);
    await execFileAsync(
      "pdftoppm",
      [
        "-png",
        "-r",
        String(DPI),
        "-f",
        String(pageNumber),
        "-l",
        String(pageNumber),
        pdfPath,
        prefixo,
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    );

    const arquivos = (await fs.readdir(dir)).filter((f) => f.endsWith(".png"));
    if (arquivos.length === 0) {
      throw new Error("pdftoppm não gerou imagem");
    }
    return await fs.readFile(path.join(dir, arquivos[0]));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

/** Renderiza as páginas pedidas; usa poppler e cai para pdf-img-convert se faltar. */
async function renderizarPaginas(
  pdfBuffer: Buffer,
  paginas: number[],
): Promise<Map<number, Buffer>> {
  const resultado = new Map<number, Buffer>();

  try {
    for (const pagina of paginas) {
      resultado.set(pagina, await renderizarPaginaComPoppler(pdfBuffer, pagina));
    }
    return resultado;
  } catch (error) {
    console.warn(
      `[imagens] poppler falhou (${(error as Error).message}) — tentando pdf-img-convert`,
    );
    resultado.clear();
  }

  const fallback = await convertPdfPagesToImages(pdfBuffer, paginas);
  for (const img of fallback) {
    resultado.set(img.pageNumber, img.imageBuffer);
  }
  return resultado;
}

/**
 * Renderiza as páginas pedidas do PDF e publica cada uma no Cloudinary.
 *
 * Uma página é enviada UMA única vez por PDF — várias questões podem estar na
 * mesma página e reaproveitam a mesma imagem. A figura de cada questão é
 * recortada no front pela `imagemBbox` (fração 0-1 da página), então não é
 * preciso nenhuma biblioteca de recorte no backend.
 */
export async function publicarPaginasDoPdf(
  pdfBuffer: Buffer,
  pageNumbers: number[],
  identificador: string,
): Promise<Map<number, PaginaPublicada>> {
  const publicadas = new Map<number, PaginaPublicada>();

  const paginas = [...new Set(pageNumbers)]
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);

  if (paginas.length === 0) return publicadas;

  const imagens = await renderizarPaginas(pdfBuffer, paginas);

  for (const [pageNumber, imageBuffer] of imagens) {
    const publicId = `${identificador}-p${pageNumber}`;
    try {
      const url = await uploadImage(imageBuffer, "questoes-figuras", publicId);
      const dimensoes = dimensoesPng(imageBuffer);
      publicadas.set(pageNumber, {
        pageNumber,
        url,
        publicId,
        ...(dimensoes ?? {}),
      });
      console.log(
        `[imagens] página ${pageNumber} publicada (${(imageBuffer.length / 1024).toFixed(0)} KB)`,
      );
    } catch (error) {
      console.warn(
        `[imagens] falha ao publicar página ${pageNumber}: ${(error as Error).message}`,
      );
    }
  }

  return publicadas;
}

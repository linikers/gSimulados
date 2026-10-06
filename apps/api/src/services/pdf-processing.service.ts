import pdf from "pdf-parse";
import pdfImgConvert from "pdf-img-convert";

export async function convertPdfToImages(
  pdfBuffer: Buffer
): Promise<{ pageNumber: number; imageBuffer: Buffer }[]> {
  const images = await pdfImgConvert.convert(pdfBuffer, {
    scale: 2.0, // Melhor qualidade para OCR
  });

  return images.map((img, index) => ({
    pageNumber: index + 1,
    imageBuffer: Buffer.from(img),
  }));
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}

/**
 * Converte SOMENTE as páginas pedidas — evita renderizar o PDF inteiro quando
 * só algumas páginas têm figura. Devolve na mesma ordem de `pageNumbers`.
 */
export async function convertPdfPagesToImages(
  pdfBuffer: Buffer,
  pageNumbers: number[],
  scale = 2.0
): Promise<{ pageNumber: number; imageBuffer: Buffer }[]> {
  const paginas = [...new Set(pageNumbers)]
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);

  if (paginas.length === 0) return [];

  const images = await pdfImgConvert.convert(pdfBuffer, {
    scale,
    page_numbers: paginas,
  });

  return images.map((img, index) => ({
    pageNumber: paginas[index],
    imageBuffer: Buffer.from(img),
  }));
}

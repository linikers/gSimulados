import pdf from "pdf-parse";
// import { pdf } from "pdf-parse";
import { PDFDocument } from "pdf-lib";

export async function convertPdfToImages(
  pdfBuffer: Buffer
): Promise<{ pageNumber: number; imageBuffer: Buffer }[]> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();
  const images: { pageNumber: number; imageBuffer: Buffer }[] = [];

  // TODO: Para conversão REAL de PDF para Imagem no Node.js sem binários externos (Ghostscript/Poppler),
  // a melhor opção seria usar uma biblioteca como 'pdf-img-convert' (que usa Puppeteer)
  // ou 'pdfjs-dist' com 'canvas'.
  // Por enquanto, mantendo o placeholder conforme o plano para não bloquear a implementação.

  for (let i = 0; i < pageCount; i++) {
    const imageBuffer = Buffer.from("placeholder"); // Placeholder
    images.push({ pageNumber: i + 1, imageBuffer });
  }

  return images;
}

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}

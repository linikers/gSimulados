import pdf from "pdf-parse";
import pdfImgConvert from "pdf-img-convert";
// import { pdf } from "pdf-parse";
import { PDFDocument } from "pdf-lib";

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

declare module "pdf-parse" {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdf(
    dataBuffer: Buffer | Uint8Array,
    options?: any
  ): Promise<PDFParseResult>;

  export default pdf;
}

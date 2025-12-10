import api from "./api";

export interface IPdfSource {
  _id: string;
  driveConfigId: string;
  vestibularCodigo: string;
  driveFileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  webViewLink: string;
  uploadDate: string;
  status: "pending" | "processing" | "completed" | "error";
  totalPaginas?: number;
  questoesExtraidas: number;
  errorMessage?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExtractionStats {
  pdfs: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    error: number;
  };
  questions: {
    total: number;
    pendingReview: number;
    approved: number;
  };
}

export const PdfExtractionService = {
  listPdfs: async (vestibularCodigo?: string, status?: string) => {
    const params: Record<string, string> = {};
    if (vestibularCodigo) params.vestibularCodigo = vestibularCodigo;
    if (status) params.status = status;

    const response = await api.get<IPdfSource[]>("/extraction/pdfs", {
      params,
    });
    return response.data;
  },

  extractFromPdf: async (id: string) => {
    const response = await api.post(`/extraction/pdfs/${id}/extract`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<IExtractionStats>("/extraction/stats");
    return response.data;
  },
};

import api from "./api";

export interface IDriveConfig {
  _id: string;
  vestibularCodigo: string;
  googleDriveFolderId: string;
  folderName: string;
  folderUrl: string;
  lastSync?: string;
  totalPdfs: number;
  totalQuestoesExtraidas: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDriveConfigForm {
  vestibularCodigo: string;
  googleDriveFolderId: string;
  folderName: string;
  folderUrl: string;
}

export const DriveConfigService = {
  list: async () => {
    const response = await api.get<IDriveConfig[]>("/drive-config");
    return response.data;
  },

  getByVestibular: async (codigo: string) => {
    const response = await api.get<IDriveConfig>(`/drive-config/${codigo}`);
    return response.data;
  },

  upsert: async (data: IDriveConfigForm) => {
    const response = await api.post<IDriveConfig>("/drive-config", data);
    return response.data;
  },

  syncPdfs: async (codigo: string) => {
    const response = await api.post(`/drive-config/${codigo}/sync`);
    return response.data;
  },

  delete: async (codigo: string) => {
    const response = await api.delete(`/drive-config/${codigo}`);
    return response.data;
  },
};

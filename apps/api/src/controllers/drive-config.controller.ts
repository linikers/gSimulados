import { Request, Response } from "express";
import { DriveConfig } from "../models/DriveConfig";
import { PdfSource } from "../models/PdfSource";

export class DriveConfigController {
  // Listar configurações de Drive
  static async list(_req: Request, res: Response) {
    try {
      const configs = await DriveConfig.find().sort({ createdAt: -1 });
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Obter configuração por vestibular
  static async getByVestibular(req: Request, res: Response) {
    try {
      const config = await DriveConfig.findOne({
        vestibularCodigo: req.params.codigo,
      });
      if (!config) {
        return res.status(404).json({ error: "Configuração não encontrada" });
      }
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar/Atualizar configuração
  static async upsert(req: Request, res: Response) {
    try {
      const { vestibularCodigo, googleDriveFolderId, folderName, folderUrl } =
        req.body;

      const config = await DriveConfig.findOneAndUpdate(
        { vestibularCodigo },
        {
          googleDriveFolderId,
          folderName,
          folderUrl,
          ativo: true,
        },
        { upsert: true, new: true }
      );

      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Sincronizar PDFs do Drive
  static async syncPdfs(req: Request, res: Response) {
    try {
      const { codigo } = req.params;

      // TODO: Implementar integração real com Google Drive API
      // Por enquanto, retorna mock

      const config = await DriveConfig.findOne({ vestibularCodigo: codigo });
      if (!config) {
        return res.status(404).json({ error: "Configuração não encontrada" });
      }

      // Mock: simula encontrar 3 PDFs
      const mockPdfs = [
        {
          driveFileId: "mock-id-1",
          fileName: `${codigo}_2024.pdf`,
          fileSize: 1024000,
          webViewLink: "https://drive.google.com/file/mock-1",
        },
        {
          driveFileId: "mock-id-2",
          fileName: `${codigo}_2023.pdf`,
          fileSize: 2048000,
          webViewLink: "https://drive.google.com/file/mock-2",
        },
      ];

      let created = 0;
      for (const pdf of mockPdfs) {
        const existing = await PdfSource.findOne({
          driveFileId: pdf.driveFileId,
        });
        if (!existing) {
          await PdfSource.create({
            driveConfigId: config._id,
            vestibularCodigo: codigo,
            ...pdf,
            uploadDate: new Date(),
          });
          created++;
        }
      }

      // Atualizar contagem
      const totalPdfs = await PdfSource.countDocuments({
        driveConfigId: config._id,
      });

      await DriveConfig.findByIdAndUpdate(config._id, {
        totalPdfs,
        lastSync: new Date(),
      });

      res.json({
        message: "Sincronização concluída",
        created,
        total: totalPdfs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar configuração
  static async delete(req: Request, res: Response) {
    try {
      const config = await DriveConfig.findOneAndDelete({
        vestibularCodigo: req.params.codigo,
      });
      if (!config) {
        return res.status(404).json({ error: "Configuração não encontrada" });
      }
      res.json({ message: "Configuração removida com sucesso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

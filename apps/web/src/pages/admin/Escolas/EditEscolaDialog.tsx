import { useState, useEffect } from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import type { IEscola } from "@gsimulados/shared";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

interface EditEscolaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<IEscola>) => Promise<void>;
  escola: IEscola | null;
}

export function EditEscolaDialog({
  open,
  onClose,
  onSave,
  escola,
}: EditEscolaDialogProps) {
  const [formData, setFormData] = useState<Partial<IEscola>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (escola) {
      setFormData({
        name: escola.name,
        email: escola.email,
        cnpj: escola.cnpj,
        nomeEscola: escola.nomeEscola,
        endereco: escola.endereco,
        telefone: escola.telefone,
        logo: escola.logo || escola.avatar,
      });
    }
  }, [escola]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Escola"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" loading={loading}>
            Salvar
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
            position: "relative",
          }}
        >
          <Avatar
            src={formData.logo || formData.avatar}
            sx={{ width: 100, height: 100 }}
            variant="rounded"
          >
            {formData.name?.[0]}
          </Avatar>
          <IconButton
            color="primary"
            aria-label="upload logo"
            component="label"
            sx={{
              position: "absolute",
              bottom: 0,
              right: "calc(50% - 60px)",
              backgroundColor: "white",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
          >
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData((prev) => ({
                      ...prev,
                      logo: reader.result as string,
                      avatar: reader.result as string,
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <PhotoCameraIcon />
          </IconButton>
        </Box>

        <Input
          label="Nome do Responsável/Sistema"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
        />
        <Input
          label="Nome da Escola"
          name="nomeEscola"
          value={formData.nomeEscola || ""}
          onChange={handleChange}
        />
        <Input
          label="CNPJ"
          name="cnpj"
          value={formData.cnpj || ""}
          onChange={handleChange}
        />
        <Input
          label="Telefone"
          name="telefone"
          value={formData.telefone || ""}
          onChange={handleChange}
        />
        <Input
          label="Endereço"
          name="endereco"
          value={formData.endereco || ""}
          onChange={handleChange}
        />
      </Box>
    </Modal>
  );
}

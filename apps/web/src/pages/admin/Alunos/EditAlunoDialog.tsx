import { useState, useEffect } from "react";
import { Box, Avatar, IconButton } from "@mui/material";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import type { IAluno } from "@gsimulados/shared";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

interface EditAlunoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<IAluno>) => Promise<void>;
  aluno: IAluno | null;
}

export function EditAlunoDialog({
  open,
  onClose,
  onSave,
  aluno,
}: EditAlunoDialogProps) {
  const [formData, setFormData] = useState<Partial<IAluno>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aluno) {
      setFormData({
        name: aluno.name,
        email: aluno.email,
        matricula: aluno.matricula,
        avatar: aluno.avatar,
      });
    }
  }, [aluno]);

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
      title="Editar Aluno"
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
          <Avatar src={formData.avatar} sx={{ width: 100, height: 100 }}>
            {formData.name?.[0]}
          </Avatar>
          <IconButton
            color="primary"
            aria-label="upload picture"
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
                  // For now, we'll just store a data URL.
                  // In a real app, you'd upload this to a server/S3.
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData((prev) => ({
                      ...prev,
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
          label="Nome"
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
          label="Matrícula"
          name="matricula"
          value={formData.matricula || ""}
          onChange={handleChange}
        />
        <Input
          label="URL do Avatar (Opcional)"
          name="avatar"
          value={formData.avatar || ""}
          onChange={handleChange}
          helperText="Você também pode colar uma URL direta para a imagem"
        />
      </Box>
    </Modal>
  );
}

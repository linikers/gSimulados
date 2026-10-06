import { Box, Typography } from "@mui/material";

export interface ImagemBbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface QuestaoFiguraProps {
  imagemUrl: string;
  bbox?: ImagemBbox;
  larguraPagina?: number;
  alturaPagina?: number;
  descricao?: string;
}

/**
 * Mostra a figura da questão.
 *
 * A imagem publicada é a PÁGINA inteira do PDF; a figura é recortada aqui pelo
 * `viewBox` do SVG usando a região (bbox) que a IA devolveu, em fração da
 * página. Vantagens: nenhuma biblioteca de recorte no backend, e o SVG escala
 * sozinho (responsivo) sem perder o enquadramento.
 */
export function QuestaoFigura({
  imagemUrl,
  bbox,
  larguraPagina,
  alturaPagina,
  descricao,
}: QuestaoFiguraProps) {
  const podeRecortar =
    !!bbox && !!larguraPagina && !!alturaPagina && bbox.w > 0 && bbox.h > 0;

  if (podeRecortar) {
    const L = larguraPagina as number;
    const H = alturaPagina as number;
    const viewBox = `${bbox!.x * L} ${bbox!.y * H} ${bbox!.w * L} ${bbox!.h * H}`;

    return (
      <Box sx={{ my: 2 }}>
        <Box
          component="svg"
          viewBox={viewBox}
          role="img"
          aria-label={descricao || "Figura da questão"}
          sx={{
            width: "100%",
            maxWidth: 520,
            display: "block",
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "var(--border-color)",
            borderRadius: 2,
          }}
        >
          <image href={imagemUrl} x={0} y={0} width={L} height={H} />
        </Box>
        {descricao && (
          <Typography variant="caption" color="text.secondary">
            Figura: {descricao}
          </Typography>
        )}
      </Box>
    );
  }

  // Sem região confiável: mostra a página inteira em vez de arriscar um recorte errado.
  return (
    <Box sx={{ my: 2 }}>
      <Box
        component="img"
        src={imagemUrl}
        alt={descricao || "Figura da questão"}
        sx={{
          maxWidth: "100%",
          display: "block",
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: "var(--border-color)",
          borderRadius: 2,
        }}
      />
      {descricao && (
        <Typography variant="caption" color="text.secondary">
          Figura: {descricao}
        </Typography>
      )}
    </Box>
  );
}

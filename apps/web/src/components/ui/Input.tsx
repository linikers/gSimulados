import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export type InputProps = TextFieldProps;

export function Input(props: InputProps) {
  return <TextField variant="outlined" fullWidth margin="normal" {...props} />;
}

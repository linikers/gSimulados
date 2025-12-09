import { Card as MuiCard, CardContent, CardHeader } from "@mui/material";
import type { CardProps as MuiCardProps } from "@mui/material";

interface CardProps extends MuiCardProps {
  title?: string;
  subheader?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({
  title,
  subheader,
  action,
  children,
  ...props
}: CardProps) {
  return (
    <MuiCard {...props} elevation={2} sx={{ borderRadius: 2, ...props.sx }}>
      {(title || action) && (
        <CardHeader title={title} subheader={subheader} action={action} />
      )}
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
}

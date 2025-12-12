import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/public/Navbar";
import { Footer } from "../components/public/Footer";

export function PublicLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar /> {/* Espaçador para compensar o Navbar fixed */}
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}

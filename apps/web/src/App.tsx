import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { AdminLayout } from "./layouts/AdminLayout";
import { CadastroEscola } from "./pages/admin/Escolas/CadastroEscola";
import { CadastroAluno } from "./pages/admin/Alunos/CadastroAluno";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { GlobalSnackbar } from "./components/Feedback/GlobalSnackbar";
import { AuthGuard } from "./routes/AuthGuard";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function Dashboard() {
  return <h1>Dashboard (Protegido)</h1>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GlobalSnackbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Rotas Protegidas */}
            <Route element={<AuthGuard />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Rotas de Admin */}
              <Route element={<AuthGuard allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="escolas/cadastro" element={<CadastroEscola />} />
                  <Route path="alunos/cadastro" element={<CadastroAluno />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

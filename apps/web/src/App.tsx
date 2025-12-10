import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { AppLayout } from "./layouts/AppLayout";
import { CadastroEscola } from "./pages/admin/Escolas/CadastroEscola";
import { CadastroAluno } from "./pages/admin/Alunos/CadastroAluno";
import { ListaEscolas } from "./pages/admin/Escolas/ListaEscolas";
import { ListaAlunos } from "./pages/admin/Alunos/ListaAlunos";
import { CadastroQuestao } from "./pages/admin/Questions/CadastroQuestao";
import { GerenciarVestibulares } from "./pages/admin/Vestibulares/GerenciarVestibulares";
import { FormularioVestibular } from "./pages/admin/Vestibulares/FormularioVestibular";
import { ConfigurarDrive } from "./pages/admin/BancoQuestoes/ConfigurarDrive";
import { ListaPdfs } from "./pages/admin/BancoQuestoes/ListaPdfs";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { GlobalSnackbar } from "./components/Feedback/GlobalSnackbar";
import { AuthGuard } from "./routes/AuthGuard";
import { useAuth } from "./hooks/useAuth";

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
  const { user } = useAuth();
  return (
    <div>
      <h1>Bem-vindo, {user?.name}</h1>
      <p>Perfil: {user?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GlobalSnackbar />
        <BrowserRouter>
          <Routes>
                    element={<CadastroAluno />}
                  />
                  <Route
                    path="/admin/questoes/cadastro"
                    element={<CadastroQuestao />}
                  />
                  <Route
                    path="/admin/vestibulares"
                    element={<GerenciarVestibulares />}
                  />
                  <Route
                    path="/admin/vestibulares/cadastro"
                    element={<FormularioVestibular />}
                  />
                  <Route
                    path="/admin/vestibulares/editar/:codigo"
                    element={<FormularioVestibular />}
                  />
                </Route>

                {/* Rotas de Escola */}
                <Route element={<AuthGuard allowedRoles={["escola"]} />}>
                  <Route path="/escola/alunos" element={<ListaAlunos />} />
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

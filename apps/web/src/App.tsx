import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/auth/Login";
import { RegisterPage } from "./pages/auth/Register";
import { AppLayout } from "./layouts/AppLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { CadastroEscola } from "./pages/admin/Escolas/CadastroEscola";
import { CadastroAluno } from "./pages/admin/Alunos/CadastroAluno";
import { ListaEscolas } from "./pages/admin/Escolas/ListaEscolas";
import { ListaAlunos } from "./pages/admin/Alunos/ListaAlunos";
import { CadastroQuestao } from "./pages/admin/Questions/CadastroQuestao";
import { GerenciarVestibulares } from "./pages/admin/Vestibulares/GerenciarVestibulares";
import { FormularioVestibular } from "./pages/admin/Vestibulares/FormularioVestibular";
import { ConfigurarDrive } from "./pages/admin/BancoQuestoes/ConfigurarDrive";
import { ListaPdfs } from "./pages/admin/BancoQuestoes/ListaPdfs";
import { RevisarQuestoes } from "./pages/admin/BancoQuestoes/RevisarQuestoes";
import { ListaQuestoes } from "./pages/admin/BancoQuestoes/ListaQuestoes";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { GlobalSnackbar } from "./components/Feedback/GlobalSnackbar";
import { AuthGuard } from "./routes/AuthGuard";
import { useAuth } from "./hooks/useAuth";

// Public Pages
import { Home } from "./pages/public/Home";
import { Sobre } from "./pages/public/Sobre";
import { AulasEMentorias } from "./pages/public/mentoria/AulasEMentorias";
import { Beneficios } from "./pages/public/mentoria/Beneficios";
import { ListaVestibulares } from "./pages/public/Vestibulares/ListaVestibulares";
import { DetalhesVestibular } from "./pages/public/Vestibulares/DetalhesVestibular";
import { ListaSeriados } from "./pages/public/seriados/ListaSeriados";
import { Materiais } from "./pages/public/Materiais";
import { Ferramentas } from "./pages/public/ferramentas/Ferramentas";
import { Marketplace } from "./pages/public/ferramentas/Marketplace";
import { Aprovacoes } from "./pages/public/Aprovacoes";
import { FAQ } from "./pages/public/FAQ";
import GerarSimulado from "./pages/public/Simulados/GerarSimulado";
import MeusSimulados from "./pages/public/Simulados/MeusSimulados";
import VisualizarSimulado from "./pages/public/Simulados/VisualizarSimulado";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
      light: "#1E88E5",
      dark: "#0D47A1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2E7D32",
      light: "#43A047",
      dark: "#1B5E20",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFBFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A2E",
      secondary: "#546E7A",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
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
            {/* Public Routes with PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/aulas-e-mentorias" element={<AulasEMentorias />} />
              <Route path="/beneficios" element={<Beneficios />} />
              <Route path="/vestibulares" element={<ListaVestibulares />} />
              <Route
                path="/vestibulares/:codigo"
                element={<DetalhesVestibular />}
              />
              <Route path="/seriados" element={<ListaSeriados />} />
              <Route path="/materiais" element={<Materiais />} />
              <Route path="/ferramentas" element={<Ferramentas />} />
              <Route
                path="/ferramentas/marketplace"
                element={<Marketplace />}
              />
              <Route path="/aprovacoes" element={<Aprovacoes />} />
              <Route path="/faq" element={<FAQ />} />
            </Route>

            {/* Auth Routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes with AppLayout */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Patient/Student Routes */}
                <Route path="/aluno/simulados" element={<MeusSimulados />} />
                <Route
                  path="/aluno/simulados/gerar"
                  element={<GerarSimulado />}
                />
                <Route
                  path="/aluno/simulados/:id"
                  element={<VisualizarSimulado />}
                />

                {/* Admin Routes */}
                <Route element={<AuthGuard allowedRoles={["admin"]} />}>
                  <Route path="/admin/escolas" element={<ListaEscolas />} />
                  <Route
                    path="/admin/escolas/cadastro"
                    element={<CadastroEscola />}
                  />
                  <Route path="/admin/alunos" element={<ListaAlunos />} />
                  <Route
                    path="/admin/alunos/cadastro"
                    element={<CadastroAluno />}
                  />
                  <Route
                    path="/admin/questoes/cadastro"
                    element={<CadastroQuestao />}
                  />

                  {/* Vestibulares */}
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

                  {/* Banco de Questões */}
                  <Route
                    path="/admin/banco-questoes/drive"
                    element={<ConfigurarDrive />}
                  />
                  <Route
                    path="/admin/banco-questoes/pdfs"
                    element={<ListaPdfs />}
                  />
                  <Route
                    path="/admin/banco-questoes/revisar"
                    element={<RevisarQuestoes />}
                  />
                  <Route
                    path="/admin/banco-questoes/questoes"
                    element={<ListaQuestoes />}
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

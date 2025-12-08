import type { UserRole } from "@gsimulados/shared";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ClassIcon from "@mui/icons-material/Class";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

type NavigationConfig = {
  [key in UserRole]: NavItem[];
};

export const navigationConfig: NavigationConfig = {
  admin: [
    { title: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { title: "Escolas", path: "/admin/escolas/cadastro", icon: SchoolIcon },
    { title: "Alunos", path: "/admin/alunos/cadastro", icon: PersonIcon },
    { title: "Configurações", path: "/admin/config", icon: SettingsIcon },
    { title: "Analytics", path: "/admin/analytics", icon: BarChartIcon },
  ],
  escola: [
    { title: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { title: "Alunos", path: "/escola/alunos", icon: PersonIcon },
    { title: "Turmas", path: "/escola/turmas", icon: ClassIcon },
    { title: "Simulados", path: "/escola/simulados", icon: QuizIcon },
    { title: "Relatórios", path: "/escola/relatorios", icon: BarChartIcon },
  ],
  aluno: [
    { title: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { title: "Meus Simulados", path: "/aluno/simulados", icon: QuizIcon },
    {
      title: "Meus Resultados",
      path: "/aluno/resultados",
      icon: AssignmentIcon,
    },
    { title: "Meu Desempenho", path: "/aluno/desempenho", icon: BarChartIcon },
  ],
};

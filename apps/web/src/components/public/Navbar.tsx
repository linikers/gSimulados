import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vestibularesAnchor, setVestibularesAnchor] =
    useState<null | HTMLElement>(null);
  const [seriadosAnchor, setSeriadosAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [vestibularesOpenMobile, setVestibularesOpenMobile] = useState(false);
  const [seriadosOpenMobile, setSeriadosOpenMobile] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setVestibularesAnchor(null);
    setSeriadosAnchor(null);
  };

  const menuItems = [
    { label: "Início", path: "/" },
    { label: "Sobre", path: "/sobre" },
    { label: "Mentoria", path: "/aulas-e-mentorias" },
    { label: "Vestibulares", path: "/vestibulares", hasSubmenu: true },
    { label: "Seriados", path: "/seriados", hasSubmenu: true },
    { label: "Materiais", path: "/materiais" },
    { label: "Ferramentas", path: "/ferramentas" },
    { label: "Aprovações", path: "/aprovacoes" },
    { label: "Simulados", path: "/aluno/simulados" },
  ];

  // ... (rest of the file remains same, targeting the lines around 27 and title)
  // Wait, I need to execute replace chunks carefully.

  const vestibularesSubmenu = [
    { label: "ENEM", path: "/vestibulares/enem" },
    { label: "UEM", path: "/vestibulares/uem" },
    { label: "UEPG", path: "/vestibulares/uepg" },
    { label: "UNICENTRO", path: "/vestibulares/unicentro" },
    { label: "UEL", path: "/vestibulares/uel" },
    { label: "UFPR", path: "/vestibulares/ufpr" },
    { label: "UNIOESTE", path: "/vestibulares/unioeste" },
  ];

  const seriadosSubmenu = [
    { label: "PAS - UEM", path: "/seriados/pas-uem" },
    { label: "PAC - UNICENTRO", path: "/seriados/pac-unicentro" },
    { label: "PSS - UEPG", path: "/seriados/pss-uepg" },
  ];

  const drawer = (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Prof. Jean Ribeiro
      </Typography>
      <List>
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.hasSubmenu ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.label === "Vestibulares") {
                        setVestibularesOpenMobile(!vestibularesOpenMobile);
                      } else if (item.label === "Seriados") {
                        setSeriadosOpenMobile(!seriadosOpenMobile);
                      }
                    }}
                    sx={{ minHeight: 48 }}
                  >
                    <ListItemText primary={item.label} />
                    {item.label === "Vestibulares" ? (
                      vestibularesOpenMobile ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )
                    ) : seriadosOpenMobile ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse
                  in={
                    item.label === "Vestibulares"
                      ? vestibularesOpenMobile
                      : seriadosOpenMobile
                  }
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem disablePadding>
                      <ListItemButton
                        sx={{ pl: 4, minHeight: 48 }}
                        onClick={() => handleNavigate(item.path)}
                      >
                        <ListItemText primary="Ver Todos" />
                      </ListItemButton>
                    </ListItem>
                    {(item.label === "Vestibulares"
                      ? vestibularesSubmenu
                      : seriadosSubmenu
                    ).map((subItem) => (
                      <ListItem key={subItem.path} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4, minHeight: 48 }}
                          onClick={() => handleNavigate(subItem.path)}
                        >
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{ minHeight: 48 }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )}
          </div>
        ))}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigate("/login")}
            sx={{ minHeight: 48 }}
          >
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              cursor: "pointer",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
            onClick={() => handleNavigate("/")}
          >
            Prof. Jean Ribeiro
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="Abrir menu de navegação"
              aria-expanded={mobileOpen}
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.hasSubmenu ? (
                    <>
                      <Button
                        color="inherit"
                        onClick={(e) => {
                          if (item.label === "Vestibulares") {
                            setVestibularesAnchor(e.currentTarget);
                          } else if (item.label === "Seriados") {
                            setSeriadosAnchor(e.currentTarget);
                          }
                        }}
                        aria-expanded={
                          item.label === "Vestibulares"
                            ? Boolean(vestibularesAnchor)
                            : Boolean(seriadosAnchor)
                        }
                        aria-haspopup="true"
                      >
                        {item.label}
                      </Button>
                    </>
                  ) : (
                    <Button
                      color="inherit"
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.label}
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleNavigate("/login")}
                sx={{ ml: 1 }}
              >
                Login
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {/* Vestibulares Menu */}
      <Menu
        anchorEl={vestibularesAnchor}
        open={Boolean(vestibularesAnchor)}
        onClose={() => setVestibularesAnchor(null)}
      >
        <MenuItem onClick={() => handleNavigate("/vestibulares")}>
          <strong>Todos os Vestibulares</strong>
        </MenuItem>
        {vestibularesSubmenu.map((item) => (
          <MenuItem key={item.path} onClick={() => handleNavigate(item.path)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      {/* Seriados Menu */}
      <Menu
        anchorEl={seriadosAnchor}
        open={Boolean(seriadosAnchor)}
        onClose={() => setSeriadosAnchor(null)}
      >
        <MenuItem onClick={() => handleNavigate("/seriados")}>
          <strong>Todos os Seriados</strong>
        </MenuItem>
        {seriadosSubmenu.map((item) => (
          <MenuItem key={item.path} onClick={() => handleNavigate(item.path)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

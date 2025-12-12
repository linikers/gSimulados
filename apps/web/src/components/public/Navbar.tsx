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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vestibularesAnchor, setVestibularesAnchor] =
    useState<null | HTMLElement>(null);
  const [seriadosAnchor, setSeriadosAnchor] = useState<null | HTMLElement>(
    null
  );

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
  ];

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
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Prof. Jean Ribeiro
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate("/login")}>
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer", fontWeight: "bold" }}
            onClick={() => handleNavigate("/")}
          >
            Prof. Jean Ribeiro
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
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
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

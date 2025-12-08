import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Divider,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { navigationConfig } from "../config/navigation";

const drawerWidth = 240;

export function AdminLayout() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <ListItemButton onClick={handleLogout} sx={{ flexGrow: 0 }}>
            <ListItemText primary="Sair" sx={{ color: "white" }} />
          </ListItemButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {user?.role &&
              navigationConfig[user.role as keyof typeof navigationConfig]?.map(
                (item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton onClick={() => navigate(item.path)}>
                      <item.icon sx={{ mr: 2 }} />
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </ListItem>
                )
              )}
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

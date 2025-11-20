import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import Divider from '@mui/material/Divider';
import TerrainIcon from '@mui/icons-material/Terrain';
import { Link, useLocation, useNavigate } from 'react-router';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '../hooks/useAuth.jsx'; 
import { Box, Collapse } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

/*
  Side menu component for admin users.
  This contains navigation links to different admin sections in the 
  "long" form layout.
*/

export default function Menu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openLeaderboard, setOpenLeaderboard] = useState(false);

const handleLogout = () => {
  logout();
  navigate('/');
};

  const location = useLocation();
  const currentPath = location.pathname;

  const handleLeaderboardClick = () => {
    setOpenLeaderboard(!openLeaderboard);
  };

  // Dynamic menu lateral items
  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/admin' },
    { text: 'Participantes', icon: <PersonIcon />, path: '/participants' },
    { text: 'Rutas/Bloques', icon: <TerrainIcon />, path: '/routes-admin' },
  ];

  // Leaderboard submenu items
  const leaderboardItems = [
    { text: 'Kids', path: '/leaderboard-kids' },
    { text: 'Principiantes', path: '/leaderboard-principiantes' },
    { text: 'Intermedios', path: '/leaderboard-intermedio' },
    { text: 'Avanzados', path: '/leaderboard-avanzado' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
            <ListSubheader component="div" id="nested-list-subheader">
                Overview
            </ListSubheader>
        }
        >

          {menuItems.map((item) => (
              <ListItemButton 
                component={Link} 
                to={item.path} 
                selected={currentPath === item.path} 
                key={item.text}
              >
                  <ListItemIcon>
                      {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
              </ListItemButton>
          ))}

          <ListItemButton onClick={handleLeaderboardClick}>
              <ListItemIcon>
                  <LeaderboardIcon />
              </ListItemIcon>
              <ListItemText primary="Leaderboard" />
              {openLeaderboard ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openLeaderboard} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                  {leaderboardItems.map((item) => (
                      <ListItemButton 
                          component={Link} 
                          to={item.path} 
                          selected={currentPath === item.path} 
                          key={item.text}
                          sx={{ pl: 4 }}
                      >
                          <ListItemIcon>
                              <EmojiEventsIcon />
                          </ListItemIcon>
                          <ListItemText primary={item.text} />
                      </ListItemButton>
                  ))}
              </List>
          </Collapse>

        </List>

        <Divider />
    
        <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
            <ListSubheader component="div" id="nested-list-subheader">
                Creación de Registros
            </ListSubheader>
        }
        >
          {/* NOT NEEDED RIGTH NWO */}
          {/*<ListItemButton 
            component={Link} 
            to="/register-participant-admin" 
            selected={currentPath === '/register-participant-admin'}>
              <ListItemIcon>
                  <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Registrar Participante" />
          </ListItemButton>*/}

          <ListItemButton 
            component={Link} 
            to="/register-route-admin" 
            selected={currentPath === '/register-route-admin'}
          >
              <ListItemIcon>
                  <TerrainIcon />
              </ListItemIcon>
              <ListItemText primary="Crear Ruta/Bloque" />
          </ListItemButton>
        </List>

        <Box sx={{ marginTop: 'auto' }}>

    <List>
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Cerrar Sesión" />
      </ListItemButton>
    </List>
  </Box>

    </Box>
    
  );
}

import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import TerrainIcon from '@mui/icons-material/Terrain';
import { Link, useLocation, useNavigate } from 'react-router';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuth from '../hooks/useAuth.jsx'; 
import { Box, Collapse } from '@mui/material';
import { useState } from 'react';

/*
  Side menu component for admin users.
  This contains navigation links to different admin sections in the 
  "short" form layout.
*/

export default function ShortMenu() {

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openLeaderboard, setOpenLeaderboard] = useState(true);

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
        >
        
            {menuItems.map((item) => (
                <ListItemButton 
                  component={Link} 
                  to={item.path} 
                  selected={currentPath === item.path} 
                  key={item.text} sx={{ justifyContent: 'center' }}>
                    <ListItemIcon sx={{ minWidth: 'auto', 
                                      justifyContent: 'center' }}>
                        {item.icon}
                    </ListItemIcon>
                </ListItemButton>
            ))}

            <ListItemButton 
              onClick={handleLeaderboardClick} 
              sx={{ justifyContent: 'center' }}
            >
                <ListItemIcon 
                  sx={{ minWidth: 'auto', justifyContent: 'center' }}
                >
                    <LeaderboardIcon />
                </ListItemIcon>
            </ListItemButton>
            <Collapse in={openLeaderboard} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {leaderboardItems.map((item) => (
                        <ListItemButton 
                            component={Link} 
                            to={item.path} 
                            selected={currentPath === item.path} 
                            key={item.text}
                            sx={{ justifyContent: 'center' }}
                        >
                            <ListItemIcon 
                              sx={{ minWidth: 'auto', 
                                    justifyContent: 'center' }}
                            >
                                <EmojiEventsIcon />
                            </ListItemIcon>
                        </ListItemButton>
                    ))}
                </List>
            </Collapse>

        </List>


    
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
            {/* Not needed right now */}
            {/*<ListItemButton 
              component={Link} 
              to="/register-participant-admin" 
              selected={currentPath === '/register-participant-admin'} 
              sx={{ justifyContent: 'center' }}
            >
                <ListItemIcon sx={{ minWidth: 'auto', 
                              justifyContent: 'center' }}
                >
                    <PersonAddIcon />
                </ListItemIcon>

            </ListItemButton>*/}

            <ListItemButton 
              component={Link} 
              to="/register-route-admin" 
              selected={currentPath === '/register-route-admin'} 
              sx={{ justifyContent: 'center' }}
            >
                <ListItemIcon sx={{ minWidth: 'auto', 
                              justifyContent: 'center' }}
                >
                    <TerrainIcon />
                </ListItemIcon>

            </ListItemButton>
        
        </List>

        <Box sx={{ marginTop: 'auto' }}>
    <List>
      <ListItemButton onClick={handleLogout} sx={{ justifyContent: 'center' }}>
        <ListItemIcon sx={{ minWidth: 'auto', justifyContent: 'center' }}>
          <LogoutIcon />
        </ListItemIcon>
      </ListItemButton>
    </List>
  </Box>

  </Box>
    
  );
}

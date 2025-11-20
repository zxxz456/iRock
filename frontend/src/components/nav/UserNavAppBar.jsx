import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import HomeIcon from '@mui/icons-material/Home';
import TerrainIcon from '@mui/icons-material/Terrain';
import LogoutIcon from '@mui/icons-material/Logout';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.jsx'; 
import Typography from '@mui/material/Typography';
import fusionLogo from '../../assets/fusion.png';

/*
  Bottom navigation bar component for regular users.
  This is intended to provide easy access to main sections of the app but
  aLSO to have a "mobile" alike gui.
*/

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: '0 auto',
});

export default function UserNavAppBar({ children }) {

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && 
      (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const handleAddClick = () => {
    navigate('/register-ascension');
  };

  const handleAbout = () => {
    navigate('/about');
  }

  // Rockodromo Fusion Instagram
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/rocodromofusion/?hl=es', '_blank', 
      'noopener,noreferrer');
  };

  // Rockodromo Fusion Facebook
  const handleFacebookClick = () => {
    window.open('https://www.facebook.com/rocodromo.fusion/?locale=es_LA', 
      '_blank', 'noopener,noreferrer');
  };

  // Dynamic menu lateral items
  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/participant' },
    { text: 'Mis Ascensiones', icon: <TerrainIcon />, path: '/my-ascensions' },
  ];
  
  return (
    <React.Fragment>
      <CssBaseline />
      
      {/* Drawer (lateral menu) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {/* Header of the menu with user info */}
          <Box sx={{ 
            p: 2,
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: '#73738d',
            gap: 2
          }}>
            <img 
              src={fusionLogo} 
              alt="iRock Logo" 
              style={{ display: 'block', maxWidth: '25%', height: 'auto' }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              iRock App
            </Typography>
          </Box>

          <Divider />

          {/* Dynamic menu items */}
          <List>
            {menuItems.map((item) => (
              <ListItemButton 
                key={item.text}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>

          <Divider />

          {/* Static menu items */}
          <List>
            <ListItemButton onClick={handleAbout}>
              <ListItemIcon>
                <InfoOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Acerca de" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItemButton>
          </List>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography 
              variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
              © 2025 iRock App beta | by zxxz6
            </Typography>
          </Box>
        </Box>
      </Drawer>
      
      {/* Main content area */}
      <Box sx={{ pb: 7, 
        minHeight: '100vh',
        background: 'linear-gradient(145deg,rgba(222, 222, 250, 1) 0%, \
        rgba(254, 255, 232, 1) 100%)' }}
      >
        {children}
      </Box>

      {/* Bottom Navigation Bar */}
      <AppBar 
        position="fixed" 
        color="primary" 
        sx={{ 
          top: 'auto', 
          bottom: 0,
          backgroundColor: '#73738d'
        }}
      >
        <Toolbar>
          <IconButton 
            color="inherit" 
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>

          <StyledFab 
            color="secondary" 
            aria-label="add" 
            onClick={handleAddClick}
            sx={{ 
            backgroundColor: '#8e3f65',
            '&:hover': {
              backgroundColor: '#7d3759',
            }
          }} 
          > 
            <AddIcon />
          </StyledFab>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton 
            color="inherit" 
            onClick={handleInstagramClick}
            aria-label="Instagram"
          >
            <InstagramIcon />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            onClick={handleFacebookClick}
            aria-label="Facebook"
          >
            <FacebookIcon />
          </IconButton>

        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
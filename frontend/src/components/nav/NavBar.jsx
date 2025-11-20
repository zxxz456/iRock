import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';
import Menu from './Menu';
import ShortMenu from './ShortMenu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';

/*
    NavBar component that provides a responsive navigation drawer 
    for admin interface. It toggles between a full and compact menu.
*/

const drawerWidth = 240;
const shortDrawerWidth = 60;

export default function NavBar(props) {
    const { content } = props;
    const [bigMenu, setBigMenu] = useState(true);

    // Toggle menu size when icon is clicked
    const changeMenu = () => {
        setBigMenu(!bigMenu);
    };

    return (
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar 
            position="fixed" 
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, 
                backgroundColor: '#73738d' } }>
            <Toolbar>
                
                <IconButton 
                    sx={{marginRight: 'auto', 
                            color: 'white', 
                            ml: -1.65}} 
                    onClick={changeMenu} >
                    {bigMenu ? <MenuOpenIcon/> : <MenuIcon/> }
                </IconButton>
            </Toolbar>
        </AppBar>

        <Drawer
            variant="permanent"
            sx={{
            width: bigMenu ? drawerWidth : shortDrawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: bigMenu ? drawerWidth : 
                shortDrawerWidth, boxSizing: 'border-box' },
            backgroundColor: '#cac5ed',}}
        >
            <Toolbar />
                {bigMenu ? <Menu /> : <ShortMenu />}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
                {content}
        </Box>
        </Box>
    );
}

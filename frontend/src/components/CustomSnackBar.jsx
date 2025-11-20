import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/*
* CustomSnackbar Component
* A reusable snackbar component using MUI's Snackbar and Alert.
* Props:
* - open: boolean - Whether the snackbar is open.
* - onClose: function - Handler for closing the snackbar.
* - message: string - The message to display in the snackbar.
* - severity: string - The severity level ('error', 'warning', 'info', 'success').
* - autoHideDuration: number - Duration in milliseconds before auto-hiding the snackbar.
* - anchorOrigin: object - The position of the snackbar on the screen.
*/

export default function CustomSnackbar(props){
    
    const { 
        open, 
        onClose, 
        message, 
        severity = 'info', 
        autoHideDuration = 6000, 
        anchorOrigin = { vertical: 'bottom', horizontal: 'center' } 
    } = props;

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
        return;
        }
        onClose();
    };

    return (
        <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        >
        <Alert 
            onClose={handleClose} 
            severity={severity}
            sx={{ width: '100%' }}
        >
            {message}
        </Alert>
        </Snackbar>
    );
};

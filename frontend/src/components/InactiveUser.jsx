import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';


/*
    Component to inform the user that their account is inactive.
*/

const InactiveUser = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="inactive-page-container">
            
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        maxWidth: 500,
                        textAlign: 'center',
                        borderRadius: 2,
                    }}
                >
                    <BlockIcon
                        sx={{
                            fontSize: 80,
                            color: '#f44336',
                            marginBottom: 2,
                        }}
                    />
                    
                    <Typography variant="h4" gutterBottom 
                        sx={{ fontWeight: 'bold', color: '#333' }}>
                        Cuenta Inactiva
                    </Typography>
                    
                    <Typography variant="body1" 
                        textAlign="justify" 
                        sx={{ marginBottom: 3, color: '#666' }}>
                        Tu cuenta está actualmente inactiva por alguna de las 
                        siguientes razones:
                    </Typography>
                    
                    <Box sx={{ marginBottom: 2 }}>

                        <Typography variant="body2" sx={{ color: '#888', 
                            marginTop: 1 }}>
                            • Registro pendiente de aprobación
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888' }}>
                            • Verificación de información de pago pendiente
                        </Typography>
                    </Box>

                    <Typography variant="body1" textAlign="justify" 
                        sx={{ marginBottom: 3, color: '#666' }}>
                        Si ya realizaste tu pago y sigues sin poder acceder,
                        por favor contacta al personal de recepción para 
                        resolver el inconveniente.
                    </Typography>

                    <Box sx={{ marginTop: 4, display: 'flex', 
                        gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleLogout}
                            sx={{ paddingX: 4 }}
                        >
                            Cerrar Sesión
                        </Button>
                    </Box>
                </Paper>
        </div>
    );
};

export default InactiveUser;

import { React, useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import AxiosObj from './Axios.jsx';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/*
    Component to inform the user that the competition has ended.
*/

const CompetitionEnded = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        console.log("User object:", user); // dbg
        
        // Verify that user exists and has an identifier
        if (user && (user.id || user.user_id || user.pk)) {
            const userId = user.id || user.user_id || user.pk;
            
            AxiosObj.get(`/participants/${userId}/`)
            .then(response => {
                setUserInfo(response.data);
                console.log("Fetched user info:", response.data);
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
        } 
        else {
            console.log("User ID not available yet");
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    };

    const getCategoryName = (category) => {
        const categoryNames = {
            'kids': 'Kids',
            'principiante': 'Principiante',
            'intermedio': 'Intermedio',
            'avanzado': 'Avanzado'
        };
        return categoryNames[category] || category;
    };

    return (
        <div className="inactive-page-container">
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    maxWidth: 600,
                    textAlign: 'center',
                    borderRadius: 2,
                }}
            >
                <EmojiEventsIcon
                    sx={{
                        fontSize: 100,
                        color: '#FFD700',
                        marginBottom: 2,
                    }}
                />
  
                <Typography variant="h4" gutterBottom 
                    sx={{ fontWeight: 'bold', color: '#333' }}>
                    La competencia ha finalizado :)
                </Typography>
                
                {userInfo ? (
                    <>
                        <Typography variant="body1" 
                            textAlign="justify" 
                            sx={{ marginBottom: 3, color: '#666' }}>
                            Hola <strong>{userInfo.first_name}</strong>, 
                            la competencia para la categoría <strong>{getCategoryName(userInfo.cup)}</strong> ya ha
                            terminado :c 
                        </Typography>

                        <Box 
                            sx={{ 
                                marginBottom: 3, 
                                padding: 2, 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: 2,
                                border: '2px solid #4caf50'
                            }}
                        >
                            <CheckCircleOutlineIcon 
                                sx={{ 
                                    fontSize: 60, 
                                    color: '#4caf50',
                                    marginBottom: 1
                                }} 
                            />
                            <Typography variant="h6" 
                                sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                Gracias por participar
                            </Typography>
                        </Box>

                        <Typography variant="body1" 
                            textAlign="center" 
                            sx={{ marginBottom: 2, color: '#666', 
                            fontSize: '1.1rem' }}>
                            Los resultados se darán a conocer en breve.
                        </Typography>

                        <Typography variant="body1" 
                            textAlign="center" 
                            sx={{ marginBottom: 3, color: '#666', 
                            fontStyle: 'italic' }}>
                            Mantente al pendiente de los anuncios por parte de
                            el staff.
                        </Typography>

                        <Typography variant="body1" 
                            textAlign="center" 
                            sx={{ marginBottom: 3, color: '#666', 
                            fontStyle: 'italic' }}>
                            Te esperamos el próximo año :P
                        </Typography>

                        <Box 
                            sx={{ 
                                marginTop: 4, 
                                display: 'flex', 
                                gap: 2, 
                                justifyContent: 'center' 
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleLogout}
                                sx={{ paddingX: 4 }}
                            >
                                Cerrar Sesión
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" 
                            sx={{ color: '#666' }}>
                            Cargando información...
                        </Typography>
                    </>
                )}
            </Paper>
        </div>
    );
};

export default CompetitionEnded;

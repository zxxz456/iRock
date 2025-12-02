import { React, useState, useEffect, use} from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';
import useAuth from './hooks/useAuth';
import AxiosObj from './Axios.jsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/*
    Component to inform the user that their account is inactive.
*/

const InactiveUserDate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const kidsBeginersStartDate = new Date('2025-12-06T09:00:00');
    const interAdvancedStartDate = new Date('2025-12-06T11:00:00');

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
                    <AccessTimeIcon
                        sx={{
                            fontSize: 80,
                            color: '#3652f4ff',
                            marginBottom: 2,
                        }}
                    />
      
                    <Typography variant="h4" gutterBottom 
                        sx={{ fontWeight: 'bold', color: '#333' }}>
                        Cuenta Temporalmente Inactiva
                    </Typography>
                    
                    {
                        userInfo ?

                        <>
                            <Typography variant="body1" 
                                textAlign="justify" 
                                sx={{ marginBottom: 3, color: '#666' }}>
                                Hola {userInfo ? 
                                      userInfo.first_name : 'Usuario'}, 
                                tu cuenta actualmente se encuentra inactiva 
                                hasta el inicio del torneo :P.
                                Como dijera el Jose Jose: 
                            </Typography>

                            <Typography variant="body1" 
                                textAlign="center" 
                                sx={{ marginBottom: 3, color: '#666' }}
                                fontStyle="italic">
                                "Espera un poco, UN POQUIIIIIIITO MÁAAAAAS..."
                            </Typography>

                            <Box sx={{ marginBottom: 2 }}>
                                <CountdownTimer targetDate={
                                    (userInfo && 
                                     (userInfo.cup === 'kids' || 
                                      userInfo.cup === 'principiante')) ?
                                    kidsBeginersStartDate :
                                    interAdvancedStartDate
                                } />
                            </Box>

                            <Typography variant="body1" textAlign="justify" 
                                sx={{ marginBottom: 3, color: '#666' }}>
                                Aun tienes tiempo, entrena duro n.n
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
                        </>

                        :

                        <>
                            <Typography variant="body1" 
                                sx={{ color: '#666' }}>
                                Cargando información...
                            </Typography>
                        </>
                    }

                </Paper>
        </div>
    );
};

export default InactiveUserDate;

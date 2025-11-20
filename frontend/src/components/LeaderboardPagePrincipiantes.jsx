import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Avatar,
    CircularProgress,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    Leaderboard Page for Principiante category
*/

const LeaderboardPagePrincipiantes = () => {
    const [leaderboards, setLeaderboards] = useState({
        kids: [],
        principiante: [],
        intermedio: [],
        avanzado: [],
    });
    const [loading, setLoading] = useState(true);
    const { showSnackbar, snackbarProps } = useSnackBar();

    const cupLabels = {
        kids: 'Kids',
        principiante: 'Principiante',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado',
    };

    const cupColors = {
        kids: '#FF6B6B',
        principiante: '#4ECDC4',
        intermedio: '#45B7D1',
        avanzado: '#FFA07A',
    };

    useEffect(() => {
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = () => {
        setLoading(true);
        AxiosObj.get('/participants/')
            .then(response => {
                const participants = response.data;
                const principiantesParticipants = participants.filter(p => 
                    p.cup === 'principiante' && 
                    !p.is_staff && 
                    !p.is_superuser && 
                    p.is_active
                );
                
                // Sort by points
                principiantesParticipants.sort((a, b) => b.points - a.points);

                setLeaderboards({
                    kids: [],
                    principiante: principiantesParticipants,
                    intermedio: [],
                    avanzado: [],
                });
                setLoading(false);
            })
            .catch(error => {
                showSnackbar('Error al cargar leaderboard', 'error');
                setLoading(false);
            });
    };    const getPositionColor = (position) => {
        switch (position) {
            case 0: // 1st place
                return '#FFD700'; // Gold
            case 1: // 2nd place
                return '#C0C0C0'; // Silver
            case 2: // 3rd place
                return '#CD7F32'; // Bronze
            default:
                return '#333333'; // Black
        }
    };

    const getPositionSize = (position) => {
        switch (position) {
            case 0: // 1st place
                return { fontSize: '1.5rem', avatarSize: 60 };
            case 1: // 2nd place
                return { fontSize: '1.3rem', avatarSize: 50 };
            case 2: // 3rd place
                return { fontSize: '1.1rem', avatarSize: 45 };
            default:
                return { fontSize: '1rem', avatarSize: 40 };
        }
    };

    const renderParticipant = (participant, position) => {
        const styles = getPositionSize(position);
        const color = getPositionColor(position);

        return (
            <Box
                key={participant.id}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: position < 3 ? `${color}15` :
                     'transparent',
                    border: position < 3 ? `2px solid ${color}` : 
                    '1px solid #e0e0e0',
                    transition: 'transform 0.2s',
                    '&:hover': {
                        transform: 'scale(1.02)',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: color,
                        color: position < 3 ? '#fff' : '#fff',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                    }}
                >
                    {position + 1}
                </Box>

                <Avatar
                    sx={{
                        width: styles.avatarSize,
                        height: styles.avatarSize,
                        backgroundColor: color,
                        fontSize: styles.fontSize,
                    }}
                >
                    {participant.first_name?.[0]}{participant.last_name?.[0]}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        sx={{
                            fontSize: styles.fontSize,
                            fontWeight: position < 3 ? 'bold' : 'normal',
                            color: color,
                        }}
                    >
                        {participant.first_name} {participant.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {participant.username}
                    </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        sx={{
                            fontSize: styles.fontSize,
                            fontWeight: 'bold',
                            color: color,
                        }}
                    >
                        {participant.score || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        puntos
                    </Typography>
                </Box>
            </Box>
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                p: 3,
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    mb: 3,
                    color: '#4ECDC4',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                }}
            >
                <EmojiEventsIcon sx={{ fontSize: '2.5rem' }} />
                Leaderboard Principiantes
            </Typography>

            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    backgroundColor: '#fafafa',
                    maxWidth: 900,
                    margin: '0 auto',
                    width: '100%',
                }}
            >
                <Box sx={{ mb: 3, width: '100%' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            borderTop: '4px solid #4ECDC4',
                            minHeight: 400,
                        }}
                    >
                        {leaderboards.principiante.length === 0 ? (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary',
                                }}
                            >
                                <Typography variant="body1">
                                    No hay participantes en esta categoría
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {leaderboards.principiante.map(
                                    (participant, index) =>
                                    renderParticipant(participant, index)
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>

            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default LeaderboardPagePrincipiantes;
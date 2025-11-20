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
    Leaderboard Page Component
    This component displays the leaderboard for different categories.
    This is the backbone for the Leaderboard feature.
*/

const LeaderboardPage = () => {
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
                const participants = response.data.filter(user => 
                    !user.is_staff && !user.is_superuser && user.is_active
                );

                // Organize participants by category and sort by points
                const grouped = {
                    kids: [],
                    principiante: [],
                    intermedio: [],
                    avanzado: [],
                };

                participants.forEach(participant => {
                    if (grouped[participant.cup]) {
                        grouped[participant.cup].push(participant);
                    }
                });

                // Sort each category by points (descending) and take top 5
                Object.keys(grouped).forEach(cup => {
                    grouped[cup] = grouped[cup]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);
                });

                setLeaderboards(grouped);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                showSnackbar('Error al cargar el leaderboard', 'error');
                setLoading(false);
            });
    };

    const getPositionColor = (position) => {
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
                    backgroundColor: position < 3 ? `${color}15` : 'transparent',
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
                p: 3,
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    mb: 4,
                    color: '#8e3f65',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                }}
            >
                <EmojiEventsIcon sx={{ fontSize: '2.5rem' }} />
                Tabla de Posiciones
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    textAlign: 'center',
                    mb: 4,
                    color: 'text.secondary',
                }}
            >
                Selecciona una categoría para ver la tabla de posiciones
            </Typography>

            <Grid container spacing={3} 
                sx={{ maxWidth: 800, margin: '0 auto' }}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} key={category.title}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                borderTop: `4px solid ${category.color}`,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <EmojiEventsIcon
                                    sx={{
                                        fontSize: '3rem',
                                        color: category.color,
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: category.color,
                                        textAlign: 'center',
                                    }}
                                >
                                    {category.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        textAlign: 'center',
                                        mb: 1,
                                    }}
                                >
                                    {category.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(category.path)}
                                    sx={{
                                        backgroundColor: category.color,
                                        '&:hover': {
                                            backgroundColor: category.color,
                                            opacity: 0.8,
                                        },
                                        width: '100%',
                                    }}
                                >
                                    Ver Tabla
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default LeaderboardPage;
import React, { useState, useEffect } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Paper,
    Pagination,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    Component to show detailed ascensions of a specific participant
    Props:
    - open: Boolean to control dialog visibility
    - onClose: Function to call when dialog is closed
    - participantId: ID of the participant to show ascensions
    - participantName: Name of the participant for display
*/

const ParticipantAscensionsDetail = (props) => {
    const { open, onClose, participantId, participantName } = props;
    const { showSnackbar, snackbarProps } = useSnackBar();
    const [ascensionsInfo, setAscensionsInfo] = useState([]);
    const [routesInfo, setRoutesInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (open && participantId) {
            setLoading(true);

            // Fetch routes info
            AxiosObj.get('/blocks/')
                .then(response => {
                    setRoutesInfo(response.data);
                })
                .catch(error => {
                    console.error('Error fetching routes info:', error);
                    showSnackbar('Error al cargar la información de rutas', 
                        'error');
                });

            // Fetch ascensions info for this participant
            AxiosObj.get('/blockscores/')
                .then(response => {
                    // Filter ascensions for this participant
                    const participantAscensions = response.data.filter(
                        ascension => ascension.participant === participantId
                    );
                    setAscensionsInfo(participantAscensions);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching ascensions info:', error);
                    showSnackbar('Error al cargar las ascensiones', 'error');
                    setLoading(false);
                });
        }
    }, [open, participantId]);

    // Get total distance 
    const getTotalDistance = () => {
        if (!ascensionsInfo || !routesInfo) return 0;
        
        return ascensionsInfo.reduce((total, ascension) => {
            const block = routesInfo.find(b => b.id === ascension.block);
            return total + (block?.distance || 0);
        }, 0);
    };

    // Get total points
    const getTotalPoints = () => {
        return ascensionsInfo.reduce((total, ascension) => 
            total + (ascension.earned_points || 0), 0
        );
    };

    // Sort ascensions by date (most recent first)
    const sortedAscensions = [...ascensionsInfo].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    // Pagination
    const totalPages = Math.ceil(sortedAscensions.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedAscensions = 
        sortedAscensions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBlockInfo = (blockId) => {
        return routesInfo.find(b => b.id === blockId);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    maxHeight: '90vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: '#8e3f65',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                Ascensiones de {participantName || 'Participante'}
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', 
                        justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        {/* Estadísticas */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            gap: 4, 
                            mb: 3, 
                            p: 2, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 2 
                        }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="#8e3f65" 
                                    sx={{ fontWeight: 'bold' }}>
                                    {ascensionsInfo.length}
                                </Typography>
                                <Typography variant="body2" 
                                    color="text.secondary">
                                    Total Ascensiones
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="#8e3f65" 
                                    sx={{ fontWeight: 'bold' }}>
                                    {getTotalPoints()}
                                </Typography>
                                <Typography variant="body2" 
                                    color="text.secondary">
                                    Puntos Totales
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="#8e3f65" 
                                    sx={{ fontWeight: 'bold' }}>
                                    {getTotalDistance()} m
                                </Typography>
                                <Typography variant="body2" 
                                    color="text.secondary">
                                    Distancia Recorrida
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tabla */}
                        <TableContainer component={Paper} variant="outlined">
                            <Table sx={{ minWidth: 650 }} size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell>
                                            <strong>Carril</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Tipo</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Grado</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Distancia</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Intento</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Puntos</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Fecha</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>Hora</strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedAscensions.length > 0 ? (
                                        paginatedAscensions.map((ascension) => {
                                            const block = 
                                                getBlockInfo(ascension.block);
                                            return (
                                                <TableRow 
                                                    key={ascension.id}
                                                    sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}
                                                >
                                                    <TableCell>{ascension.block_lane}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={block?.block_type === 'boulder' ? 
                                                                'Boulder' : 'Ruta'}
                                                            color={block?.block_type === 'boulder' ? 
                                                                'info' : 'success'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{block?.grade || '-'}</TableCell>
                                                    <TableCell>{block?.distance || 0} m</TableCell>
                                                    <TableCell>{ascension.score_option_label}</TableCell>
                                                    <TableCell>
                                                        <Typography color="#8e3f65" 
                                                            sx={{ fontWeight: 'bold' }}>
                                                            {ascension.earned_points} pts
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{formatDate(ascension.created_at)}</TableCell>
                                                    <TableCell>{formatTime(ascension.created_at)}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography variant="body2" 
                                                    color="text.secondary" sx={{ py: 2 }}>
                                                    No hay ascensiones registradas
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination 
                                    count={totalPages} 
                                    page={page} 
                                    onChange={handlePageChange}
                                    color="primary"
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <CustomSnackbar {...snackbarProps} />
        </Dialog>
    );
};

export default ParticipantAscensionsDetail;

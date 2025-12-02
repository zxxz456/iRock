import React, { useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CategoryStatsModal = ({ open, onClose, category, blocks, config }) => {
    const categoryColors = {
        kids: '#FF6B6B',
        principiante: '#4ECDC4',
        intermedio: '#45B7D1',
        avanzado: '#FFA07A',
        totals: '#8e3f65',
    };

    const categoryNames = {
        kids: 'Kids',
        principiante: 'Principiante',
        intermedio: 'Intermedio',
        avanzado: 'Avanzado',
        totals: 'Total General',
    };

    // Calculate detailed statistics by grade
    const detailedStats = useMemo(() => {
        if (!category || !blocks) return { rutas: {}, boulders: {} };

        const stats = {
            rutas: {},
            boulders: {},
        };

        // Get grades for this category from config
        const configRutaGrades = config?.rutas || [];
        const configBoulderGrades = config?.boulders || [];

        // Initialize counters for config grades
        configRutaGrades.forEach(grade => {
            stats.rutas[grade] = { active: 0, inactive: 0, total: 0 };
        });

        configBoulderGrades.forEach(grade => {
            stats.boulders[grade] = { active: 0, inactive: 0, total: 0 };
        });

        // Count blocks and add any missing grades
        blocks.forEach(block => {
            // For specific category, check if grade is in config
            const isRutaInCategory = block.block_type === 'ruta' && 
                configRutaGrades.includes(block.grade);
            const isBoulderInCategory = block.block_type === 'boulder' && 
                configBoulderGrades.includes(block.grade);

            if (isRutaInCategory) {
                // Initialize if not exists (shouldn't happen, but safe)
                if (!stats.rutas[block.grade]) {
                    stats.rutas[block.grade] = 
                                        { active: 0, inactive: 0, total: 0 };
                }
                if (block.active) stats.rutas[block.grade].active++;
                else stats.rutas[block.grade].inactive++;
                stats.rutas[block.grade].total++;
            } else if (isBoulderInCategory) {
                // Initialize if not exists (shouldn't happen, but safe)
                if (!stats.boulders[block.grade]) {
                    stats.boulders[block.grade] = 
                                        { active: 0, inactive: 0, total: 0 };
                }
                if (block.active) stats.boulders[block.grade].active++;
                else stats.boulders[block.grade].inactive++;
                stats.boulders[block.grade].total++;
            }
        });

        return stats;
    }, [category, blocks, config]);

    if (!category) return null;

    const color = categoryColors[category];
    const name = categoryNames[category];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle
                sx={{
                    backgroundColor: color,
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5" component="span">
                    Estadísticas Detalladas - {name}
                </Typography>
                <CloseIcon 
                    sx={{ cursor: 'pointer' }} 
                    onClick={onClose}
                />
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {/* Summary Section */}
                <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 2,
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" 
                        sx={{ fontWeight: 'bold', color: color }}>
                            {Object.values(detailedStats.rutas).reduce(
                                (sum, s) => sum + s.total, 0)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Total Rutas
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" 
                        sx={{ fontWeight: 'bold', color: color }}>
                            {Object.values(detailedStats.boulders).reduce(
                                (sum, s) => sum + s.total, 0)}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Total Boulders
                        </Typography>
                    </Box>
                </Box>

                {/* Rutas Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: color,
                        }}
                    >
                        Rutas
                    </Typography>
                    
                    {Object.keys(detailedStats.rutas).length > 0 ? (
                        <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: color }}>
                                        <TableCell sx={{ color: 'white', 
                                            fontWeight: 'bold' }}>
                                            Grado
                                        </TableCell>
                                        <TableCell align="center" 
                                        sx={{ color: 'white', 
                                        fontWeight: 'bold' }}>
                                            Activas
                                        </TableCell>
                                        <TableCell align="center" 
                                        sx={{ color: 'white', 
                                        fontWeight: 'bold' }}>
                                            Inactivas
                                        </TableCell>
                                        <TableCell align="center" 
                                        sx={{ color: 'white', 
                                        fontWeight: 'bold' }}>
                                            Total
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(detailedStats.rutas)
                                        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
                                        .map(([grade, stats]) => (
                                            <TableRow 
                                                key={grade}
                                                sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                                            >
                                                <TableCell>
                                                    <Chip 
                                                        label={grade} 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: color,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={stats.active} 
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={stats.inactive} 
                                                        size="small"
                                                        color="default"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography fontWeight="bold">
                                                        {stats.total}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No hay rutas en esta categoría
                        </Typography>
                    )}
                </Box>

                {/* Boulders Section */}
                <Box>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            mb: 2, 
                            fontWeight: 'bold',
                            color: color,
                        }}
                    >
                        Boulders
                    </Typography>
                    
                    {Object.keys(detailedStats.boulders).length > 0 ? (
                        <TableContainer component={Paper} elevation={2}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: color }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                            Grado
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            Activos
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            Inactivos
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                            Total
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(detailedStats.boulders)
                                        .sort(([a], [b]) => {
                                            // Sort V grades numerically
                                            const numA = parseInt(a.replace('V', ''));
                                            const numB = parseInt(b.replace('V', ''));
                                            return numA - numB;
                                        })
                                        .map(([grade, stats]) => (
                                            <TableRow 
                                                key={grade}
                                                sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                                            >
                                                <TableCell>
                                                    <Chip 
                                                        label={grade} 
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: color,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={stats.active} 
                                                        size="small"
                                                        color="success"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={stats.inactive} 
                                                        size="small"
                                                        color="default"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography fontWeight="bold">
                                                        {stats.total}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No hay boulders en esta categoría
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained"
                    sx={{
                        backgroundColor: color,
                        '&:hover': {
                            backgroundColor: color,
                            opacity: 0.9,
                        },
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryStatsModal;

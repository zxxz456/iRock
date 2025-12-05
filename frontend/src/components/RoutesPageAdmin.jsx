import React, { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip,
    Typography, Chip, Paper } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Terrain as TerrainIcon, 
    FilterHdr as FilterHdrIcon } from '@mui/icons-material';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import EditRouteAdmin from './EditRouteAdmin.jsx';
import CategoryStatsModal from './CategoryStatsModal.jsx';

/*
    Routes Management Page for Admins
    I this page, admins can view, edit, and delete climbing routes and boulders.
*/

const RoutesPageAdmin = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { showSnackbar, snackbarProps } = useSnackBar();

    // Fetch blocks
    const fetchBlocks = () => {
        setLoading(true);
        AxiosObj.get('/blocks/')
            .then(response => {
                setBlocks(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching blocks:', error);
                showSnackbar('Error al cargar bloques', 'error');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBlocks();
    }, []);

    // Categories configuration
    const categoriesConfig = {
        kids: {
            rutas: [
                '5.9', 
                '5.10a'
            ],
            boulders: [
                'V0', 
                'V1'
            ]
        },
        principiante: {
            rutas: [
                '5.9', 
                '5.10a', 
                '5.10b', 
                '5.10c'
            ],
            boulders: [
                'V0', 
                'V1', 
                'V2'
            ]
        },
        intermedio: {
            rutas: [
                '5.10b', 
                '5.10c', 
                '5.10d', 
                '5.11a', 
                '5.11b',
                '5.11c'
            ],
            boulders: [
                'V2',
                'V3', 
                'V4', 
                'V5'
            ]
        },
        avanzado: {
            rutas: [
                '5.10b', 
                '5.10c', 
                '5.10d', 
                '5.11a', 
                '5.11b',
                '5.11c', 
                '5.11d', 
                '5.12a', 
                '5.12b', 
                '5.12c', 
                '5.12d', 
                '5.13a', 
                '5.13b', 
                '5.13c', 
                '5.13d'
            ],
            boulders: [
                'V3',
                'V4', 
                'V5', 
                'V6', 
                'V7', 
                'V8', 
                'V9'
            ]
        }
    };

    // Calculate statistics
    const statistics = useMemo(() => {
        const stats = {
            kids: { rutas: 0, boulders: 0, total: 0 },
            principiante: { rutas: 0, boulders: 0, total: 0 },
            intermedio: { rutas: 0, boulders: 0, total: 0 },
            avanzado: { rutas: 0, boulders: 0, total: 0 },
            totals: { rutas: 0, boulders: 0, total: 0 }
        };

        // Count for each category independently (same logic as CategoryStatsModal)
        for (const [category, config] of Object.entries(categoriesConfig)) {
            blocks.forEach(block => {
                if (!block.active) return; // Only count active blocks

                if (block.block_type === 'ruta' && 
                    config.rutas.includes(block.grade)) {
                    stats[category].rutas++;
                    stats[category].total++;
                } else if (block.block_type === 'boulder' && 
                    config.boulders.includes(block.grade)) {
                    stats[category].boulders++;
                    stats[category].total++;
                }
            });
        }

        // Calculate totals (count each block only once)
        const countedBlocks = new Set();
        blocks.forEach(block => {
            if (!block.active) return;
            
            // Check if this block belongs to any category
            let belongsToCategory = false;
            for (const config of Object.values(categoriesConfig)) {
                if ((block.block_type === 'ruta' && 
                    config.rutas.includes(block.grade)) ||
                    (block.block_type === 'boulder' && 
                        config.boulders.includes(block.grade))) {
                    belongsToCategory = true;
                    break;
                }
            }
            
            if (belongsToCategory && !countedBlocks.has(block.id)) {
                countedBlocks.add(block.id);
                if (block.block_type === 'ruta') {
                    stats.totals.rutas++;
                } else if (block.block_type === 'boulder') {
                    stats.totals.boulders++;
                }
                stats.totals.total++;
            }
        });

        return stats;
    }, [blocks]);

    // Handle delete
    const handleDelete = (row) => {
        const blockType = row.original.block_type === 'boulder' ? 
            'boulder' : 'ruta';
        if (window.confirm(
            `¿Está seguro de eliminar el ${blockType} ${row.original.lane}?`)) {
            AxiosObj.delete(`/blocks/${row.original.id}/`)
                .then(response => {
                    showSnackbar('Bloque eliminado correctamente', 'success');
                    fetchBlocks(); // Recargar datos
                })
                .catch(error => {
                    console.error('Error deleting block:', error);
                    showSnackbar('Error al eliminar bloque', 'error');
                });
        }
    };

    // Handle edit
    const handleEdit = (row) => {
        console.log('Edit block:', row.original);
        setSelectedBlockId(row.original.id);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        fetchBlocks();
    };

    const handleOpenStats = (category) => {
        setSelectedCategory(category);
        setStatsModalOpen(true);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 50,
            },
            {
                accessorKey: 'block_type',
                header: 'Tipo',
                size: 100,
                Cell: ({ cell }) => {
                    const type = cell.getValue();
                    return (
                        <Chip 
                            label={type === 'boulder' ? 'Boulder' : 'Ruta'}
                            color={type === 'boulder' ? 'secondary' : 'primary'}
                            size="small"
                        />
                    );
                },
            },
            {
                accessorKey: 'lane',
                header: 'Vía',
                size: 120,
            },
            {
                accessorKey: 'grade',
                header: 'Grado',
                size: 100,
            },
            {
                accessorKey: 'color',
                header: 'Color',
                size: 100,
            },
            {
                accessorKey: 'wall',
                header: 'Pared',
                size: 120,
            },
            {
                accessorKey: 'distance',
                header: 'Distancia (m)',
                size: 100,
            },
            {
                accessorKey: 'active',
                header: 'Activo',
                size: 80,
                Cell: ({ cell }) => (
                    <Chip 
                        label={cell.getValue() ? 'Sí' : 'No'}
                        color={cell.getValue() ? 'success' : 'default'}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

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
                    color: '#8e3f65',
                    fontWeight: 'bold',
                    flexShrink: 0,
                }}
            >
                Gestión de Bloques
            </Typography>

            {/* Statistics Section */}
            <Box sx={{ 
                mb: 3, 
                flexShrink: 0, 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                flexWrap: 'wrap'
            }}>
                {/* Kids */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: '#FF6B6B',
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 180,
                        maxWidth: 180,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                    onClick={() => handleOpenStats('kids')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Kids
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <FilterHdrIcon />
                        <Typography variant="body1">
                            Total: {statistics.kids.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', 
                            alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TerrainIcon />
                        <Typography variant="body2">
                            Rutas: {statistics.kids.rutas}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TerrainIcon sx={{ transform: 'rotate(45deg)' }} />
                        <Typography variant="body2">
                            Boulders: {statistics.kids.boulders}
                        </Typography>
                    </Box>
                </Paper>

                {/* Beginner */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: '#4ECDC4',
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 180,
                        maxWidth: 180,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                    onClick={() => handleOpenStats('principiante')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Principiante
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <FilterHdrIcon />
                        <Typography variant="body1">Total: {statistics.principiante.total}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TerrainIcon />
                        <Typography variant="body2">Rutas: {statistics.principiante.rutas}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TerrainIcon sx={{ transform: 'rotate(45deg)' }} />
                        <Typography variant="body2">Boulders: {statistics.principiante.boulders}</Typography>
                    </Box>
                </Paper>

                {/* Intermediate */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: '#45B7D1',
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 180,
                        maxWidth: 180,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                    onClick={() => handleOpenStats('intermedio')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Intermedio
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <FilterHdrIcon />
                        <Typography variant="body1">
                            Total: {statistics.intermedio.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <TerrainIcon />
                        <Typography variant="body2">
                            Rutas: {statistics.intermedio.rutas}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TerrainIcon sx={{ transform: 'rotate(45deg)' }} />
                        <Typography variant="body2">
                            Boulders: {statistics.intermedio.boulders}
                        </Typography>
                    </Box>
                </Paper>

                {/* Advanced Paper */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: '#FFA07A',
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 180,
                        maxWidth: 180,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                    onClick={() => handleOpenStats('avanzado')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Avanzado
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <FilterHdrIcon />
                        <Typography variant="body1">
                            Total: {statistics.avanzado.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <TerrainIcon />
                        <Typography variant="body2">
                            Rutas: {statistics.avanzado.rutas}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TerrainIcon sx={{ transform: 'rotate(45deg)' }} />
                        <Typography variant="body2">
                            Boulders: {statistics.avanzado.boulders}
                        </Typography>
                    </Box>
                </Paper>

                {/* Total */}
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: '#8e3f65',
                        color: 'white',
                        borderRadius: 2,
                        minWidth: 180,
                        maxWidth: 180,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Total General
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <FilterHdrIcon />
                        <Typography variant="body1">
                            Total: {statistics.totals.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <TerrainIcon />
                        <Typography variant="body2">
                            Rutas: {statistics.totals.rutas}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TerrainIcon sx={{ transform: 'rotate(45deg)' }} />
                        <Typography variant="body2">
                            Boulders: {statistics.totals.boulders}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', maxWidth: '90%', 
                margin: '0 auto', width: '100%' }}>
                <MaterialReactTable
                    columns={columns}
                    data={blocks}
                    state={{ isLoading: loading }}
                    enableRowActions
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', gap: '8px' }}>
                            <Tooltip title="Editar">
                                <IconButton
                                    color="primary"
                                    onClick={() => handleEdit(row)}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                                <IconButton
                                    color="error"
                                    onClick={() => handleDelete(row)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    muiTablePaperProps={{
                        elevation: 3,
                        sx: {
                            borderRadius: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    }}
                    muiTableContainerProps={{
                        sx: { 
                            maxHeight: 'calc(100vh - 250px)',
                            overflow: 'auto'
                        }
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            backgroundColor: '#8e3f65',
                            color: 'white',
                            fontWeight: 'bold',
                        },
                    }}
                    initialState={{
                        pagination: { pageSize: 10, pageIndex: 0 },
                        sorting: [{ id: 'id', desc: false }],
                    }}
                />
            </Box>
            <EditRouteAdmin 
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                blockId={selectedBlockId}
                onSuccess={handleEditSuccess}
            />
            <CategoryStatsModal 
                open={statsModalOpen}
                onClose={() => setStatsModalOpen(false)}
                category={selectedCategory}
                blocks={blocks}
                config={selectedCategory && selectedCategory !== 'totals' 
                    ? categoriesConfig[selectedCategory] 
                    : null}
            />
            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default RoutesPageAdmin;
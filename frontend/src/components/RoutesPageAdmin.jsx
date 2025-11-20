import React, { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import EditRouteAdmin from './EditRouteAdmin.jsx';

/*
    Routes Management Page for Admins
    I this page, admins can view, edit, and delete climbing routes and boulders.
*/

const RoutesPageAdmin = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
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
            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default RoutesPageAdmin;
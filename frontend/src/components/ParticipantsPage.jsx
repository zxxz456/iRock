import React, { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip, Switch, Typography } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import EditParticipantAdmin from './EditParticipantAdmin.jsx';
import ParticipantAscensionsDetail from './ParticipantAscensionsDetail.jsx';

/*
    Participants Page for Admins
    In here admin can CRUD on participants
*/

const ParticipantsPage = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [ascensionsModalOpen, setAscensionsModalOpen] = useState(false);
    const [selectedParticipantId, setSelectedParticipantId] = useState(null);
    const [selectedParticipantName, setSelectedParticipantName] = useState('');
    const { showSnackbar, snackbarProps } = useSnackBar();

    // Fetch participants
    const fetchParticipants = () => {
        setLoading(true);
        AxiosObj.get('/participants/')
            .then(response => {
                // Select non stadff
                const nonAdminUsers = response.data.filter(user => 
                    !user.is_staff && !user.is_superuser
                );
                setParticipants(nonAdminUsers);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching participants:', error);
                showSnackbar('Error al cargar participantes', 'error');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    // Handle toggle active status
    const handleToggleActive = (row) => {
        const participantId = row.original.id;
        const newActiveStatus = !row.original.is_active;

        AxiosObj.patch(`/participants/${participantId}/`, {
            is_active: newActiveStatus
        })
        .then(response => {
            showSnackbar(
                `Usuario ${newActiveStatus ? 'activado' : 
                        'desactivado'} correctamente`,
                'success'
            );
            fetchParticipants(); // Refresh
        })
        .catch(error => {
            console.error('Error updating active status:', error);
            showSnackbar('Error al actualizar estado del usuario', 'error');
        });
    };

    // Handle delete
    const handleDelete = (row) => {
        if (window.confirm(`¿Está seguro de eliminar a ${row.original.first_name} 
            ${row.original.last_name}?`)) {
            AxiosObj.delete(`/participants/${row.original.id}/`)
                .then(response => {
                    showSnackbar('Usuario eliminado correctamente', 'success');
                    fetchParticipants(); // Refresh
                })
                .catch(error => {
                    console.error('Error deleting participant:', error);
                    showSnackbar('Error al eliminar usuario', 'error');
                });
        }
    };

    // Handle edit
    const handleEdit = (row) => {
        console.log('Edit participant:', row.original);
        setSelectedParticipantId(row.original.id);
        setEditModalOpen(true);
    };

    // Handle view ascensions
    const handleViewAscensions = (row) => {
        console.log('View ascensions for:', row.original);
        setSelectedParticipantId(row.original.id);
        setSelectedParticipantName(`${row.original.first_name} 
            ${row.original.last_name}`);
        setAscensionsModalOpen(true);
    };

    const handleEditSuccess = () => {
        fetchParticipants();
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 50,
            },
            {
                accessorKey: 'is_active',
                header: 'Activo',
                size: 50,
                Cell: ({ row }) => (
                    <Switch
                        checked={row.original.is_active}
                        onChange={() => handleToggleActive(row)}
                        color="primary"
                    />
                ),
            },
            {
                accessorKey: 'first_name',
                header: 'Nombre',
                size: 120,
            },
            {
                accessorKey: 'last_name',
                header: 'Apellido',
                size: 120,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 180,
            },
            {
                accessorKey: 'username',
                header: 'Usuario',
                size: 120,
            },
            {
                accessorKey: 'cup',
                header: 'Categoría',
                size: 100,
                Cell: ({ cell }) => {
                    const cupValue = cell.getValue();
                    const cupLabels = {
                        kids: 'Kids',
                        principiante: 'Principiante',
                        intermedio: 'Intermedio',
                        avanzado: 'Avanzado'
                    };
                    return cupLabels[cupValue] || cupValue;
                },
            },
            {
                accessorKey: 'score',
                header: 'Puntos',
                size: 80,
            },
            {
                accessorKey: 'distance_climbed',
                header: 'Distancia (m)',
                size: 100,
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
                Gestión de Participantes
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'hidden', 
                    maxWidth: '90%', margin: '0 auto', width: '100%' }}>
                <MaterialReactTable
                    columns={columns}
                    data={participants}
                    state={{ isLoading: loading }}
                    enableRowActions
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', gap: '8px' }}>
                            <Tooltip title="Ver Ascensiones">
                                <IconButton
                                    color="info"
                                    onClick={() => handleViewAscensions(row)}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Tooltip>
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
            <EditParticipantAdmin
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                participantId={selectedParticipantId}
                onSuccess={handleEditSuccess}
            />
            <ParticipantAscensionsDetail
                open={ascensionsModalOpen}
                onClose={() => setAscensionsModalOpen(false)}
                participantId={selectedParticipantId}
                participantName={selectedParticipantName}
            />
            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default ParticipantsPage;
import React, { useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, Tooltip, Switch, 
    Typography, Paper } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, 
    Search as SearchIcon } from '@mui/icons-material';
import { People as PeopleIcon, Boy as BoyIcon, 
    Girl as GirlIcon } from '@mui/icons-material';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import EditParticipantAdmin from './EditParticipantAdmin.jsx';
import ParticipantAscensionsDetail from './ParticipantAscensionsDetail.jsx';
import ParticipantsByCategoryModal from './ParticipantsByCategoryModal.jsx';

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
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
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

    // Calculate statistics
    const statistics = useMemo(() => {
        const stats = {
            kids: { total: 0, male: 0, female: 0 },
            principiante: { total: 0, male: 0, female: 0 },
            intermedio: { total: 0, male: 0, female: 0 },
            avanzado: { total: 0, male: 0, female: 0 },
            totals: { total: 0, male: 0, female: 0 }
        };

        participants.forEach(participant => {
            if (participant.cup && stats[participant.cup]) {
                stats[participant.cup].total++;
                stats.totals.total++;
                
                if (participant.gender === 'M') {
                    stats[participant.cup].male++;
                    stats.totals.male++;
                } else if (participant.gender === 'F') {
                    stats[participant.cup].female++;
                    stats.totals.female++;
                }
            }
        });

        return stats;
    }, [participants]);

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
        if (window.confirm(`¿Está seguro de eliminar a 
            ${row.original.first_name} ${row.original.last_name}?`)) {
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

    const handleOpenCategory = (category) => {
        setSelectedCategory(category);
        setCategoryModalOpen(true);
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
                    onClick={() => handleOpenCategory('kids')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Kids
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <PeopleIcon />
                        <Typography variant="body1">
                            Total: {statistics.kids.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <BoyIcon />
                        <Typography variant="body2">
                            Varonil: {statistics.kids.male
                        }</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GirlIcon />
                        <Typography variant="body2">
                            Femenil: {statistics.kids.female}
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
                    onClick={() => handleOpenCategory('principiante')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Principiante
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <PeopleIcon />
                        <Typography variant="body1">
                            Total: {statistics.principiante.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                            gap: 1, mb: 0.5 }}>
                        <BoyIcon />
                        <Typography variant="body2">
                            Varonil: {statistics.principiante.male}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GirlIcon />
                        <Typography variant="body2">
                            Femenil: {statistics.principiante.female}
                        </Typography>
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
                    onClick={() => handleOpenCategory('intermedio')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Intermedio
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <PeopleIcon />
                        <Typography variant="body1">
                            Total: {statistics.intermedio.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <BoyIcon />
                        <Typography variant="body2">
                            Varonil: {statistics.intermedio.male}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GirlIcon />
                        <Typography variant="body2">
                            Femenil: {statistics.intermedio.female}
                        </Typography>
                    </Box>
                </Paper>

                {/* Advanced */}
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
                    onClick={() => handleOpenCategory('avanzado')}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Avanzado
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <PeopleIcon />
                        <Typography variant="body1">
                            Total: {statistics.avanzado.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                        gap: 1, mb: 0.5 }}>
                        <BoyIcon />
                        <Typography variant="body2">
                            Varonil: {statistics.avanzado.male}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GirlIcon />
                        <Typography variant="body2">
                            Femenil: {statistics.avanzado.female}
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
                        <PeopleIcon />
                        <Typography variant="body1">
                            Total: {statistics.totals.total}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', 
                         gap: 1, mb: 0.5 }}>
                        <BoyIcon />
                        <Typography variant="body2">
                            Varonil: {statistics.totals.male}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GirlIcon />
                        <Typography variant="body2">
                            Femenil: {statistics.totals.female}
                        </Typography>
                    </Box>
                </Paper>
            </Box>

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
            <ParticipantsByCategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                category={selectedCategory}
                participants={participants}
            />
            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default ParticipantsPage;
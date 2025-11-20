import { React, useState, useEffect } from 'react';
import { Box, Typography, Paper, Pagination, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import useAuth from './hooks/useAuth.jsx';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
  User Ascensions Component
  Here users can view their ascensions with pagination and statistics
  */

const UserAscensions = () => {
  const { user } = useAuth();
  const { showSnackbar, snackbarProps } = useSnackBar();
  const [ascensionsInfo, setAscensionsInfo] = useState([]);
  const [routesInfo, setRoutesInfo] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch routes info
    AxiosObj.get('/blocks/')
      .then(response => {
        setRoutesInfo(response.data);
        console.log("Fetched routes info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching routes info:', error);
        showSnackbar('Error al cargar la información de rutas', 'error');
      });

    // Fetch ascensions info
    AxiosObj.get('/blockscores/')
      .then(response => {
        setAscensionsInfo(response.data);
        console.log("Fetched ascensions info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching ascensions info:', error);
        showSnackbar('Error al cargar la información de ascensiones', 'error');
      });
  }, [user]);

  // Get total distance 
  const getTotalDistance = () => {
    if (!ascensionsInfo || !routesInfo) return 0;
    
    return ascensionsInfo.reduce((total, ascension) => {
      const block = routesInfo.find(b => b.id === ascension.block);
      return total + (block?.distance || 0);
    }, 0);
  };

  // Sort ascensions by date (most recent first)
  const sortedAscensions = [...ascensionsInfo].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  // Pagination
  const totalPages = Math.ceil(sortedAscensions.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedAscensions = sortedAscensions.slice(startIndex, startIndex + itemsPerPage);

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

  const getBlockInfo = (blockId) => {
    return routesInfo.find(b => b.id === blockId);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom 
        sx={{ textAlign: 'center', mb: 2, color: '#73738d' }}>
          Mis Ascensiones
        </Typography>
        
        {/* Estadísticas */}
        <Box sx={{ display: 'flex', justifyContent: 'center',
           gap: 4, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="#8e3f65" 
            sx={{ fontWeight: 'bold' }}>
              {ascensionsInfo.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Ascensiones
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="#8e3f65" 
            sx={{ fontWeight: 'bold' }}>
              {getTotalDistance()} m
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distancia Recorrida
            </Typography>
          </Box>
        </Box>

        {/* Tabla */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Carril</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Grado</strong></TableCell>
                <TableCell><strong>Distancia</strong></TableCell>
                <TableCell><strong>Intento</strong></TableCell>
                <TableCell><strong>Puntos</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAscensions.length > 0 ? (
                paginatedAscensions.map((ascension) => {
                  const block = getBlockInfo(ascension.block);
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
                            "#72a5ae" : '#98e9d0'}
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
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
      </Paper>
      
      <CustomSnackbar {...snackbarProps} />
    </Box>
  );
}

export default UserAscensions;
import { React, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import useAuth from './hooks/useAuth.jsx';
import AxiosObj from './Axios.jsx';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

/*
  Component to display available routes for the user based on their category
  and excluding already completed routes.

  DPERECATED: For this beta version, this component is not in use. Available 
  routes are shown in the select field of RegisasterAscension component.
*/

const UserAvailableRoutes = () => {
  const { user } = useAuth();
  const [routesInfo, setRoutesInfo] = useState([]);
  const [ascensionsInfo, setAscensionsInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    

    AxiosObj.get('/blocks/')
      .then(response => {
        setRoutesInfo(response.data);
        console.log("Fetched routes info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching routes info:', error);
      });


    AxiosObj.get('/blockscores/')
      .then(response => {
        setAscensionsInfo(response.data);
        console.log("Fetched ascensions info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching ascensions info:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);


  const columns = useMemo(
    () => [
      {
        accessorKey: 'lane',
        header: 'Carril',
        size: 70,
      },
      {
        accessorKey: 'block_type',
        header: 'Tipo',
        size: 70,
        Cell: ({ cell }) => (
          cell.getValue() === 'boulder' ? 'Boulder' : 'Ruta'
        ),
      },
      {
        accessorKey: 'grade',
        header: 'Grado',
        size: 80,
      },
      {
        accessorKey: 'color',
        header: 'Color',
        size: 80,
      },
      {
        accessorKey: 'wall',
        header: 'Muro',
        size: 80,
      },
      {
        accessorKey: 'distance',
        header: 'Distancia (m)',
        size: 80,
      },
    ],
    [ascensionsInfo]
  );


  const isRouteValidForCup = (route, userCup) => {
    const gradesByCategory = {
      'kids': {
        rutas: ['5.8', '5.9'],
        boulders: ['V0', 'V1']
      },
      'principiante': {
        rutas: ['5.9', '5.10a', '5.10b'],
        boulders: ['V1', 'V2', 'V3']
      },
      'intermedio': {
        rutas: ['5.10b', '5.10c', '5.10d', '5.11a', '5.11b'],
        boulders: ['V3', 'V4', 'V5', 'V6']
      },
      'avanzado': {
        rutas: ['5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d'],
        boulders: ['V7', 'V8', 'V9', 'V10']
      }
    };

    const allowedGrades = gradesByCategory[userCup];
    if (!allowedGrades) return true; 

    if (route.block_type === 'ruta') {
      return allowedGrades.rutas.includes(route.grade);
    } else if (route.block_type === 'boulder') {
      return allowedGrades.boulders.includes(route.grade);
    }
    
    return false;
  };

  // Filter active routes that are NOT completed
  const availableRoutes = useMemo(
    () => {
      // First filter only active routes
      const active = routesInfo.filter(route => route.active);
      
      // Get IDs of blocks completed by the user
      const completedBlockIds = ascensionsInfo.map(ascension => ascension.block);
      
      // Filter only routes that are NOT completed
      const notCompleted = active.filter(route => !completedBlockIds.includes(route.id));
      
      // Filter by user's category
      return notCompleted.filter(route => isRouteValidForCup(route, user?.cup));
    },
    [routesInfo, ascensionsInfo, user]
  );

  const table = useMaterialReactTable({
    columns,
    data: availableRoutes,
    getRowId: (row) => row.id, // Use block ID as unique key
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: false,
    enableSorting: false,
    enableFilters: false,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      showGlobalFilter: true,
      density: 'compact',
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '8px',
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: 'fixed',
      },
    },
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 15, 20],
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
          Rutas Disponibles
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <MaterialReactTable table={table} />
        </Box>
      </Paper>
    </Box>
  );
}

export default UserAvailableRoutes;
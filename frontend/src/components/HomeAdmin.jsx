
import { React, useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/material/styles';
import useAuth from './hooks/useAuth.jsx';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/* 
  Admin HOme Dashboard
*/

const StyledAvatar = styled(Avatar)({
  width: 140,
  height: 140,
  border: '4px solid',
  borderColor: 'primary.main',
  margin: '0 auto',
  fontSize: '2.5rem'
});

const StatBox = styled(Box)({
  textAlign: 'center',
  flex: 1,
  padding: '16px'
});

const HomeAdmin = () => {
  const { user } = useAuth();
  const { showSnackbar, snackbarProps } = useSnackBar();
  const [userInfo, setUserInfo] = useState(null);
  const [routesInfo, setRoutesInfo] = useState(null);
  const [participantsInfo, setParticipantsInfo] = useState(null);

  // Get system statistics
  const getStats = () => {
    if (!routesInfo || !participantsInfo) {
      return { 
        rutasCount: 0, 
        bouldersCount: 0,
        totalUsers: 0,
        activeUsers: 0
      };
    }

    // Count total routes and boulders in the system

    const activeRoutes = routesInfo.filter(block => block.is_active);

    const rutasCount = activeRoutes.filter(block => 
      block.block_type === 'ruta').length;
    
    const bouldersCount = activeRoutes.filter(block => 
      block.block_type === 'boulder'
    ).length;
    

    // console.log(participantsInfo)
    // Count total and active users
    // Dmins does not count towards total users nor active users
    const admins = participantsInfo.filter(participant => 
      participant.is_staff === true
    ).length;
    const totalUsers = participantsInfo.length - admins;
    const activeUsers = participantsInfo.filter(participant => 
      participant.is_active === true && participant.is_staff !== true
    ).length;
    
    // console.log("Admins count:", admins);
    // console.log("Total users (excluding admins):", totalUsers);
    // console.log("Active users (excluding admins):", activeUsers);

    return { rutasCount, bouldersCount, totalUsers, activeUsers };
  };

  // Calculate block statistics (grades)
  const getBlockStats = () => {
    if (!routesInfo || routesInfo.length === 0) {
      return {
        highestRuta: 'N/A',
        lowestRuta: 'N/A',
        highestBoulder: 'N/A',
        lowestBoulder: 'N/A'
      };
    }

    // Filter only valid routes and boulders (with valid grade format)
    const rutas = routesInfo.filter(block => 
      block.block_type === 'ruta' && 
      /^5\.\d+[a-d]?$/.test(block.grade)
    );
    
    const boulders = routesInfo.filter(block => 
      block.block_type === 'boulder' && 
      /^V\d+$/.test(block.grade)
    );

    // console.log('routes :', rutas.map(r => r.grade));
    // console.log('Boulders:', boulders.map(b => b.grade));

    // Sort routes by grade
    const rutasSorted = [...rutas].sort((a, b) => {
      const getParts = (gradeStr) => {
        const match = gradeStr.match(/^5\.(\d+)([a-d]?)$/);
        return match ? { num: parseInt(match[1]), sub: match[2] || '' } : 
                       { num: 0, sub: '' };
      };
      
      const partsA = getParts(a.grade);
      const partsB = getParts(b.grade);
      
      // Compare numbers first
      if (partsA.num !== partsB.num) {
        return partsA.num - partsB.num;
      }
      
      // Compare subgrades 
      const subOrder = { '': 0, 'a': 1, 'b': 2, 'c': 3, 'd': 4 };
      return subOrder[partsA.sub] - subOrder[partsB.sub];
    });

    // Sort boulders by grade (V0, V1, V2, etc.)
    const bouldersSorted = [...boulders].sort((a, b) => {
      const getVNumber = (gradeStr) => {
        const match = gradeStr.match(/^V(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      };
      
      return getVNumber(a.grade) - getVNumber(b.grade);
    });

    const result = {
      highestRuta: rutasSorted.length > 0 ? 
        rutasSorted[rutasSorted.length - 1].grade : 'N/A',
      lowestRuta: rutasSorted.length > 0 ? 
        rutasSorted[0].grade : 'N/A',
      highestBoulder: bouldersSorted.length > 0 ? 
        bouldersSorted[bouldersSorted.length - 1].grade : 'N/A',
      lowestBoulder: bouldersSorted.length > 0 ? bouldersSorted[0].grade : 'N/A'
    };

    console.log('Resultado:', result);
    return result;
  };

  // Calculate league statistics (users by category)
  const getLeagueStats = () => {
    if (!participantsInfo || participantsInfo.length === 0) {
      return {
        kids: 0,
        principiante: 0,
        intermedio: 0,
        avanzado: 0
      };
    }

    return {
      kids: participantsInfo.filter(
        p => p.cup === 'kids' && !p.is_staff).length,
      principiante: participantsInfo.filter(
        p => p.cup === 'principiante' && !p.is_staff).length,
      intermedio: participantsInfo.filter(
        p => p.cup === 'intermedio' && !p.is_staff).length,
      avanzado: participantsInfo.filter(
        p => p.cup === 'avanzado' && !p.is_staff).length
    };
  };

  const { rutasCount, bouldersCount, totalUsers, activeUsers } = getStats();
  const { highestRuta, lowestRuta, highestBoulder, lowestBoulder } = 
                                                                getBlockStats();
  const { kids, principiante, intermedio, avanzado } = getLeagueStats();

  useEffect(() => {
    console.log("User object:", user);
    
    // Verify that user exists and has an identifier
    if (user && (user.id || user.user_id || user.pk)) {
      const userId = user.id || user.user_id || user.pk;
      
      AxiosObj.get(`/participants/${userId}/`)
      .then(response => {
        setUserInfo(response.data);
        console.log("Fetched user info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
    } else {
      console.log("User ID not available yet");
    }

    // Fetch blocks info (routes and boulders)
    AxiosObj.get('/blocks/')
      .then(response => {
        setRoutesInfo(response.data);
        console.log("Fetched blocks info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching blocks info:', error);
      });

    // Fetch all participants info
    AxiosObj.get('/participants/')
      .then(response => {
        setParticipantsInfo(response.data);
        console.log("Fetched participants info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching participants info:', error);
      });

  }, [user]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto'}}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          mb: 4, 
          textAlign: 'center',
          background: '#8E3F65',
          background: 'linear-gradient(145deg, rgba(142, 63, 101, 1) 0%, rgba(115, 115, 141, 1) 100%)',
          color: 'white',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <StyledAvatar 
          src={user?.avatar || "/static/images/avatar/default.jpg"} 
          alt={`${user?.first_name} ${user?.last_name}`}
          sx={{
            boxShadow: user?.is_active 
              ? '0 0 0 4px rgba(76, 94, 175, 0.3), 0 0 20px 8px rgba(76, 152, 175, 0.2)' 
              : 'none',
            border: user?.is_active 
              ? '4px solid #544cafff' 
              : '4px solid',
            transition: 'all 0.3s ease'
          }}
        >
          {!user?.avatar && 
            `${user?.first_name?.[0] || 'A'}${user?.last_name?.[0] || ''}`}
        </StyledAvatar>
        
        <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
          {user?.first_name || 'Admin'} {user?.last_name || ''}
        </Typography>
        
        <Typography variant="subtitle" sx={{ mt: 1, opacity: 0.9 }}>
          Administrador de Sistema
        </Typography>
        
      </Paper>

      {/* System Statistics */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography 
          variant="h6" 
          gutterBottom sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
          Resumen de Estadísticas del Sistema
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', 
          alignItems: 'center', flexWrap: 'wrap' }}>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {rutasCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rutas Armadas
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {bouldersCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boulders Armados
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuarios Totales
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {activeUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Competidores Activos
            </Typography>
          </StatBox>
        </Box>
      </Paper>

      {/* Resumen de Bloques */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom 
          sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
          Resumen de Bloques
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', 
                alignItems: 'center', flexWrap: 'wrap' }}>
          <StatBox>
            <Typography variant="h5" 
                color="#8e3f65" sx={{ fontWeight: 'bold' }}>
              {highestRuta}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ruta Más Alta
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h5" color="#8e3f65" 
                sx={{ fontWeight: 'bold' }}>
              {lowestRuta}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ruta Más Baja
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h5" color="#73738d" 
              sx={{ fontWeight: 'bold' }}>
              {highestBoulder}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boulder Más Alto
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h5" color="#73738d" 
              sx={{ fontWeight: 'bold' }}>
              {lowestBoulder}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boulder Más Bajo
            </Typography>
          </StatBox>
        </Box>
      </Paper>

      {/* Resumen de Ligas */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom 
          sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
          Resumen de Ligas
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', 
            alignItems: 'center', flexWrap: 'wrap' }}>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {kids}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kids
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {principiante}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Principiante
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#73738d" 
              sx={{ fontWeight: 'bold' }}>
              {intermedio}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intermedio
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#73738d" 
              sx={{ fontWeight: 'bold' }}>
              {avanzado}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avanzado
            </Typography>
          </StatBox>
        </Box>
      </Paper>
   
      <CustomSnackbar {...snackbarProps} />
    </Box>
  );
}

export default HomeAdmin;
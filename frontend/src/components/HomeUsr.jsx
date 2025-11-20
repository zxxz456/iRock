import { React, useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/material/styles';
import useAuth from './hooks/useAuth.jsx';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
  User Home Dashboard
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

const HomeUsr = () => {
  const { user } = useAuth();
  const { showSnackbar, snackbarProps } = useSnackBar();
  const [userInfo, setUserInfo] = useState(null); 
  const [routesInfo, setRoutesInfo] = useState(null);
  const [ascensionsInfo, setAscensionsInfo] = useState(null);

  const handleInactiveInfo = () => {
    showSnackbar(
      'Tu cuenta está inactiva. Contacta con el administrador para más \
      información.',
      'warning'
    );
  };

  // Get user statistics based on ascensions
  const getStats = () => {
    if (!ascensionsInfo || !routesInfo) {
      return { rutasCount: 0, bouldersCount: 0 };
    }

    // Get the IDs of blocks the user has completed
    const completedBlockIds = ascensionsInfo.map(ascension => ascension.block);
    
    // Filter the completed blocks
    const completedBlocks = routesInfo.filter(block => 
      completedBlockIds.includes(block.id)
    );

    // Count routes and boulders
    const rutasCount = completedBlocks.filter(block => 
      block.block_type === 'ruta'
    ).length;
    
    const bouldersCount = completedBlocks.filter(block => 
      block.block_type === 'boulder'
    ).length;

    return { rutasCount, bouldersCount };
  };

  const { rutasCount, bouldersCount } = getStats();

  useEffect(() => {
    console.log("User object:", user); // dbg
    
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

    // Fetch routes info
    AxiosObj.get('/blocks/')
      .then(response => {
        setRoutesInfo(response.data);
        console.log("Fetched routes info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching routes info:', error);
      });

    // Fetch ascensions info
    AxiosObj.get('/blockscores/')
      .then(response => {
        setAscensionsInfo(response.data);
        console.log("Fetched ascensions info:", response.data);
      })
      .catch(error => {
        console.error('Error fetching ascensions info:', error);
      });

  }, [user]);

  // Get the last 5 ascensions with complete information
  const getRecentActivities = () => {
    if (!ascensionsInfo || !routesInfo) {
      return [];
    }

    // Sort ascensions by date (most recent first)
    const sortedAscensions = [...ascensionsInfo].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    // Take the first 5
    const recentAscensions = sortedAscensions.slice(0, 5);

    // Map with block information
    return recentAscensions.map(ascension => {
      const block = routesInfo.find(b => b.id === ascension.block);
      
      // Format date
      const date = new Date(ascension.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateStr;
      if (date.toDateString() === today.toDateString()) {
        dateStr = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateStr = 'Ayer';
      } else {
        dateStr = date.toLocaleDateString('es-ES', 
                  { day: 'numeric', month: 'short' });
      }

      return {
        activity: `${block?.block_type === 'boulder' ? 
                    'Boulder' : 'Ruta'} completada: ${ascension.block_lane} - 
                    ${ascension.score_option_label}`,
        date: dateStr,
        points: ascension.earned_points
      };
    });
  };

  const recentActivities = getRecentActivities();

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
              ? '0 0 0 4px rgba(76, 175, 80, 0.3), 0 0 20px 8px rgba(76, 175, 80, 0.2)' 
              : 'none',
            border: user?.is_active 
              ? '4px solid #4caf50' 
              : '4px solid',
            transition: 'all 0.3s ease'
          }}
        >
          {!user?.avatar && 
          `${user?.first_name?.[0] || 'U'}${user?.last_name?.[0] || ''}`}
        </StyledAvatar>
        
        <Typography variant="h4" sx={{ mt: 2, fontWeight: 'bold' }}>
          {user?.first_name || 'Usuario'} {user?.last_name || ''}
        </Typography>
        
        <Typography variant="subtitle" sx={{ mt: 1, opacity: 0.9 }}>
          Liga {user?.cup ? 
            user.cup.charAt(0).toUpperCase() + user.cup.slice(1) : 'N/A'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', 
            justifyContent: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}> 
            {user?.is_active ? 'Participante Activo' : 'Participante Inactivo'}
          </Typography>
          {!user?.is_active && (
            <IconButton 
              size="small" 
              onClick={handleInactiveInfo}
              sx={{ 
                ml: 0.5, 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom 
          sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}> 
          Resumen de Actividad
        </Typography>
        <Box sx={{ display: 'flex', 
            justifyContent: 'space-around', alignItems: 'center' }}>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {rutasCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rutas Encadenadas
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {bouldersCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Boulders Completados
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h4" color="#8e3f65" 
              sx={{ fontWeight: 'bold' }}>
              {userInfo ? userInfo.distance_climbed : 0} m
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Distancia Escalada
            </Typography>
          </StatBox>
        </Box>
        <StatBox>
            <Typography variant="h3" color="#73738d"
               sx={{ fontWeight: 'bold' }}>
                {userInfo ? userInfo.score : 0} pts 
            </Typography>
            <Typography variant="body2" color="text.secondary">
                iRock Score
            </Typography>
          </StatBox>
        </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom 
              sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
              Actividad Reciente
            </Typography>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <Box key={index} sx={{ py: 1, borderBottom: '1px solid', 
                  borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', 
                      alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2">
                        {activity.activity}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.date}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="#8e3f65" 
                      sx={{ fontWeight: 'bold' }}>
                      +{activity.points} pts
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" 
                sx={{ textAlign: 'center', py: 2 }}>
                No hay actividad reciente
              </Typography>
            )}
          </Paper>

      <CustomSnackbar {...snackbarProps} />
    </Box>
  );
}

export default HomeUsr;
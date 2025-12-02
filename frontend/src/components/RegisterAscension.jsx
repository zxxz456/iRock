import { React, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import useAuth from './hooks/useAuth.jsx';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import SelectForm from './forms/SelectForm.jsx';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import { useFormik } from 'formik';
import * as yup from 'yup';

/*
    Register Ascension Page
    In here users can register their ascensions on routes or boulders
*/

const RegisterAscension = () => {
  const spacer = <Box sx={{ height: 20 }} />; // Spacer component
  const { showSnackbar, snackbarProps } = useSnackBar();

  const { user } = useAuth();
  const [routesInfo, setRoutesInfo] = useState([]);
  const [ascensionsInfo, setAscensionsInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [scoreOptions, setScoreOptions] = useState([]);

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

    // Fetch ascensions info
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


  useEffect(() => {
    showSnackbar("Asegúrate de escalar las rutas disponibles para \
      tu categoría ya que solo estas sumarán puntos a tu score final.", "info");
  }, []);

  // Constraint function to check if a route is valid for the user's cup
  const isRouteValidForCup = (route, userCup) => {
    // Categories configuration
    const gradesByCategory = {
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

    const allowedGrades = gradesByCategory[userCup];
    if (!allowedGrades) return true; // show all if not in a cup (future imps)

    if (route.block_type === 'ruta') {
      return allowedGrades.rutas.includes(route.grade);
    } else if (route.block_type === 'boulder') {
      return allowedGrades.boulders.includes(route.grade);
    }
    
    return false;
  };

  // Calculate available blocks using useMemo for optimization
  const availableBlocks = useMemo(() => {
    const active = routesInfo.filter(route => route.active);
    const completedBlockIds = ascensionsInfo.map(ascension => ascension.block);
    const notCompleted = active.filter(route => !completedBlockIds.includes(route.id));
    return notCompleted.filter(route => isRouteValidForCup(route, user?.cup));
  }, [routesInfo, ascensionsInfo, user]);

  // Format blocks for the SelectForm
  const blockOptions = useMemo(() => {
    return availableBlocks.map(block => ({
      id: block.id,
      name: `${block.block_type === 'boulder' ? 
        'Boulder' : 'Ruta'} - Carril ${block.lane} - ${block.grade} -
         ${block.color}`
    }));
  }, [availableBlocks]);

  const validationSchema = yup.object({
    block: yup.string().required('Debes seleccionar un bloque, \
      si no hay bloques disponibles para tu categoría, significa \
      que ya has completado todos los bloques asignados.'),
    score_option: yup.string().required('Debes seleccionar el \
      número de intentos')
  });

  const formik = useFormik({
    initialValues: {
      block: '',
      score_option: ''
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      console.log('Submitting:', values);
      
      // Create the BlockScore using IDs directly
      const payload = {
        block: parseInt(values.block),
        score_option: parseInt(values.score_option)
      };
      
      console.log('Payload a enviar:', payload);
      
      AxiosObj.post('/blockscores/', payload)
      .then(response => {
        console.log('Ascension registered:', response.data);
        showSnackbar('¡Pegue registrado exitosamente!', 'success');
        
        // Reset the form
        formik.resetForm();
        setScoreOptions([]);
        setSelectedBlock(null);
        
        // Reload the information
        AxiosObj.get('/blocks/')
          .then(response => setRoutesInfo(response.data));
        AxiosObj.get('/blockscores/')
          .then(response => setAscensionsInfo(response.data));
      })
      .catch(error => {
        console.error('Error registering ascension:', error);
        console.error('Error response data:', error.response?.data);
        
        let errorMsg = 'Error al registrar el pegue. Intenta nuevamente.';
        if (error.response?.data) {
          // If it's an object with validation errors
          if (typeof error.response.data === 'object') {
            errorMsg = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? 
                value.join(', ') : value}`)
              .join(' | ');
          } else {
            errorMsg = error.response.data;
          }
        }
        showSnackbar(errorMsg, 'error');
      });
      
    }
  });

  // Update score options when a block is selected
  useEffect(() => {
    if (formik.values.block) {
      const blockId = parseInt(formik.values.block);
      
      // Get the score options for the block from the backend
      AxiosObj.get(`/scoreoptions/?block=${blockId}`)
        .then(response => {
          console.log('Score options from backend:', response.data);
          setScoreOptions(response.data);
          
          const block = availableBlocks.find(b => b.id === blockId);
          setSelectedBlock(block);
        })
        .catch(error => {
          console.error('Error fetching score options:', error);
          setScoreOptions([]);
          setSelectedBlock(null);
        });
    } else {
      setScoreOptions([]);
      setSelectedBlock(null);
    }
  }, [formik.values.block, availableBlocks]);

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{p: 3, maxWidth: 1200, margin: '0 auto', 
          display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', minHeight: '100vh' }}>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom 
            sx={{ textAlign: 'center', mb: 3, color: '#73738d' }}>
              Registrar Pegue
            </Typography>

            {spacer}
            
            <SelectForm 
              id="block"
              name="block"
              label="Selecciona la Ruta o Boulder"
              options={blockOptions}
              value={formik.values.block}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.block && Boolean(formik.errors.block)}
              helpTxt={formik.touched.block && formik.errors.block}
            />

            {spacer}

            <FormControl 
              component="fieldset" 
              sx={{ mt: 3, width: '100%' }}
              error={formik.touched.score_option && 
                Boolean(formik.errors.score_option)}
            >
              <FormLabel component="legend">Número de Intentos</FormLabel>
              {formik.values.block && scoreOptions.length === 0 && (
                <Typography color="warning.main" variant="body2" sx={{ my: 1 }}>
                  Este bloque no tiene opciones de 
                  puntaje configuradas. Por favor, contacta al administrador.
                </Typography>
              )}
              {!formik.values.block && (
                <Typography color="text.secondary" 
                  variant="body2" sx={{ my: 1 }}>
                  Primero selecciona un bloque
                </Typography>
              )}
              <RadioGroup
                row
                name="score_option"
                value={formik.values.score_option}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {scoreOptions.length > 0 ? (
                  scoreOptions.map((option) => (
                    <FormControlLabel 
                      key={option.id} 
                      value={option.id.toString()} 
                      control={<Radio />} 
                      label={`${option.label}`}
                    />
                  ))
                ) : (
                  <>
                    <FormControlLabel 
                      value="" 
                      control={<Radio />} 
                      label="A Flash" 
                      disabled 
                    />
                    <FormControlLabel 
                      value="" 
                      control={<Radio />} 
                      label="Dos intentos" 
                      disabled 
                    />
                    <FormControlLabel 
                      value="" 
                      control={<Radio />} 
                      label="Tres intentos" 
                      disabled 
                    />
                    <FormControlLabel 
                      value="" 
                      control={<Radio />} 
                      label="Más" 
                      disabled 
                    />
                  </>
                )}
              </RadioGroup>
              {formik.touched.score_option && formik.errors.score_option && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {formik.errors.score_option}
                </Typography>
              )}
            </FormControl>

            {spacer}

            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
                fullWidth
                disabled={isLoading}
            >
                Registrar
            </Button>
          
          
          </Paper>

        </Box>
      </form>
      <CustomSnackbar {...snackbarProps} />
    </>
  );
}

export default RegisterAscension;
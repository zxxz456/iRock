import React, { useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
    Box,
    Button,
    Typography,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormHelperText,
    Divider,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    Register New Climbing Route or Boulder (Admin)
    Route creation with the score options
*/

const RegisterRouteAdmin = () => {
    const { showSnackbar, snackbarProps } = useSnackBar();

    const validationSchema = useMemo(() => yup.object({
        lane: yup.string().required('El carril es obligatorio'),
        grade: yup.string().required('El grado es obligatorio'),
        color: yup.string(),
        wall: yup.string().required('El Muro es obligatorio'),
        distance: yup.number()
            .min(0, 'La distancia debe ser mayor o igual a 0')
            .required('La distancia es obligatoria'),
        block_type: yup.string()
            .oneOf(['boulder', 'ruta'], 'Seleccione un tipo válido')
            .required('El tipo de bloque es obligatorio'),
        active: yup.boolean(),
    }), []);

    const formik = useFormik({
        initialValues: {
            lane: '',
            grade: '',
            color: '',
            wall: '',
            distance: 0,
            block_type: 'ruta',
            active: true,
            score_options: [
                { key: 'flash', label: 'A Flash', points: 1000, order: 1 },
                { key: 'segundo', label: 'Segundo Intento', 
                    points: 500, order: 2 },
                { key: 'tercero', label: 'Tercer Intento', 
                    points: 250, order: 3 },
                { key: 'mas', label: 'Más Intentos', points: 100, order: 4 },
            ],
        },
        validationSchema: validationSchema,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values) => {
            console.log('Form data', values);

            // Validate score_options before sending
            if (!values.score_options || values.score_options.length === 0) {
                showSnackbar('Debe agregar al menos una opción de puntuación', 
                    'error');
                return;
            }

            // Validate that each score option has all required fields
            for (let i = 0; i < values.score_options.length; i++) {
                const option = values.score_options[i];
                if (!option.key || !option.label) {
                    showSnackbar(
                        `La opción ${i + 1} necesita clave y etiqueta`, 'error');
                    return;
                }
            }

            try {
                // Step 1: Create the block
                const blockData = {
                    lane: values.lane,
                    grade: values.grade,
                    color: values.color,
                    wall: values.wall,
                    distance: values.distance,
                    block_type: values.block_type,
                    active: values.active,
                };

                console.log('Creating block:', blockData);
                const blockResponse = await AxiosObj.post('/blocks/', 
                    blockData);
                console.log('Block created:', blockResponse.data);

                const blockId = blockResponse.data.id;

                // Step 2: Create the score options
                const scoreOptionsPromises = 
                    values.score_options.map((option) => {
                    const scoreOptionData = {
                        block: blockId,
                        key: option.key,
                        label: option.label,
                        points: option.points,
                        order: option.order,
                    };
                    console.log('Creating score option:', scoreOptionData);
                    return AxiosObj.post('/scoreoptions/', scoreOptionData);
                });

                await Promise.all(scoreOptionsPromises);
                console.log('All score options created successfully');

                showSnackbar(
                    'Bloque y opciones de puntuación creados exitosamente', 
                    'success');
                formik.resetForm();
            } catch (error) {
                console.error('Error creating block or score options:', error);
                console.error('Error response:', error.response?.data);

                let errorMsg = 'Error al crear el bloque.';
                if (error.response?.data) {
                    const errors = error.response.data;
                    const errorMessages = [];

                    Object.keys(errors).forEach((key) => {
                        if (Array.isArray(errors[key])) {
                            errorMessages.push(
                                `${key}: ${errors[key].join(', ')}`);
                        } else {
                            errorMessages.push(`${key}: ${errors[key]}`);
                        }
                    });

                    if (errorMessages.length > 0) {
                        errorMsg = errorMessages.join(' | ');
                    }
                }

                showSnackbar(errorMsg, 'error');
            }
        },
    });

    const addScoreOption = useCallback(() => {
        const newOrder = formik.values.score_options.length + 1;
        formik.setFieldValue('score_options', [
            ...formik.values.score_options,
            { key: '', label: '', points: 0, order: newOrder },
        ]);
    }, [formik.values.score_options]);

    const removeScoreOption = useCallback((index) => {
        const newOptions = 
            formik.values.score_options.filter((_, i) => i !== index);
        formik.setFieldValue('score_options', newOptions);
    }, [formik.values.score_options]);

    const handleScoreOptionChange = useCallback((index, field, value) => {
        const newOptions = [...formik.values.score_options];
        newOptions[index][field] = value;
        formik.setFieldValue('score_options', newOptions);
    }, [formik.values.score_options]);

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
                Registrar Nuevo Bloque
            </Typography>

            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    maxWidth: '90%',
                    margin: '0 auto',
                    width: '100%',
                    px: 2,
                }}
            >
                <form onSubmit={formik.handleSubmit}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: 3,
                            padding: 3,
                        }}
                    >
                        {/* Información del Bloque */}
                        <Typography variant="h6" 
                        sx={{ color: '#8e3f65', fontWeight: 'bold' }}>
                            Información del Bloque
                        </Typography>

                        <FormControl
                            component="fieldset"
                            error={formik.touched.block_type && 
                                Boolean(formik.errors.block_type)}
                            sx={{ width: '100%', alignItems: 'flex-start' }}
                        >
                            <FormLabel component="legend">
                                Tipo de Bloque *
                            </FormLabel>
                            <RadioGroup
                                aria-label="block_type"
                                name="block_type"
                                value={formik.values.block_type}
                                onChange={formik.handleChange}
                                row
                            >
                                <FormControlLabel value="ruta" 
                                control={<Radio />} label="Ruta" />
                                <FormControlLabel value="boulder" 
                                control={<Radio />} label="Boulder" />
                            </RadioGroup>
                            {formik.touched.block_type && 
                            formik.errors.block_type && (
                                <FormHelperText>
                                    {formik.errors.block_type}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            id="lane"
                            name="lane"
                            label="Vía *"
                            value={formik.values.lane}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lane && 
                                Boolean(formik.errors.lane)}
                            helperText={formik.touched.lane && 
                                formik.errors.lane}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                id="grade"
                                name="grade"
                                label="Grado *"
                                value={formik.values.grade}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.grade && 
                                    Boolean(formik.errors.grade)}
                                helperText={formik.touched.grade && 
                                    formik.errors.grade}
                            />

                            <TextField
                                fullWidth
                                id="color"
                                name="color"
                                label="Color"
                                value={formik.values.color}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.color && 
                                    Boolean(formik.errors.color)}
                                helperText={formik.touched.color && 
                                    formik.errors.color}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                id="wall"
                                name="wall"
                                label="Pared *"
                                value={formik.values.wall}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.wall && 
                                    Boolean(formik.errors.wall)}
                                helperText={formik.touched.wall && 
                                    formik.errors.wall}
                            />

                            <TextField
                                fullWidth
                                id="distance"
                                name="distance"
                                label="Distancia (metros) *"
                                type="number"
                                value={formik.values.distance}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.distance && 
                                    Boolean(formik.errors.distance)}
                                helperText={formik.touched.distance && 
                                    formik.errors.distance}
                            />
                        </Box>

                        <FormControl
                            component="fieldset"
                            sx={{ width: '100%', alignItems: 'flex-start' }}
                        >
                            <FormLabel component="legend">Estado</FormLabel>
                            <RadioGroup
                                aria-label="active"
                                name="active"
                                value={formik.values.active.toString()}
                                onChange={(e) => formik.setFieldValue('active', 
                                    e.target.value === 'true')}
                                row
                            >
                                <FormControlLabel value="true" 
                                control={<Radio />} label="Activo" />
                                <FormControlLabel value="false" 
                                control={<Radio />} label="Inactivo" />
                            </RadioGroup>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        {/* Opciones de Puntuación */}
                        <Box sx={{ display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center' }}>
                            <Typography variant="h6" 
                            sx={{ color: '#8e3f65', fontWeight: 'bold' }}>
                                Opciones de Puntuación
                            </Typography>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addScoreOption}
                                variant="outlined"
                                size="small"
                                sx={{
                                    color: '#8e3f65',
                                    borderColor: '#8e3f65',
                                    '&:hover': {
                                        borderColor: '#6d2f4d',
                                        backgroundColor: 'rgba(142, 63, 101, 0.04)',
                                    },
                                }}
                            >
                                Agregar Opción
                            </Button>
                        </Box>

                        {formik.values.score_options.map((option, index) => (
                            <Box
                                key={index}
                                sx={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    padding: 2,
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                <Box sx={{ display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" 
                                    sx={{ fontWeight: 'bold' }}>
                                        Opción {index + 1}
                                    </Typography>
                                    {formik.values.score_options.length > 1 && (
                                        <IconButton
                                            onClick={
                                                () => removeScoreOption(index)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', 
                                    flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Clave (slug) *"
                                            value={option.key}
                                            onChange={(e) => 
                                                handleScoreOptionChange(index, 
                                                    'key', e.target.value)}
                                            placeholder="Ej: flash, segundo, tercero"
                                        />

                                        <TextField
                                            fullWidth
                                            label="Etiqueta *"
                                            value={option.label}
                                            onChange={
                                                (e) => handleScoreOptionChange(
                                                    index, 'label', e.target.value)}
                                            placeholder="Ej: Flash, Segundo Intento"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Puntos *"
                                            type="number"
                                            value={option.points}
                                            onChange={
                                                (e) => handleScoreOptionChange(
                                                    index, 'points', 
                                                    parseInt(e.target.value) || 0)}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Orden *"
                                            type="number"
                                            value={option.order}
                                            onChange={
                                                (e) => handleScoreOptionChange(
                                                    index, 'order', 
                                                    parseInt(e.target.value) || 0)}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ))}

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                marginTop: 2,
                                backgroundColor: '#8e3f65',
                                '&:hover': {
                                    backgroundColor: '#6d2f4d',
                                },
                            }}
                            fullWidth
                        >
                            Crear Bloque
                        </Button>
                    </Box>
                </form>
            </Box>
            <CustomSnackbar {...snackbarProps} />
        </Box>
    );
};

export default RegisterRouteAdmin;
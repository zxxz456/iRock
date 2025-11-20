import React, { useCallback, useMemo, useEffect, useState } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    COmponent to edit an existing climbing block (route or boulder)
    Admin only.
*/

const EditRouteAdmin = ({ open, onClose, blockId, onSuccess }) => {
    const { showSnackbar, snackbarProps } = useSnackBar();
    const [loading, setLoading] = useState(true);
    const [existingScoreOptions, setExistingScoreOptions] = useState([]);

    const validationSchema = useMemo(() => yup.object({
        lane: yup.string()
            .required('El carril es obligatorio'),
        grade: yup.string()
            .required('El grado es obligatorio'),
        color: yup.string(),
        wall: yup.string()
            .required('El Muro es obligatorio'),
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
            score_options: [],
        },
        validationSchema: validationSchema,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values) => {
            console.log('Form data', values);

            // Validate that at least one score option exists
            if (!values.score_options || values.score_options.length === 0) {
                showSnackbar('Debe agregar al menos una opción de puntuación', 
                    'error');
                return;
            }

            // Validate that each score option has all required fields
            for (let i = 0; i < values.score_options.length; i++) {
                const option = values.score_options[i];
                if (!option.key || !option.label) {
                    showSnackbar(`La opción ${i + 1} necesita clave y etiqueta`, 
                        'error');
                    return;
                }
            }

            try {
                // Step 1: Update the block
                const blockData = {
                    lane: values.lane,
                    grade: values.grade,
                    color: values.color,
                    wall: values.wall,
                    distance: values.distance,
                    block_type: values.block_type,
                    active: values.active,
                };

                console.log('Updating block:', blockData);
                // await the block update, then proceed to score options
                await AxiosObj.patch(`/blocks/${blockId}/`, blockData);
                console.log('Block updated');

                // Step 2: Update or create score options
                const updatePromises = [];
                
                for (let i = 0; i < values.score_options.length; i++) {
                    const option = values.score_options[i];
                    const scoreOptionData = {
                        block: blockId,
                        key: option.key,
                        label: option.label,
                        points: option.points,
                        order: option.order,
                    };

                    // If the option has an ID, 
                    // it's an existing option that we need to update
                    if (option.id) {
                        console.log('Updating score option:', 
                            option.id, scoreOptionData);
                        updatePromises.push(
                            AxiosObj.patch(`/scoreoptions/${option.id}/`, 
                                scoreOptionData)
                        );
                    } else {
                        // If it doesn't have an ID, it's a new 
                        // option we need to create
                        console.log('Creating new score option:', 
                            scoreOptionData);
                        updatePromises.push(
                            AxiosObj.post('/scoreoptions/', scoreOptionData)
                        );
                    }
                }

                // Step 3: Delete score options that were removed from the form
                // (only those NOT being used in BlockScores)
                const currentOptionIds = values.score_options
                    .filter(opt => opt.id)
                    .map(opt => opt.id);
                
                const optionsToDelete = existingScoreOptions.filter(
                    opt => !currentOptionIds.includes(opt.id)
                );

                for (const option of optionsToDelete) {
                    try {
                        console.log(
                            'Attempting to delete unused score option:', 
                            option.id);
                        updatePromises.push(
                            AxiosObj.delete(`/scoreoptions/${option.id}/`)
                        );
                    } catch (deleteError) {
                        // If deletion fails (because it's in use), just log it
                        console.warn('Could not delete score option (in use):',
                             option.id);
                    }
                }

                await Promise.all(updatePromises);
                console.log('All score options updated successfully');

                showSnackbar('Bloque actualizado exitosamente', 'success');
                if (onSuccess) onSuccess();
                onClose();
            } catch (error) {
                console.error('Error updating block or score options:', error);
                console.error('Error response:', error.response?.data);

                let errorMsg = 'Error al actualizar el bloque.';
                if (error.response?.data) {
                    const errors = error.response.data;
                    const errorMessages = [];

                    Object.keys(errors).forEach((key) => {
                        if (Array.isArray(errors[key])) {
                            errorMessages.push(`${key}: ${errors[key].join(', ')}`);
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

    // Load block data when dialog opens
    useEffect(() => {
        if (open && blockId) {
            setLoading(true);
            
            // Load block
            AxiosObj.get(`/blocks/${blockId}/`)
                .then(blockResponse => {
                    const block = blockResponse.data;
                    formik.setValues({
                        lane: block.lane || '',
                        grade: block.grade || '',
                        color: block.color || '',
                        wall: block.wall || '',
                        distance: block.distance || 0,
                        block_type: block.block_type || 'ruta',
                        active: block.active !== undefined ? 
                                                 block.active : true,
                        score_options: [],
                    });

                    // Load score options for the block     
                    return AxiosObj.get(`/scoreoptions/?block=${blockId}`);
                })
                .then(scoreResponse => {
                    const options = scoreResponse.data.map(opt => ({
                        id: opt.id,
                        key: opt.key,
                        label: opt.label,
                        points: opt.points,
                        order: opt.order,
                    }));
                    setExistingScoreOptions(options);
                    formik.setFieldValue('score_options', options);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error loading block:', error);
                    showSnackbar('Error al cargar el bloque', 'error');
                    setLoading(false);
                });
        }
    }, [open, blockId]);

    const addScoreOption = useCallback(() => {
        const newOrder = formik.values.score_options.length + 1;
        formik.setFieldValue('score_options', [
            ...formik.values.score_options,
            { key: '', label: '', points: 0, order: newOrder },
        ]);
    }, [formik.values.score_options]);

    const removeScoreOption = useCallback((index) => {
        const newOptions = formik.values.score_options.filter(
            (_, i) => i !== index);
        formik.setFieldValue('score_options', newOptions);
    }, [formik.values.score_options]);

    const handleScoreOptionChange = useCallback((index, field, value) => {
        const newOptions = [...formik.values.score_options];
        newOptions[index][field] = value;
        formik.setFieldValue('score_options', newOptions);
    }, [formik.values.score_options]);

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: '#8e3f65', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    Editar Bloque
                    <IconButton
                        onClick={onClose}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex', 
                                justifyContent: 'center', p: 4 }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <form onSubmit={formik.handleSubmit}>
                            <Box sx={{ display: 'flex', 
                                       flexDirection: 'column', gap: 2, py: 2 }}
                            >
                                <Typography variant="h6" 
                                    sx={{ color: '#8e3f65', 
                                    fontWeight: 'bold' }}>
                                    Información del Bloque
                                </Typography>

                                <FormControl
                                    component="fieldset"
                                    error={formik.touched.block_type && 
                                        Boolean(formik.errors.block_type)}
                                    sx={{ width: '100%', 
                                        alignItems: 'flex-start' }}
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
                                        <FormControlLabel 
                                            value="ruta" 
                                            control={<Radio />} label="Ruta" 
                                        />
                                        <FormControlLabel 
                                            value="boulder" 
                                            control={<Radio />} 
                                            label="Boulder" 
                                        />
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
                                    sx={{ width: '100%', 
                                        alignItems: 'flex-start' }}
                                >
                                    <FormLabel component="legend">
                                        Estado
                                    </FormLabel>
                                    <RadioGroup
                                        aria-label="active"
                                        name="active"
                                        value={formik.values.active.toString()}
                                        onChange={(e) => formik.setFieldValue(
                                            'active', e.target.value === 'true'
                                        )}
                                        row
                                    >
                                        <FormControlLabel 
                                            value="true" 
                                            control={<Radio />} 
                                            label="Activo" />
                                        <FormControlLabel 
                                            value="false" 
                                            control={<Radio />} 
                                            label="Inactivo" />
                                    </RadioGroup>
                                </FormControl>

                                <Divider sx={{ my: 2 }} />

                                {/* Opciones de Puntuación */}
                                <Box sx={{ display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' }}
                                >
                                    <Typography 
                                        variant="h6" 
                                        sx={{ color: '#8e3f65', 
                                              fontWeight: 'bold' }}
                                    >
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

                                {formik.values.score_options.map(
                                    (option, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2,
                                            padding: 2,
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        <Box 
                                            sx={{ display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', mb: 2 }}
                                        >
                                            <Typography 
                                                variant="subtitle1" 
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                Opción {index + 1}
                                            </Typography>
                                            {formik.values.score_options.length 
                                                > 1 && (
                                                <IconButton
                                                    onClick={() => 
                                                        removeScoreOption(index)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>

                                        <Box 
                                            sx={{ display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: 2 }}>
                                            <Box sx={{ display: 'flex', 
                                                gap: 2 }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    label="Clave (slug) *"
                                                    value={option.key}
                                                    onChange={(e) => 
                                                        handleScoreOptionChange(
                                                            index, 'key', 
                                                            e.target.value)}
                                                    placeholder="Ej: flash, segundo, tercero"
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Etiqueta *"
                                                    value={option.label}
                                                    onChange={(e) =>   
                                                        handleScoreOptionChange(
                                                            index, 'label', 
                                                            e.target.value)}
                                                    placeholder="Ej: Flash, Segundo Intento"
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Puntos *"
                                                    type="number"
                                                    value={option.points}
                                                    onChange={(e) => 
                                                        handleScoreOptionChange(
                                                            index, 'points', 
                                                            parseInt(e.target.value) || 0)}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Orden *"
                                                    type="number"
                                                    value={option.order}
                                                    onChange={(e) => 
                                                        handleScoreOptionChange(
                                                            index, 'order', 
                                                            parseInt(e.target.value) || 0)}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </form>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={formik.handleSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            backgroundColor: '#8e3f65',
                            '&:hover': {
                                backgroundColor: '#6d2f4d',
                            },
                        }}
                    >
                        Actualizar Bloque
                    </Button>
                </DialogActions>
            </Dialog>
            <CustomSnackbar {...snackbarProps} />
        </>
    );
};

export default EditRouteAdmin;
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
    Box,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormHelperText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AxiosObj from './Axios.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    Component for editing a participant's details in an admin interface.
    Props:
    - open: Boolean to control dialog visibility
    - onClose: Function to call when dialog is closed
    - participantId: ID of the participant to edit
    - onSuccess: Function to call after successful update
*/

const EditParticipantAdmin = (props) => {

    const { showSnackbar, snackbarProps } = useSnackBar();
    const [loading, setLoading] = useState(true);
    const {open, onClose, participantId, onSuccess} = props;

    const validationSchema = yup.object({
        email: yup.string()
            .email('Introduzca un email válido')
            .required('El email es obligatorio'),
        date_of_birth: yup.date()
            .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro')
            .required('La fecha de nacimiento es obligatoria'),
        gender: yup.string()
            .oneOf(['M', 'F', 'O', 'N'], 'Seleccione un género válido')
            .required('El género es obligatorio'),
        categoria: yup.string()
            .oneOf(['kids', 'principiante', 'intermedio', 'avanzado'], 
                    'Seleccione una categoría válida')
            .required('La categoría es obligatoria'),
        name: yup.string()
            .required('El nombre es obligatorio'),
        last_name: yup.string()
            .required('El apellido es obligatorio'),
        username: yup.string()
            .required('El nombre de usuario es obligatorio'),
        phone: yup.string()
            .matches(/^\+?[0-9]{7,15}$/, 
                    'Introduzca un número de teléfono válido')
            .required('El número de teléfono es obligatorio'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            last_name: '',
            date_of_birth: null,
            gender: 'M',
            email: '',
            username: '',
            phone: '',
            categoria: 'principiante',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            console.log('Form data', values);

            // Get Age from date_of_birth
            const calculateAge = (birthDate) => {
                if (!birthDate) return 0;
                const today = new Date();
                const birth = new Date(birthDate);
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || 
                    (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };

            const age = calculateAge(values.date_of_birth);

            // Prepare data for update
            const submitData = {
                email: values.email,
                first_name: values.name,
                last_name: values.last_name,
                username: values.username,
                phone: values.phone,
                date_of_birth: values.date_of_birth ? 
                            values.date_of_birth.format('YYYY-MM-DD') : null,
                age: age,
                gender: values.gender,
                cup: values.categoria,
            };
            console.log('Data to submit:', submitData);

            try {
                await AxiosObj.patch(`/participants/${participantId}/`, 
                                     submitData);
                console.log('Update successful');
                showSnackbar('Participante actualizado exitosamente', 
                             'success');
                if (onSuccess) onSuccess();
                onClose();
            } catch (error) {
                console.error('Error updating participant:', error);
                console.error('Error response:', error.response?.data);

                let errorMsg = 'Error al actualizar el participante.';
                if (error.response?.data) {
                    const errors = error.response.data;
                    const errorMessages = [];

                    Object.keys(errors).forEach((key) => {
                        if (Array.isArray(errors[key])) {
                            errorMessages.push(`${key}: 
                                ${errors[key].join(', ')}`);
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

    // Load participant data when the modal opens
    useEffect(() => {
        if (open && participantId) {
            setLoading(true);

            AxiosObj.get(`/participants/${participantId}/`)
                .then((response) => {
                    const participant = response.data;
                    formik.setValues({
                        name: participant.first_name || '',
                        last_name: participant.last_name || '',
                        date_of_birth: participant.date_of_birth ? 
                                       dayjs(participant.date_of_birth) : null,
                        gender: participant.gender || 'M',
                        email: participant.email || '',
                        username: participant.username || '',
                        phone: participant.phone || '',
                        categoria: participant.cup || 'principiante',
                    });
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error loading participant:', error);
                    showSnackbar('Error al cargar el participante', 'error');
                    setLoading(false);
                });
        }
    }, [open, participantId]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: '#8e3f65',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    Editar Participante
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex', 
                                   justifyContent: 'center', 
                                   p: 4 }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : (
                        <form onSubmit={formik.handleSubmit}>
                            <Box sx={{ display: 'flex', 
                                 flexDirection: 'column', gap: 2, py: 2 }}
                            >
                                <TextField
                                    fullWidth
                                    id="name"
                                    name="name"
                                    label="Nombre *"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && 
                                        Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && 
                                        formik.errors.name}
                                />

                                <TextField
                                    fullWidth
                                    id="last_name"
                                    name="last_name"
                                    label="Apellido *"
                                    value={formik.values.last_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.last_name && 
                                        Boolean(formik.errors.last_name)}
                                    helperText={formik.touched.last_name && 
                                        formik.errors.last_name}
                                />

                                <DatePicker
                                    label="Fecha de Nacimiento *"
                                    value={formik.values.date_of_birth}
                                    onChange={(value) => formik.setFieldValue(
                                        'date_of_birth', value)}
                                    slotProps={{
                                        textField: {
                                            error: formik.touched.date_of_birth && 
                                            Boolean(formik.errors.date_of_birth),
                                            helperText: formik.touched.date_of_birth && 
                                            formik.errors.date_of_birth,
                                            fullWidth: true,
                                        },
                                    }}
                                />

                                <FormControl
                                    component="fieldset"
                                    error={formik.touched.gender && 
                                        Boolean(formik.errors.gender)}
                                    sx={{ width: '100%', alignItems: 'flex-start' }}
                                >
                                    <FormLabel component="legend">Género *</FormLabel>
                                    <RadioGroup
                                        aria-label="gender"
                                        name="gender"
                                        value={formik.values.gender}
                                        onChange={formik.handleChange}
                                        row
                                    >
                                        <FormControlLabel 
                                            value="M" 
                                            control={<Radio />} 
                                            label="Masculino" 
                                        />
                                        <FormControlLabel 
                                            value="F" 
                                            control={<Radio />} 
                                            label="Femenino" 
                                        />
                                        <FormControlLabel 
                                            value="O" 
                                            control={<Radio />} 
                                            label="Otro" 
                                        />
                                        <FormControlLabel 
                                            value="N" 
                                            control={<Radio />} 
                                            label="Prefiero no decirlo" 
                                        />
                                    </RadioGroup>
                                    {formik.touched.gender && 
                                        formik.errors.gender && (
                                        <FormHelperText>
                                            {formik.errors.gender}
                                        </FormHelperText>
                                    )}
                                </FormControl>

                                <TextField
                                    fullWidth
                                    id="categoria"
                                    name="categoria"
                                    select
                                    label="Categoría *"
                                    value={formik.values.categoria}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.categoria && 
                                        Boolean(formik.errors.categoria)}
                                    helperText={formik.touched.categoria && 
                                        formik.errors.categoria}
                                >
                                    <MenuItem value="kids">
                                        Kids
                                    </MenuItem>
                                    <MenuItem value="principiante">
                                        Principiante
                                    </MenuItem>
                                    <MenuItem value="intermedio">
                                        Intermedio
                                    </MenuItem>
                                    <MenuItem value="avanzado">
                                        Avanzado
                                    </MenuItem>
                                </TextField>

                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email *"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && 
                                        Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && 
                                        formik.errors.email}
                                />

                                <TextField
                                    fullWidth
                                    id="username"
                                    name="username"
                                    label="Nombre de Usuario *"
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.username && 
                                        Boolean(formik.errors.username)}
                                    helperText={formik.touched.username && 
                                        formik.errors.username}
                                />

                                <TextField
                                    fullWidth
                                    id="phone"
                                    name="phone"
                                    label="Teléfono *"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phone && 
                                        Boolean(formik.errors.phone)}
                                    helperText={formik.touched.phone && 
                                        formik.errors.phone}
                                />
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
                        Actualizar Participante
                    </Button>
                </DialogActions>
            </Dialog>
            <CustomSnackbar {...snackbarProps} />
        </LocalizationProvider>
    );
};

export default EditParticipantAdmin;
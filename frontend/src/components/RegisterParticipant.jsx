import { React } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import TextForm from './forms/TextForm.jsx';
import Button from '@mui/material/Button';
import SelectForm from './forms/SelectForm.jsx';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';
import AxiosObj from './Axios.jsx';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/*
    Register Participant Page
    In this page, users can register as participants in the system.
*/

const RegisterParticipant = () => {

    const {showSnackbar, snackbarProps} = useSnackBar();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        email: yup.string().email('Introduzca un email válido')
            .required('El email es obligatorio'),
        email2: yup.string()
           .oneOf([yup.ref('email'), null], 
            'Los correos electrónicos deben coincidir')
           .required('Confirme su email'),
        password: yup.string()
           .required('La contraseña es obligatoria')
           .min(8, 'La contraseña debe tener al menos 8 caracteres')
           .matches(/[a-zA-Z]/, 
            'La contraseña debe contener al menos una letra')
           .matches(/[0-9]/, 'La contraseña debe contener al menos un número')
           .test('not-all-numeric',
             'La contraseña no puede ser completamente numérica', value => {
               return value && /[a-zA-Z]/.test(value);
           })
           .test('not-common', 'La contraseña es muy común, elige otra', 
            value => {
               const commonPasswords = ['password', '12345678', 'qwerty', 
                'abc12345', 'password1', '123456789'];
               return !commonPasswords.includes(value?.toLowerCase());
           })
           .test('not-similar', 
            'La contraseña es muy similar a tu información personal', 
            function(value) {
               const { name, last_name, username, email } = this.parent;
               if (!value) return true;
               const lowerValue = value.toLowerCase();
               return !(
                   (name && lowerValue.includes(name.toLowerCase())) ||
                   (last_name && lowerValue.includes(
                    last_name.toLowerCase())) ||
                   (username && lowerValue.includes(
                    username.toLowerCase())) ||
                   (email && lowerValue.includes(
                    email.split('@')[0].toLowerCase()))
               );
           }),
        password2: yup.string()
           .oneOf([yup.ref('password'), null], 
           'Las contraseñas deben coincidir')
           .required('Confirme su contraseña'),
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
        name: yup.string().required('El nombre es obligatorio'),
        last_name: yup.string().required('El apellido es obligatorio'),
        username: yup.string().required('El nombre de usuario es obligatorio'),
        phone: yup.string()
           .matches(/^\+?[0-9]{7,15}$/, 
            'Introduzca un número de teléfono válido')
           .required('El número de teléfono es obligatorio'),
    });

    const formik = useFormik({
        initialValues: 
        {
            name: '',
            last_name: '',
            date_of_birth: null,
            gender: 'M',
            email: '',
            email2: '',
            password: '',
            password2: '',
            username: '',
            phone: '',
            categoria: 'principiante',
        },
        validationSchema: validationSchema,
        onSubmit: values => {
            console.log('Form data', values);
            
            // get age from date_of_birth
            const calculateAge = (birthDate) => {
                if (!birthDate) return 0;
                const today = new Date();
                const birth = new Date(birthDate);
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                    age--;
                }
                return age;
            };
            
            const age = calculateAge(values.date_of_birth);
            
            // Convert the Dayjs date to string to send to the backend
            const submitData = {
                email: values.email,
                password: values.password,
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
            
            AxiosObj.post('/participants/', submitData)
            .then(response => {
                console.log('Registration successful:', response.data);
                showSnackbar('Registro exitoso. Tu cuenta será activada por \
                    un administrador. Recibirás un correo cuando esté lista.', 
                    'success');
                formik.resetForm();
            })
            .catch(error => {
                console.error('There was an error registering!', error);
                console.error('Error response:', error.response?.data);
                
                // Show all backend errors
                let errorMsg = 'Error al registrar el participante.';
                if (error.response?.data) {
                    const errors = error.response.data;
                    const errorMessages = [];
                    
                    Object.keys(errors).forEach(key => {
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
            });
        }
    });

    // Function to go back to login
    const handleBackToLogin = () => {
        navigate('/');
    };

    return(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <form className="register-form" onSubmit={formik.handleSubmit}>
                <div className="register-page-container">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 4,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: 3,
                            minWidth: 300,
                            position: 'relative'
                        }}
                    >

                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBackToLogin}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: 16,
                                color: '#5f5f5fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            Login
                        </Button>
                        
                        <h2>Registro de Participante</h2>
                        
                        <TextForm
                            id="name"
                            label="Ingrese Nombre de Participante"
                            name="name"
                            variant="outlined"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && 
                                Boolean(formik.errors.name)}
                            helpTxt={formik.touched.name && formik.errors.name}
                        />
                        
                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="last_name"
                            label="Ingrese Apellido de Participante"
                            name="last_name"
                            variant="outlined"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.last_name && 
                                Boolean(formik.errors.last_name)}
                            helpTxt={formik.touched.last_name && 
                                formik.errors.last_name}
                        />
                        
                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <DatePicker
                            label="Ingrese Fecha de Nacimiento"
                            value={formik.values.date_of_birth ? 
                                dayjs(formik.values.date_of_birth) : null}
                            onChange={(value) => 
                                formik.setFieldValue('date_of_birth', value)}
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

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <FormControl 
                            component="fieldset" 
                            error={formik.touched.gender && 
                                Boolean(formik.errors.gender)}
                            sx={{ width: '100%', alignItems: 'flex-start' }}
                        >
                            <FormLabel component="legend">Género</FormLabel>
                            <RadioGroup
                                aria-label="gender"
                                name="gender"
                                value={formik.values.gender}
                                onChange={formik.handleChange}
                                row
                            >
                                <FormControlLabel value="M" 
                                control={<Radio />} label="Masculino" />
                                <FormControlLabel value="F" 
                                control={<Radio />} label="Femenino" />
                                <FormControlLabel value="O" 
                                control={<Radio />} label="Otro" />
                                <FormControlLabel value="N" 
                                control={<Radio />} label="Prefiero no decirlo" />
                            </RadioGroup>
                            {formik.touched.gender && formik.errors.gender && (
                                <FormHelperText>
                                    {formik.errors.gender}
                                </FormHelperText>
                            )}
                        </FormControl>

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <Box sx={{ width: '100%' }} > {/* Spacer */}
                            <SelectForm
                                id="categoria"
                                label="Seleccione Categoría"
                                name="categoria"
                                variant="outlined"
                                value={formik.values.categoria}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.categoria && 
                                    Boolean(formik.errors.categoria)}
                                helpTxt={formik.touched.categoria && 
                                    formik.errors.categoria}
                                options={[
                                    { id: 'kids', name: 'Kids' },
                                    { id: 'principiante', name:'Principiante' },
                                    { id: 'intermedio', name: 'Intermedio' },
                                    { id: 'avanzado', name: 'Avanzado' },
                                ]}
                                fullWidth
                            />
                        </Box>

                        <Box sx={{ height: 16 }} /> {/* Spacer */}
                        
                        <TextForm
                            id="email"
                            label="Ingrese Email"
                            name="email"
                            variant="outlined"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && 
                                Boolean(formik.errors.email)}
                            helpTxt={formik.touched.email && 
                                formik.errors.email}
                        /> 

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="email2"
                            label="Confirme Email"
                            name="email2"
                            variant="outlined"
                            type="email"
                            value={formik.values.email2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email2 && 
                                Boolean(formik.errors.email2)}
                            helpTxt={formik.touched.email2 && 
                                formik.errors.email2}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="password"
                            label="Ingrese Contraseña"
                            name="password"
                            variant="outlined"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && 
                                Boolean(formik.errors.password)}
                            helpTxt={formik.touched.password && 
                                formik.errors.password}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="password2"
                            label="Confirmar Contraseña"
                            name="password2"
                            variant="outlined"
                            type="password"
                            value={formik.values.password2}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password2 && 
                                Boolean(formik.errors.password2)}
                            helpTxt={formik.touched.password2 && 
                                formik.errors.password2}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="username"
                            label="Ingrese Nombre de Usuario"
                            name="username"
                            variant="outlined"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && 
                                Boolean(formik.errors.username)}
                            helpTxt={formik.touched.username && 
                                formik.errors.username}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="phone"
                            label="Ingrese Número de Teléfono"
                            name="phone"
                            variant="outlined"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone && 
                                Boolean(formik.errors.phone)}
                            helpTxt={formik.touched.phone && 
                                formik.errors.phone}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}


                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2 }}
                            fullWidth
                        >
                            Registrarse
                        </Button>
                    </Box>
                </div>
            </form>
            <CustomSnackbar {...snackbarProps} />
        </LocalizationProvider>
    )
}

export default RegisterParticipant;
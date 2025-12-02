import '../App.css';
import { React } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import {useFormik} from 'formik';
import * as yup from 'yup';
import TextForm from './forms/TextForm.jsx';
import Button from '@mui/material/Button';
import AxiosObj from './Axios';
import CustomSnackbar from './CustomSnackBar.jsx';
import useSnackBar from './hooks/useSnackBar.jsx';

/*
    Login Page
*/

// DANGEROUS: for testing time-based redirection
// remove before production
let godUserTestEmail = [
    "tralalero1@gmail.com",
    "tralalero2@gmail.com",
    "tralalero3@gmail.com",
    "tralalero4@gmail.com",
    "tralalero5@gmail.com"
];

const Login = () => {

    const {showSnackbar, snackbarProps} = useSnackBar();
    const navigate = useNavigate();

    const validationSchema = yup.object({
        email: yup.string().email('Introduzca un email válido')
        .required('El email es obligatorio'),
        password: yup.string().required('La contraseña es obligatoria'),
    });

    // Handle forgot password action
    const handleForgotPasswordClick = (e) => {
        e.preventDefault(); // Block nav
        showSnackbar('SI olvidaste tu contraseña, \
            por favor contacta con el personal de recepción para reiniciarla.', 
            'info');
    };

    // Handle registrrtion action
    const handleRegisterClick = (e) => {
        e.preventDefault(); // Block nav
        showSnackbar('Función de registro en desarrollo', 'info');
    };

    const formik = useFormik({
        initialValues: 
        {
        email: '',
        password: '',
        },
        validationSchema: validationSchema,
        onSubmit: values => {
        console.log('Form data', values);
        
        AxiosObj.post('/login/', {
            email: values.email,
            password: values.password,
        })
        .then(response => {
            console.log('Login successful:', response.data);
            
            // Store the token
            localStorage.setItem('token', response.data.token);
            
            // Store user data for later use
            localStorage.setItem('user', JSON.stringify({
                id: response.data.user_id,
                email: response.data.email,
                username: response.data.username,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                is_staff: response.data.is_staff,
                is_superuser: response.data.is_superuser,
                is_active: response.data.is_active,
                cup: response.data.cup,
            }));

            // Admins bypass ALL restrictions and go directly to admin page
            // DANGEROUS: for testing time-based redirection
            // remove before production
            if (response.data.is_staff || response.data.is_superuser
                || godUserTestEmail.includes(response.data.email)) {
                // Admin/Staff users go to admin page without any time restrictions
                navigate('/admin');
                return;
            }
            
            // === PARTICIPANT RESTRICTIONS START HERE ===
            
            // Check if user is inactive
            if (!response.data.is_active) {
                console.log('User is inactive, redirecting to /inactive');
                navigate('/inactive');
                return;
            }

            // Time windows based on category (ONLY FOR PARTICIPANTS)
            const targetDateKidsBeg = new Date('2025-12-06T09:00:00');
            const targetDateMedAdv = new Date('2025-12-06T11:00:00');
            const endKids = new Date('2025-12-06T13:00:00');
            const endBeg = new Date('2025-12-06T17:00:00');
            const endMedAdv = new Date('2025-12-06T19:00:00');
            const currentDate = new Date();
            
            const userCategory = response.data.cup;
            console.log('User category:', userCategory);

            if (userCategory === 'kids') {
                if (currentDate < targetDateKidsBeg) {
                    navigate('/inactive-date');
                    return;
                }
                if (currentDate > endKids) {
                    navigate('/competition-ended');
                    return;
                }
                // User is within allowed time window
                navigate('/participant');
                return;
            } else if (userCategory === 'principiante') {
                if (currentDate < targetDateKidsBeg) {
                    navigate('/inactive-date');
                    return;
                }
                if (currentDate > endBeg) {
                    navigate('/competition-ended');
                    return;
                }
                // User is within allowed time window
                navigate('/participant');
                return;
            } else if (userCategory === 'intermedio' || 
                        userCategory === 'avanzado') {
                if (currentDate < targetDateMedAdv) {
                    navigate('/inactive-date');
                    return;
                }
                if (currentDate > endMedAdv) {
                    navigate('/competition-ended');
                    return;
                }
                // User is within allowed time window
                navigate('/participant');
                return;
            } else {
                // Unknown category - deny access
                console.log('Unknown category:', userCategory);
                showSnackbar(
                    'Categoría de usuario no válida. Contacta al administrador.', 
                    'error', 6000);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return;
            }
        })
        .catch(error => {
            console.error('There was an error logging in!', error);
            showSnackbar('Error al iniciar sesión, credenciales inválidas', 
                'error');
        });
        }
    });

    return (
        <>
            <form className="login-form" onSubmit={formik.handleSubmit}>
                <div className="login-page-container">
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
                        }}
                    >
                        <h2>Inicio de Sesión</h2>
                        
                        <TextForm
                            id="email"
                            label="Email"
                            name="email"
                            variant="outlined"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && 
                                Boolean(formik.errors.email)}
                            helpTxt={formik.touched.email && formik.errors.email}
                        />
                        
                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <TextForm
                            id="password"
                            label="Password"
                            name="password"
                            variant="outlined"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && 
                                    Boolean(formik.errors.password)}
                            helpTxt={formik.touched.password && formik.errors.password}
                        />

                        <Box sx={{ height: 16 }} /> {/* Spacer */}

                        <a 
                            href="#" 
                            onClick={handleForgotPasswordClick}
                            style={{ 
                                alignSelf: 'flex-end', 
                                marginBottom: 16,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'primary.main'
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </a>

                        <a 
                            href="/register" 
                            style={{ 
                                alignSelf: 'flex-end', 
                                marginBottom: 16,
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'primary.main'
                            }}
                        >
                            ¿No tienes una cuenta? Regístrate
                        </a> 

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ marginTop: 2 }}
                            fullWidth
                        >
                            Login
                        </Button>
                    </Box>
                </div>
            </form>
            <CustomSnackbar {...snackbarProps} />
        </>
    );
};

export default Login;
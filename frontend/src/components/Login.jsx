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
            
            // Check if user is inactive
            if (!response.data.is_active) {
                console.log('User is inactive, redirecting to /inactive');
                navigate('/inactive');
                return;
            }
            
            // Redirect based on user type
            if (response.data.is_staff || response.data.is_superuser) {
                // Admin/Staff users go to admin page
                console.log('Redirecting to /admin');
                navigate('/admin');
            } else {
                // Normal users go to participant page
                console.log('Redirecting to /participant');
                navigate('/participant');
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
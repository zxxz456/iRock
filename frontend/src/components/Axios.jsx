import axios from 'axios';

/*
  Axios instance with dynamic baseURL based on environment.
  - Local development (localhost or
  192.168.100.83) uses port 8000
  - Production uses relative path /api/ for Nginx proxy
*/

// Get the backend URL from environment or use window.location.hostname
const getBaseURL = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // MODO DESARROLLO: Forzar localhost
  // Descomenta esta línea para desarrollo local:
  // return 'http://localhost:8000/';
  
  let baseURL;
  // If it's localhost in development, use port 8000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    baseURL = 'http://localhost:8000/';
  } 
  // If it's the local network IP in development
  else if (hostname === '192.168.100.83') {
    baseURL = 'http://192.168.100.83:8000/';
  }
  // Otherwise (production/Cloudflare), 
  // use relative path - Nginx will proxy to backend
  else {
    baseURL = '/api/';
  }
  
  console.log(`[Axios] Using baseURL: ${baseURL} 
    (hostname: ${hostname}, protocol: ${protocol})`);
  return baseURL;
};

const AxiosObj = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add a request interceptor to include the auth token
AxiosObj.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
AxiosObj.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default AxiosObj;
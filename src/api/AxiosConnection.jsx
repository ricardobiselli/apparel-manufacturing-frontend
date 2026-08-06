import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});


export default api;


api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || 'Unexpected error occurred';

      switch (status) {
        case 400:
          console.warn('Error de validación:', message);
          break;
        case 404:
          console.warn('Recurso no encontrado:', message);
          break;
        case 500:
          console.error('Error interno del servidor:', message);
          break;
        default:
          console.error('Error desconocido:', message);
          break;
      }
    } else {
      console.error('No se pudo conectar con el servidor.');
    }

    return Promise.reject(error);
  }
);
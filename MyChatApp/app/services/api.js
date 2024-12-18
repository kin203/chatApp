import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://chatapp-zuv8.onrender.com/',
  withCredentials: true,
});

export default api;

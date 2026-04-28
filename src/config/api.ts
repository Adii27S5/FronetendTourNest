export const API_BASE_URL = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : "https://tournest-backend-docker.onrender.com";

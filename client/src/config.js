export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_API_URL || 'https://srv-d92fhr19rddc738hb4h0.onrender.com');

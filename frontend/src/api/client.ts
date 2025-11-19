import axios from "axios";

export const API_BASE = "http://localhost:7071/api";

export const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Automatically attach tokens + app version to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const APP_VERSION = localStorage.getItem("appVersion");

  // console.log('🔄 API Request Interceptor - Token:', token ? 'Present' : 'Missing');
  // console.log('🔄 API Request Interceptor - URL:', config.url);
  
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔄 Authorization header set');
  } else {
    console.log('❌ No token found in localStorage');
  }

  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  config.headers["x-app-version"] = APP_VERSION;

  // console.log('🔄 Final headers:', config.headers);
  return config;
});

// ✅ Handle token refresh and errors globally
api.interceptors.response.use(
  (response) => {
    // Check if response contains new access token
    if (response.data && response.data.newAccessToken) {
      const newToken = response.data.newAccessToken;
      
      // Update token in localStorage
      localStorage.setItem('token', newToken);
      
      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Remove newAccessToken from response data so components don't receive it
      delete response.data.newAccessToken;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.error || "";

    // 🔒 Session expired or invalid token
    if (status === 401 && errorMsg.includes("Session expired")) {
      localStorage.clear();
      window.location.href = "/login";
    }

    // ⚠️ Version mismatch
    else if (status === 400 && errorMsg.includes("Version mismatch")) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
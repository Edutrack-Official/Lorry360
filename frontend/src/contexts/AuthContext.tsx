// import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { registerForPush } from '../utils/push';
// import { API_BASE } from "../api/client";

// interface User {
//   id: string;
//   userId: string; // Add this to match what you're using in collaboration code
//   name: string;
//   email: string;
//   role: 'owner' | 'admin'; // Fixed type
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   resetPassword: (email: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Set up axios defaults
// axios.defaults.baseURL = '/api';

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
//   const [loading, setLoading] = useState(true);

//   // Logout function
//   const logout = useCallback(() => {
//     setUser(null);
//     setToken(null);
//     localStorage.clear();
//     sessionStorage.clear();

//     // Clear axios headers
//     axios.defaults.headers.common = {};
//     axios.defaults.headers.post = {};
//     axios.defaults.headers.get = {};
//     axios.defaults.headers.put = {};
//     axios.defaults.headers.delete = {};

//     toast.success('Logged out successfully');
//   }, []);

//   // Initialize auth state from localStorage
//   useEffect(() => {
//     const initializeAuth = () => {
//       const storedToken = localStorage.getItem('token');
//       const storedRefreshToken = localStorage.getItem('refreshToken');
//       const storedUser = localStorage.getItem('user');

//       if (storedToken && storedRefreshToken && storedUser) {
//         try {
//           axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//           axios.defaults.headers.common['x-refresh-token'] = storedRefreshToken;

//           const userData = JSON.parse(storedUser);
//           // Ensure user object has both id and userId for compatibility
//           const normalizedUser = {
//             ...userData,
//             userId: userData.userId || userData.id, // Map id to userId if needed
//             id: userData.id || userData.userId
//           };
          
//           setToken(storedToken);
//           setUser(normalizedUser);
//         } catch (error) {
//           console.error('Error parsing stored user data:', error);
//           logout();
//         }
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//   }, [logout]);

//   useEffect(() => {
//   if (user && token) {
//     registerForPush(axios).catch((err) => {
//       console.error("Push registration failed:", err);
//     });
//   }
// }, [user, token]);

//   // Axios response interceptor for 401 and token refresh
//   useEffect(() => {
//     const interceptor = axios.interceptors.response.use(
//       (response) => {
//         // Update token if backend provides a new one
//         if (response.data.newAccessToken) {
//           const newToken = response.data.newAccessToken;
//           setToken(newToken);
//           localStorage.setItem('token', newToken);
//           axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//           delete response.data.newAccessToken;
//         }
//         return response;
//       },
//       (error) => {
//         const { config, response } = error;

//         // Ignore 401 for login, register, reset endpoints
//         const ignoreUrls = [
//           `${API_BASE}/loginUser`,
//           `${API_BASE}/auth/register`,
//           `${API_BASE}/forgotPassword`
//         ];

//         if (response?.status === 401 && !ignoreUrls.includes(config.url || '')) {
//           logout();
//           toast.error('Session expired. Please login again.');
//         }

//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.response.eject(interceptor);
//     };
//   }, [logout]);

//   // Login
//   const login = async (email: string, password: string) => {
//     try {
//       const response = await axios.post(`${API_BASE}/loginUser`, { email, password });
//       const { accessToken, refreshToken, frontend_version, user } = response.data;

//       // Normalize user object to have both id and userId
//       const normalizedUser = {
//         ...user,
//         userId: user.userId || user.id,
//         id: user.id || user.userId
//       };

//       setToken(accessToken);
//       setUser(normalizedUser);

//       localStorage.setItem('token', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('user', JSON.stringify(normalizedUser));
//       localStorage.setItem('appVersion', frontend_version);

//       axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//       axios.defaults.headers.common['x-refresh-token'] = refreshToken;

//       toast.success('Login successful!');
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       throw error;
//     }
//   };

//   // Reset password
//   const resetPassword = async (email: string) => {
//     try {
//       const response = await axios.post(`${API_BASE}/forgotPassword`, { email });
//       toast.success(response.data.message || 'Password reset instructions sent!');
//       return response.data;
//     } catch (error: any) {
//       const message = error.response?.data?.error || 'Failed to send reset email';
//       toast.error(message);
//       throw new Error(message);
//     }
//   };

//   // Register
//   const register = async (userData: any) => {
//     try {
//       const response = await axios.post(`${API_BASE}/auth/register`, userData);
//       const { token: newToken, user: newUser } = response.data;

//       // Normalize user object
//       const normalizedUser = {
//         ...newUser,
//         userId: newUser.userId || newUser.id,
//         id: newUser.id || newUser.userId
//       };

//       setToken(newToken);
//       setUser(normalizedUser);
//       localStorage.setItem('token', newToken);
//       localStorage.setItem('user', JSON.stringify(normalizedUser));
//       axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

//       toast.success('Registration successful!');
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       throw error;
//     }
//   };

//   const value = { user, token, login, resetPassword, register, logout, loading };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within an AuthProvider');
//   return context;
// };



//zomoto

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { registerForPush } from '../utils/push';
import { API_BASE } from "../api/client";
import { detachPushOnLogout } from '../utils/logout';

interface User {
  id: string;
  userId: string; // Add this to match what you're using in collaboration code
  name: string;
  email: string;
  role: 'owner' | 'admin'; // Fixed type
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set up axios defaults
axios.defaults.baseURL = '/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Logout function
  const logout = useCallback(async () => {

      try {
    // 🔥 Detach push for this device (Zomato-style)
    await detachPushOnLogout();
  } catch (err) {
    console.warn("Push detach failed (safe to ignore):", err);
  }

    setUser(null);
    setToken(null);
    localStorage.clear();
    sessionStorage.clear();

    // Clear axios headers
    axios.defaults.headers.common = {};
    axios.defaults.headers.post = {};
    axios.defaults.headers.get = {};
    axios.defaults.headers.put = {};
    axios.defaults.headers.delete = {};

    toast.success('Logged out successfully');
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedRefreshToken && storedUser) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          axios.defaults.headers.common['x-refresh-token'] = storedRefreshToken;

          const userData = JSON.parse(storedUser);
          // Ensure user object has both id and userId for compatibility
          const normalizedUser = {
            ...userData,
            userId: userData.userId || userData.id, // Map id to userId if needed
            id: userData.id || userData.userId
          };
          
          setToken(storedToken);
          setUser(normalizedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout]);

  useEffect(() => {
  if (user && token) {
    registerForPush(axios).catch((err) => {
      console.error("Push registration failed:", err);
    });
  }
}, [user, token]);

  // Axios response interceptor for 401 and token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Update token if backend provides a new one
        if (response.data.newAccessToken) {
          const newToken = response.data.newAccessToken;
          setToken(newToken);
          localStorage.setItem('token', newToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          delete response.data.newAccessToken;
        }
        return response;
      },
      (error) => {
        const { config, response } = error;

        // Ignore 401 for login, register, reset endpoints
        const ignoreUrls = [
          `${API_BASE}/loginUser`,
          `${API_BASE}/auth/register`,
          `${API_BASE}/forgotPassword`
        ];

        if (response?.status === 401 && !ignoreUrls.includes(config.url || '')) {
          logout();
          toast.error('Session expired. Please login again.');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE}/loginUser`, { email, password });
      const { accessToken, refreshToken, frontend_version, user } = response.data;

      // Normalize user object to have both id and userId
      const normalizedUser = {
        ...user,
        userId: user.userId || user.id,
        id: user.id || user.userId
      };

      setToken(accessToken);
      setUser(normalizedUser);

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('appVersion', frontend_version);

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      axios.defaults.headers.common['x-refresh-token'] = refreshToken;

      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE}/forgotPassword`, { email });
      toast.success(response.data.message || 'Password reset instructions sent!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send reset email';
      toast.error(message);
      throw new Error(message);
    }
  };

  // Register
  const register = async (userData: any) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData);
      const { token: newToken, user: newUser } = response.data;

      // Normalize user object
      const normalizedUser = {
        ...newUser,
        userId: newUser.userId || newUser.id,
        id: newUser.id || newUser.userId
      };

      setToken(newToken);
      setUser(normalizedUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const value = { user, token, login, resetPassword, register, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
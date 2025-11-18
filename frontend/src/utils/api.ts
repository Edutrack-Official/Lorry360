import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// Axios instance
const api = axios.create({
  baseURL: "http://localhost:7071/api", // Direct backend URL
  timeout: 10000,
});

// Request interceptor (e.g., attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry wrapper
async function requestWithRetry<T = any>(
  config: AxiosRequestConfig,
  retries = 3,
  delay = 1000
): Promise<AxiosResponse<T>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await api.request<T>(config);
    } catch (err: any) {
      const isLastAttempt = i === retries - 1;

      // Only retry on network/connection errors
      if (
        isLastAttempt ||
        (err.response && err.response.status < 500) // don't retry 4xx
      ) {
        throw err;
      }

      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Request failed after retries");
}

// Helper methods
const http = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    requestWithRetry<T>({ url, method: "GET", ...config }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry<T>({ url, method: "POST", data, ...config }),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry<T>({ url, method: "PUT", data, ...config }),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    requestWithRetry<T>({ url, method: "PATCH", data, ...config }),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    requestWithRetry<T>({ url, method: "DELETE", ...config }),
};

export default http;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3002",
  withCredentials: true,
});

export const getApiErrorMessage = (error, resource) => {
  if (!error.response) {
    return `${resource} could not reach the backend at ${api.defaults.baseURL}. Start the backend and check its PostgreSQL DATABASE_URL, port, and credentials.`;
  }
  if (error.response.status === 401) {
    return "Your session has expired. Sign in again to continue.";
  }
  return error.response.data?.error || `${resource} failed with HTTP ${error.response.status}.`;
};

export default api;
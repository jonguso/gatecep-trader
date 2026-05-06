import axios from "axios";

const API = axios.create({
  baseURL: "https://gatecep-backend-production.up.railway.app",
  timeout: 15000,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API ERROR:", {
      url: error?.config?.url,
      baseURL: error?.config?.baseURL,
      status: error?.response?.status,
      message: error?.message,
    });

    return Promise.reject(error);
  }
);

export default API;




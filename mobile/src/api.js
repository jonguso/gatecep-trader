import axios from "axios";

// For local Android emulator: http://10.0.2.2:4000
// For iOS simulator: http://localhost:4000
// For production: your Railway backend URL.
export const API_URL = "https://gatecep-backend-production.up.railway.app/";

export default axios.create({ baseURL: API_URL });

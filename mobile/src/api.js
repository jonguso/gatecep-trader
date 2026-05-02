import axios from "axios";
export const API_BASE = "http://10.0.2.2:4000";
export default axios.create({ baseURL: API_BASE });

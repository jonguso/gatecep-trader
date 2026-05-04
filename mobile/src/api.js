import axios from "axios";

export const API_URL = "https://gatecep-trader.up.railway.app";

export default axios.create({
  baseURL: API_URL
});

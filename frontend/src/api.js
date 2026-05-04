import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default axios.create({
  baseURL: API_URL
});

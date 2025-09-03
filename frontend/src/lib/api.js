// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://your-backend-api.com", // replace with your backend URL
  headers: {
    "Content-Type": "application/json"
  }
});

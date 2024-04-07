import axios from "axios";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL;
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 3000,
})
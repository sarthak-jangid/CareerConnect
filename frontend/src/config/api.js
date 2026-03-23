import axios from "axios";

export const BASE_URL = "https://careerconnect-8ip9.onrender.com";

const clientServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive httpOnly cookies
});

export default clientServer;

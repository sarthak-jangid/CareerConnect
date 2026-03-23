import axios from "axios";

export const BASE_URL = process.env.NEXT_PUBLIC_BASEURL;

const clientServer = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive httpOnly cookies
});

export default clientServer;

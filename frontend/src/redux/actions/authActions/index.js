import clientServer from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, ThunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
      });
      return response.data;
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, ThunkAPI) => {
    try {
      console.log("request go to the backend");
      const response = await clientServer.post("/login", {
        email: userData.email,
        password: userData.password,
      });
      console.log("request come to the backend");

      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      return ThunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchCurrUser = createAsyncThunk(
  "user/fetchCurrUser",
  async (_, ThunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile");
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, ThunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  },
);

/**
 * SEND CONNECTION REQUEST: Send a connection request to another user
 */
export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (connectionId, ThunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          connectionId: connectionId,
        },
      );
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send connection request";
      return ThunkAPI.rejectWithValue(message);
    }
  },
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (_, ThunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_connection_requests");
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (_, ThunkAPI) => {
    try {
      // console.log("here it work ... ")
      const response = await clientServer.post(
        "/user/user_connection_requests",
      );
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async (user, ThunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          requestId: user.connectionId,
          action_type: user.action,
        },
      );
      ThunkAPI.dispatch(getConnectionsRequest());
      ThunkAPI.dispatch(getMyConnectionRequests());
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to accept connection request";
      return ThunkAPI.rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Call logout API
      const response = await clientServer.post(
        "/logout",
        {}, // no body needed
        { withCredentials: true }, // important for cookie
      );

      return response.data; // { message: "Logged out successfully" }
    } catch (error) {
      console.error("Logout error:", error);
      return rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);

import clientServer from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, ThunkAPI) => {
    try {
      // console.log("ok");
      const response = await clientServer.post("/register", {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
      });
      // console.log(response);
      return response.data;
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, ThunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      // console.log(error.response)

      // return proper payload for rejected action
      const message =
        error.response?.data?.message || error.message || "Login failed";
      return ThunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchCurrUser = createAsyncThunk(
  "user/fetchCurrUser",
  async (_, ThunkAPI) => {
    try {
      // console.log("ok thunk")
      const response = await clientServer.get("/get_user_and_profile");
      // console.log("thunk api")
      // console.log(response.data)
      return ThunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return ThunkAPI.rejectWithValue(error.response.data);
    }
  }
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
  }
);

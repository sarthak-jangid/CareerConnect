import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  fetchCurrUser,
  getAllUsers,
  sendConnectionRequest,
  getConnectionsRequest,
  getMyConnectionRequests,
  logoutUser,
} from "../../actions/authActions";

const initialState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  status: "idle",
  connections: [],
  connectionRequest: [],
  profileFetched: false,
  allUsers: null,
  allProfilesFetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // ✅ LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Logging in...";
        state.isError = false;
        state.status = "pending";
        state.isLoggedIn = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Login successful";
        state.status = "succeeded";
        state.isError = false;
        state.isLoggedIn = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.status = "failed";
        state.message = action.payload;
        state.isSuccess = false;
        state.isLoggedIn = false;
      });

    // ✅ REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering...";
        state.status = "pending";
        state.isLoggedIn = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Registration successful";
        state.isLoggedIn = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.isLoggedIn = false;
      });

    //  FETCH CURRENT USER (🔥 MAIN FIX HERE)
    builder
      .addCase(fetchCurrUser.pending, (state) => {
        state.profileFetched = false;
      })
      .addCase(fetchCurrUser.fulfilled, (state, action) => {
        state.profileFetched = true;
        state.user = action.payload?.userProfile || null;

        state.isLoggedIn = !!action.payload?.userProfile;
      })
      .addCase(fetchCurrUser.rejected, (state, action) => {
        state.isError = true;
        state.user = null;
        state.isLoggedIn = false;
        state.profileFetched = true;
        state.message = action.payload;
      });

    // ✅ GET ALL USERS
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload.profiles;
        state.allProfilesFetched = true;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });

    // ✅ CONNECTION REQUEST
    builder
      .addCase(sendConnectionRequest.pending, (state) => {
        state.connectionLoading = true;
      })
      .addCase(sendConnectionRequest.fulfilled, (state) => {
        state.connectionLoading = false;
      })
      .addCase(sendConnectionRequest.rejected, (state) => {
        state.connectionLoading = false;
      });

    // ✅ CONNECTIONS
    builder
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload.connections;
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
        state.connectionRequest = action.payload.connections;
      });

    // ✅ LOGOUT (🔥 STRONG FIX)
    builder.addCase(logoutUser.fulfilled, () => {
      return {
        user: null,
        isLoggedIn: false,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: "",
        status: "idle",
        connections: [],
        connectionRequest: [],
        profileFetched: true, // 🔥 prevents flicker
        allUsers: null,
        allProfilesFetched: false,
      };
    });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

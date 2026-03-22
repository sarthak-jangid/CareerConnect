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
    // login ...
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Logging in...";
        state.isError = false;
        state.status = "pending";
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

    // register ...
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering for you...";
        state.status = "pending";
        state.isSuccess = false;
        state.isError = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "Registration is successful, Please Login";
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.status = "failed";
        state.message = action.payload;
        state.isSuccess = false;
      });

    // fetch current user ...
    builder
      .addCase(fetchCurrUser.pending, (state) => {
        // state.isLoading = true;
        state.profileFetched = false;
      })
      .addCase(fetchCurrUser.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.profileFetched = true;
        state.user = action.payload.userProfile;
      })
      .addCase(fetchCurrUser.rejected, (state, action) => {
        // state.isLoading = false;
        state.isError = true;
        state.user = null;
        state.status = "failed";
        state.message = action.payload;
        state.profileFetched = true;
      });

    // get all users ...
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.allUsers = action.payload.profiles;
        state.allProfilesFetched = true;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });

    // send connection request ...
    builder
      .addCase(sendConnectionRequest.pending, (state) => {
        state.connectionLoading = true;
        state.message = "Sending connection request...";
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(sendConnectionRequest.fulfilled, (state) => {
        state.connectionLoading = false;
        state.isSuccess = true;
        state.message = "Connection request sent successfully!";
        state.isError = false;
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.connectionLoading = false;
        // Don't set error for "already sent" - treat as success for UI
        if (action.payload !== "Connection request already sent") {
          state.isError = true;
        }
        state.message = action.payload || "Failed to send connection request";
        state.isSuccess = false;
      });

    // get connection requests ...
    builder
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload.connections;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload || "Failed to get connections";
      });

    // get my connection requests ...
    builder
      .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
        state.connectionRequest = action.payload.connections;
        state.isError = false;
        state.isSuccess = true;
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload || "Failed to get my connections";
      })

      // logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Logging out...";
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        // Reset everything using the reset reducer logic
        return {
          ...initialState,
          message: action.payload?.message || "Logged out successfully",
        };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload?.message || "Logout failed";
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

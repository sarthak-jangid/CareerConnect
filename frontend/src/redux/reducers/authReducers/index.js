import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  fetchCurrUser,
  getAllUsers,
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
      .addCase(registerUser.fulfilled, (state, action) => {
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
        state.isLoading = true;
        state.profileFetched = false;
      })
      .addCase(fetchCurrUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileFetched = true; //  fetch attempt completed
        state.user = action.payload.userProfile;
      })
      .addCase(fetchCurrUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.user = null;
        state.status = "failed";
        state.message = action.payload;
        state.profileFetched = true; //  IMPORTANT (fetch completed)
      });

    // get all users ...
    builder
      .addCase(getAllUsers.pending, (state) => {})
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.allUsers = action.payload.profiles;
        state.allProfilesFetched = true;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

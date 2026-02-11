import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducers";
import postReducer from "./reducers/postReducers";

const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});

export default store;

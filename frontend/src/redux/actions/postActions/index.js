import clientServer from "@/config/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

// get all posts ....
export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      // console.log(response.data);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts",
      );
    }
  },
);

// create post ...
export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("body", body);

      const response = await clientServer.post("/createPost", formData);
      // console.log(response.data.post);

      return thunkAPI.fulfillWithValue(response.data.post);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.delete("/deletePost", {
        data: {
          postId: post.postId,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      // console.log("error");
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

// like post ...
export const likePost = createAsyncThunk(
  "post/incrementLike",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.post(`/likePost`, { postId });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getPostLike = createAsyncThunk(
  "post/getPostLike",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.get(`/likePost/${postId}`);
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const getAllCommentsForPost = createAsyncThunk(
  "post/getCommentsForPost",
  async (postId, thunkAPI) => {
    try {
      console.log("post action check .")
      const response = await clientServer.get("/getCommentsForPost", {
        params: { postId },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data,
        postId: postId,
      });
    } catch (error) {
      console.log("post action error check .")
      console.log(error)
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

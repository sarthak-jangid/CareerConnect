import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  createPost,
  likePost,
  getPostLike,
  getAllCommentsForPost,
} from "@/redux/actions/postActions";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducer: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },
  extraReducers: (builder) => {
    // Get All Posts
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isError = null;
        state.message = "Fetching All Posts ...";
        state.isLoading = true;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isError = false;
        state.isLoading = false;
        state.postFetched = true;
        state.posts = action.payload.posts;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // instant update
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
      })
      // Like Post
      .addCase(likePost.pending, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.hasLiked = !post.hasLiked;
          post.likes += post.hasLiked ? 1 : -1; // optimistic update
        }
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = action.payload.likes;
          post.hasLiked = action.payload.hasLiked;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.hasLiked = !post.hasLiked;
          post.likes += post.hasLiked ? 1 : -1; // revert optimistic update
        }
      })
      // Get Post Like
      .addCase(getPostLike.fulfilled, (state, action) => {
        const postId = action.meta.arg;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = action.payload.likes;
          post.hasLiked = action.payload.hasLiked;
        }
      })
      // Get Comments for Post
      .addCase(getAllCommentsForPost.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.postId = action.payload.postId;
      });
  },
});

export const { reset } = postSlice.actions;
export default postSlice.reducer;

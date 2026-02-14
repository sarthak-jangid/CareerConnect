import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPosts,
  createPost,
  likePost,
  getPostLike,
  getAllCommentsForPost,
  deletePost,
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

const getIdFromAction = (action) => {
  // handle meta.arg being a string id or an object like { postId } or { _id }
  const metaArg = action?.meta?.arg;
  if (typeof metaArg === "string") return metaArg;
  if (metaArg && (metaArg.postId || metaArg._id))
    return metaArg.postId || metaArg._id;
  // fallback to payload fields if present
  const payload = action?.payload;
  if (payload && (payload.postId || payload._id))
    return payload.postId || payload._id;
  return undefined;
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
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
        const postId = getIdFromAction(action);
        if (!postId) return;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.hasLiked = !post.hasLiked;
          post.likes = (post.likes || 0) + (post.hasLiked ? 1 : -1); // optimistic update
        }
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = getIdFromAction(action);
        if (!postId) return;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          // prefer payload values if present, otherwise merge
          if (action.payload?.likes !== undefined)
            post.likes = action.payload.likes;
          if (action.payload?.hasLiked !== undefined)
            post.hasLiked = action.payload.hasLiked;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        const postId = getIdFromAction(action);
        if (!postId) return;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          // revert optimistic update
          post.hasLiked = !post.hasLiked;
          post.likes = (post.likes || 0) + (post.hasLiked ? 1 : -1);
        }
      })
      // Get Post Like
      .addCase(getPostLike.fulfilled, (state, action) => {
        const postId = getIdFromAction(action);
        if (!postId) return;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          if (action.payload?.likes !== undefined)
            post.likes = action.payload.likes;
          if (action.payload?.hasLiked !== undefined)
            post.hasLiked = action.payload.hasLiked;
        }
      })
      // Get Comments for Post
      .addCase(getAllCommentsForPost.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.postId = action.payload.postId;
      })
      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isError = null;
        state.message = "Deleting post...";
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = getIdFromAction(action);
        if (!postId) return;
        state.posts = state.posts.filter((p) => p._id !== postId);
        state.isError = false;
        state.isLoading = false;
        state.message = "Post deleted successfully";
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload || "Failed to delete post";
      });
  },
});

export const { reset, resetPostId } = postSlice.actions;
export default postSlice.reducer;

import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

// helper: read token from cookie / Authorization header / body (fallback)
const getTokenFromRequest = (req) => {
  return (
    req.cookies?.token ||
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined) ||
    req.body?.token
  );
};

export const activeCheck = (req, res) => {
  return res.status(200).json({ message: "Running" });
};

export const createPost = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const postContent = req.body.body;
    const user = await User.findOne({ token: token });
    if (!user) return res.status(404).json({ message: "User not found" });

    let newPost = new Post({
      userId: user._id,
      body: postContent,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    });
    await newPost.save();

    // POPULATE userId
    newPost = await newPost.populate("userId", "name profilePicture");

    return res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const user = token ? await User.findOne({ token }) : null;
    const posts = await Post.find().sort({ createdAt: -1 }).populate("userId");
    const postsWithLikeStatus = posts.map((post) => ({
      ...post.toObject(),
      hasLiked: user ? post.likedBy.includes(user._id) : false,
    }));
    return res.status(200).json({ posts: postsWithLikeStatus });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    // const { userId, postId } = req.body;
    const token = getTokenFromRequest(req);
    // console.log(req.body.postId);
    const postId = req.body.postId;
    const user = await User.findOne({ token });
    // console.log(user._id)
    if (!user) return res.status(404).json({ message: "User not found" });
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.deleteOne({ _id: postId });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { postId } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likedBy.includes(user._id);
    if (hasLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== user._id.toString(),
      );
      post.likes -= 1;
    } else {
      // Like
      post.likedBy.push(user._id);
      post.likes += 1;
    }
    await post.save();
    return res.status(200).json({ likes: post.likes, hasLiked: !hasLiked });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostLike = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { postId } = req.params;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likedBy.includes(user._id);
    return res.status(200).json({ likes: post.likes, hasLiked });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    // const { userId, postId, comment } = req.body;
    const token = getTokenFromRequest(req);
    const { postId, comment } = req.body;
    const user = await User.findOne({ token }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = new Comment({
      userId: user._id,
      postId: post._id,
      body: comment,
    });
    await newComment.save();
    return res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const get_comments_for_post = async (req, res) => {
  try {
    console.log("backend work ...");
    const { postId } = req.query;
    console.log(req.query);
    const comments = await Comment.find({ postId: postId }).populate(
      "userId",
      "username name profilePicture",
    );
    console.log(comments);
    return res.status(200).json(comments.reverse());
  } catch (error) {
    console.log("backend error ...");
    return res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { commentId } = req.body;
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const comment = await Comment.findOne({ _id: commentId });
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Comment.deleteOne({ _id: commentId });

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

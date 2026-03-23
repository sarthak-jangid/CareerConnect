import dotenv from "dotenv";
dotenv.config();

import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";

/**
 * HELPER FUNCTION: Extract authentication token from request
 * Checks in order: cookies, Authorization header (Bearer), request body
 * @param {Object} req - Express request object
 * @returns {String|undefined} - Token string or undefined if not found
 */
const getTokenFromRequest = (req) => {
  console.log("=== DEBUG COOKIES ===");
  console.log("Cookies:", req.cookies);
  console.log("Headers auth:", req.headers.authorization);
  console.log("Token found:", req.cookies?.token);
  console.log("===================");
  return (
    req.cookies?.token || // cookie name "token"
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined) ||
    req.body?.token
  );
};


/**
 * UTILITY: Convert user profile data to PDF document
 * Generates a formatted PDF with user info, bio, and work history
 * @param {Object} userProfile - Profile object with userId reference
 * @returns {Promise<String>} - Path to generated PDF file
 */
const convertUserDataToPDF = async (userProfile) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);
  doc.image(`uploads/${userProfile.userId.profilePicture}`, {
    align: " center",
    width: 100,
  });
  doc.fontSize(14).text(`Name : ${userProfile.userId.name}`);
  doc.fontSize(14).text(`Username : ${userProfile.userId.username}`);
  doc.fontSize(14).text(`Email : ${userProfile.userId.email}`);
  doc.fontSize(14).text(`Bio : ${userProfile.bio}`);
  doc.fontSize(14).text(`Current Position : ${userProfile.currentPost}`);
  doc.fontSize(16).text("Past Work :");
  userProfile.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name : ${work.company}`);
    doc.fontSize(14).text(`Position : ${work.position}`);
    doc.fontSize(14).text(`Year : ${work.year}`);
  });
  doc.end();

  return outputPath;
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * REGISTER: Create a new user account
 * Validates input, hashes password, creates User and Profile records, and issues auth token
 * @route POST /register
 * @param {String} name - User's full name (min 2 chars)
 * @param {String} email - User's email (must be valid and unique)
 * @param {String} password - User's password (min 6 chars, should be hashed on client too)
 * @param {String} username - User's username (min 3 chars, must be unique)
 * @returns {Object} - { message: "User registered successfully" } with token cookie
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Basic validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Name must be at least 2 characters" });
    }
    if (username.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be 6+ characters" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    // Create profile
    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    // Generate token
    const token = crypto.randomBytes(64).toString("hex");
    newUser.token = token;
    await newUser.save();

    // Set token as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure on HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return success
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// LOGIN: Authenticate user and issue token
// Validates credentials, checks password, and sets httpOnly token cookie
// @route POST /login
// @param {String} email - User's registered email
// @param {String} password - User's plaintext password (compared against hashed version)
// @returns {Object} - { message: "Logged in successfully" } with token cookie
export const login = async (req, res) => {
  try {
    console.log("request come here .....");
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(64).toString("hex");
    user.token = token;
    await user.save();

    // Set token as httpOnly cookie (already "auth_token")
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only secure on HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Logged in successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token; // get token from httpOnly cookie
    if (!token) return res.status(400).json({ message: "Already logged out" });

    // Clear token in DB
    await User.findOneAndUpdate({ token }, { token: "" });

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Logout failed" });
  }
};

/**
 * UPLOAD PROFILE PICTURE: Update user's profile picture
 * Requires authentication via token
 * @route POST /upload-profile-picture
 * @requires Authorization (token in cookie, header, or body)
 * @param {File} file - Uploaded image file (via multer middleware)
 * @returns {Object} - { message: "Profile picture updated successfully" }
 */
export const uploadProfilePicture = async (req, res) => {
  const token = getTokenFromRequest(req);

  //  AUTHENTICATION CHECK: Verify user is logged in
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(req.file);

    user.profilePicture = req.file.filename;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile picture updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE USER PROFILE: Modify user's basic account info (name, email, username, etc.)
 * Requires authentication and checks for duplicate email/username
 * @route PUT /update-profile
 * @requires Authorization (token)
 * @param {Object} body - Fields to update (name, email, username, etc.)
 * @returns {Object} - { message: "User profile updated successfully" }
 */
export const updateUserProfile = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { ...newUserData } = req.body; // body contains profile fields only

    //  AUTHENTICATION CHECK: Verify user is logged in
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "User already exists" });
      }
    }

    // Object.assign(target, source);
    // target → object to update
    // source → object containing new values
    Object.assign(user, newUserData);
    await user.save();

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET USER AND PROFILE: Fetch the logged-in user's own profile
 * Requires authentication
 * @route GET /user-profile
 * @requires Authorization (token)
 * @returns {Object} - { userProfile: { userId: {...}, bio, pastWork, ... } }
 */
export const getUserAndProfile = async (req, res) => {
  try {
    console.log("ok backend");
    const token = getTokenFromRequest(req);

    if (!token) return res.status(400).json({ message: "Already logged out" });

    //  AUTHENTICATION CHECK: Verify user is logged in
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture ",
    );
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE PROFILE DATA: Modify user's profile info (bio, pastWork, currentPost, etc.)
 * Requires authentication
 * @route PUT /update-profile-data
 * @requires Authorization (token)
 * @param {Object} body - Profile fields to update (bio, pastWork, currentPost, etc.)
 * @returns {Object} - { message: "Profile updated successfully" }
 */
export const updateProfileData = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { ...newProfileData } = req.body;

    //  AUTHENTICATION CHECK: Verify user is logged in
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({ userId: user._id });
    if (!profile_to_update) {
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL USER PROFILES: Fetch all users' profiles (public endpoint)
 * No authentication required; returns all user profiles for discovery
 * @route GET /all-profiles
 * @returns {Object} - { profiles: [ { userId: {...}, bio, pastWork, ... }, ... ] }
 */
export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture",
    );
    return res.status(200).json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DOWNLOAD PROFILE: Generate and download user profile as PDF
 * No authentication required; public endpoint
 * @route GET /download-profile?id=<userId>
 * @param {String} id - Target user's ID (via query param)
 * @returns {Object} - { message: "<outputPath to PDF file>" }
 */
export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name email username profilePicture",
  );

  let outputPath = await convertUserDataToPDF(userProfile);

  return res.status(200).json({ message: outputPath });
};

// ============================================
// CONNECTION MANAGEMENT ENDPOINTS
// ============================================

/**
 * SEND CONNECTION REQUEST: Send a connection request to another user
 * Requires authentication; prevents duplicate requests
 * @route POST /send-connection-request
 * @requires Authorization (token)
 * @param {String} connectionId - ID of user to connect with
 * @returns {Object} - { message: "Connection request sent" }
 */
export const sendConnectionRequest = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { connectionId } = req.body;

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    //  FIX: Prevent users from sending connection requests to themselves
    if (user._id.toString() === connectionId) {
      return res
        .status(400)
        .json({ message: "You cannot send a connection request to yourself" });
    }

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser)
      return res.status(404).json({ message: "Connection user not found" });

    // Check if the connection request already exists
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionId,
    });

    await request.save();

    return res.status(200).json({ message: "Connection request sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET MY CONNECTION REQUESTS: Fetch all pending connection requests sent by the logged-in user
 * Requires authentication
 * @route GET /my-connection-requests
 * @requires Authorization (token)
 * @returns {Object} - { connections: [ { userId, connectionId, status, ... }, ... ] }
 */
export const getMyConnectionRequests = async (req, res) => {
  try {
    console.log("also work here in start ...");
    const token = getTokenFromRequest(req);
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });
    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("connectionId", "name email username profilePicture");
    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET MY CONNECTIONS: Fetch all pending connection requests received by the logged-in user
 * Requires authentication
 * @route GET /my-connections
 * @requires Authorization (token)
 * @returns {Object} - { connections: [ { userId, connectionId, status, ... }, ... ] }
 */
export const whatAreMyConnections = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name email username profilePicture");
    return res.status(200).json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * ACCEPT/REJECT CONNECTION REQUEST: Respond to a received connection request
 * Requires authentication; updates request status (accept/reject)
 * @route POST /respond-connection-request
 * @requires Authorization (token)
 * @param {String} requestId - Connection request ID
 * @param {String} action_type - "accept" or "reject"
 * @returns {Object} - { message: "Connection request updated" }
 */
export const acceptConnectionRequest = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { requestId, action_type } = req.body;

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

    const connection = await ConnectionRequest.findOne({ _id: requestId });

    if (!connection)
      return res.status(404).json({ message: "Connection request not found" });

    if (action_type == "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    connection.save();

    return res.status(200).json({ message: "Connection request updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET USER PROFILE BY USERNAME: Fetch user and profile data using username
 * 🔒 SECURITY NOTE: Should this require authentication?
 * ✅ ANSWER: Currently PUBLIC (no login required) because this is a networking app
 *    where users should be discoverable. If you want PRIVATE profiles, add auth check below.
 *
 * @route GET /profile/:username (or query param)
 * @param {String} username - The target user's username (via query or URL param)
 * @returns {Object} - { userProfile: { userId: {...}, bio, pastWork, ... } }
 *
 * TO REQUIRE LOGIN: Uncomment the auth check below (lines marked with 🔒)
 */
export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  try {
    const { username } = req.query;

    // 🔒 OPTIONAL: Uncomment below 3 lines to require user to be logged in
    // const token = getTokenFromRequest(req);
    // const loggedInUser = await User.findOne({ token });
    // if (!loggedInUser) return res.status(401).json({ message: "Please log in to view profiles" });

    // Fetch target user by username
    const user = await User.findOne({
      username,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Populate user's profile with full user details
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture",
    );

    return res.status(200).json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

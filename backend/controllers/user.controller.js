import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";

// helper: read token from cookie / Authorization header / body (fallback)
const getTokenFromRequest = (req) => {
  console.log(" get token work");
  return (
    req.cookies?.token || // cookie name "token"
    (req.headers?.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined) ||
    req.body?.token
  );
};

// convert User Profile to PDF ...

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

// Routes .......................................................

// Register route ...
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
      httpOnly: true, // JS cannot access
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Optional: 7 days
    });

    // Return success
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login route ...

export const login = async (req, res) => {
  try {
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Logged in successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const token = getTokenFromRequest(req);

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = req.file.filename;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile picture updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { ...newUserData } = req.body; // body contains profile fields only
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

export const getUserAndProfile = async (req, res) => {
  try {
    console.log("ok backend");
    const token = getTokenFromRequest(req);

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture "
    );
    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { ...newProfileData } = req.body;
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

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );
    return res.status(200).json({ profiles });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name email username profilePicture"
  );

  let outputPath = await convertUserDataToPDF(userProfile);

  return res.status(200).json({ message: outputPath });
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const token = getTokenFromRequest(req);
    const { connectionId } = req.body;

    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ message: "User not found" });

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

export const getMyConnectionsRequests = async (req, res) => {
  try {
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

    return res.status(200).json({ message: "Connection request updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

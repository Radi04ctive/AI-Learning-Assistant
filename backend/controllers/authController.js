import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import getRedis from "../config/redis.js";

// Access-token lifetime in seconds, used for the Redis blacklist TTL on logout
// (an access token can only be blacklisted for as long as it could still live).
const ACCESS_TTL_SECONDS = () => {
  const expire = process.env.JWT_ACCESS_EXPIRE || "15m";
  // Convert "15m" / "2h" / "30s" style strings to seconds.
  const match = /^(\d+)([smhd])$/.exec(expire.trim());
  if (!match) return 900; // default 15 minutes
  const value = parseInt(match[1], 10);
  const unit = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
  return value * unit;
};

// Refresh-token lifetime in milliseconds, used to set each token's expiresAt.
const REFRESH_TTL_MS = () => {
  const expire = process.env.JWT_REFRESH_EXPIRE || "7d";
  const match = /^(\d+)([smhd])$/.exec(expire.trim());
  if (!match) return 7 * 24 * 3600 * 1000; // default 7 days
  const value = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
  return value * unit;
};

// Generate a short-lived access JWT (verified by JWT_SECRET in the protect
// middleware). Includes a unique `jti` so a single token can be blacklisted
// on logout, and the standard `iat` so "logout everywhere" can reject tokens
// issued before a global cut-off timestamp.
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId, jti: uuidv4() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

// Generate a long-lived opaque refresh token (a uuid), persist it to the
// refresh_tokens collection, and return the raw token string. Verified by
// DB lookup (not signature), so revocation is simply deleting the doc.
const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  await RefreshToken.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS()),
  });
  return token;
};

// @desc    Rigester new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exist
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      const field = userExists.email === email ? "email" : "username";
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        statusCode: 400,
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a email and password",
        statusCode: 400,
      });
    }

    // Check if user exist
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
      message: "User logged in successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      message: "User profile fetched successfully",
      statusCode: 200,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;
    const user = await User.findById(req.user._id).select("-password");
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found",
        statusCode: 404,
      });
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;
    await user.save();
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      message: "User profile updated successfully",
      statusCode: 200,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide a old password and new password",
        statusCode: 400,
      });
    }
      const user = await User.findById(req.user._id).select("+password");
      if(!user){
        return res.status(404).json({
          success: false,
          message: "User not found",
          statusCode: 404,
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if(!isMatch){
        return res.status(401).json({
          success: false,
          message: "Invalid old password",
          statusCode: 401,
        });
      }
      user.password = newPassword;
      await user.save();

      // Revoke all OTHER sessions: delete every refresh token so no other
      // device can mint a new access token. We do NOT delete the new refresh
      // token issued below, so the current session keeps working.
      await RefreshToken.deleteMany({ userId: user._id });

      // Issue a fresh token pair for this session (the user just proved they
      // know the password, so there is no reason to force a re-login).
      const accessToken = generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id);

      // Set the global cut-off so every access token issued BEFORE this one is
      // rejected by the protect middleware. We anchor the cut-off to the new
      // access token's own iat (seconds) rather than Date.now() (ms): iat
      // truncates to whole seconds, so a Date.now() cut-off could land after
      // the new token's iat*1000 and incorrectly revoke the token we just made.
      try {
        const redis = getRedis();
        const newIatMs = jwt.decode(accessToken).iat * 1000;
        await redis.set(
          `bl:user:${user._id}`,
          newIatMs.toString(),
          "EX",
          ACCESS_TTL_SECONDS(),
        );
      } catch (redisErr) {
        // Fail-open: the password was changed and a new token pair issued, so
        // the current session is unaffected; only the revocation of other
        // sessions is skipped.
        console.error(`Redis blacklist set failed (changePassword): ${redisErr.message}`);
      }

      res.status(200).json({
        success: true,
        data: { accessToken, refreshToken },
        message: "Password updated successfully",
        statusCode: 200,
      });

    } catch (error) {
      next(error);
    }
};

// @desc    Logout (single device)
// @route   POST /api/auth/logout
// @access  Public (uses the bearer token from the header but does not require
//          it to still be valid, so logout still works after access-token expiry)
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Blacklist the access token by its jti for the remainder of its lifetime.
    // We use jwt.decode (no verify) on purpose: we don't care if the token has
    // expired, only that we can read its jti to stop it being replayed.
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      const accessToken = req.headers.authorization.split(" ")[1];
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.jti) {
        try {
          const redis = getRedis();
          await redis.set(`bl:jti:${decoded.jti}`, "revoked", "EX", ACCESS_TTL_SECONDS());
        } catch (redisErr) {
          // Fail-open: refresh token is still deleted below, so this session
          // can't be extended; only the access token can't be force-expired.
          console.error(`Redis blacklist set failed (logout): ${redisErr.message}`);
        }
      }
    }

    // Delete this device's refresh token so it can no longer mint access tokens.
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token (and rotate the refresh token)
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
        statusCode: 401,
      });
    }

    // Look the token up by value. If it doesn't exist (logged out, password
    // changed, or already rotated) the session is invalid.
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        statusCode: 401,
      });
    }
    if (stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: stored._id });
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
        statusCode: 401,
      });
    }

    // Rotation: invalidate the presented refresh token and issue a fresh pair.
    await RefreshToken.deleteOne({ _id: stored._id });
    const accessToken = generateAccessToken(stored.userId);
    const newRefreshToken = await generateRefreshToken(stored.userId);

    res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
      message: "Token refreshed successfully",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import getRedis from "../config/redis.js";

// Reject the request with a 401 carrying the given message.
const reject = (res, message) =>
  res.status(401).json({
    success: false,
    error: message,
    statusCode: 401,
  });

const protect = async (req, res, next) => {
  let token;

  // Check if token is in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature + expiry
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- Token blacklist checks (Redis) ---
      // FAILO-OPEN POLICY: if Redis is unreachable we let a validly-signed,
      // unexpired token through rather than 500-ing every protected request.
      // This is the standard trade-off for a blacklist scheme: worst case a
      // just-logged-out access token stays usable until its short expiry.
      // Switch the catch blocks to `return reject(...)` if you want fail-closed.
      let redis;
      try {
        redis = getRedis();

        // 1) Single-token revocation (logout on this device): the token's jti
        //    was added to the blacklist on logout.
        if (decoded.jti) {
          const revoked = await redis.get(`bl:jti:${decoded.jti}`);
          if (revoked) {
            return reject(res, "Token has been revoked");
          }
        }

        // 2) Global revocation (logout everywhere / password change): the
        //    stored value is a cut-off timestamp (ms). Any token issued before
        //    it is rejected.
        if (decoded.id) {
          const cutoff = await redis.get(`bl:user:${decoded.id}`);
          if (cutoff && decoded.iat * 1000 < parseInt(cutoff, 10)) {
            return reject(res, "Session has been invalidated");
          }
        }
      } catch (redisErr) {
        console.error(`Redis blacklist check failed (fail-open): ${redisErr.message}`);
        return reject(res, "Session has been invalidated");
      }

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return reject(res, "User not found");
      }

      next();

    } catch (error) {
      console.error("Auth middleware error:", error.message);

      if (error.name === "TokenExpiredError") {
        return reject(res, "Token has expired");
      }

      return reject(res, "Not authorized, token failed");
    }
  }

  if (!token) {
    return reject(res, "Not authorized, token is missing");
  }
};

export default protect;

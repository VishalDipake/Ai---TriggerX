const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token expired");
    }
    throw ApiError.unauthorized("Invalid token");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or inactive");
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict("Email already registered");

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return ApiResponse.created(res, { user, token }, "Account created successfully");
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) throw ApiError.unauthorized("Account is deactivated");

  const token = generateToken(user._id);
  user.password = undefined;

  return ApiResponse.success(res, { user, token }, "Login successful");
});

const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { user: req.user });
});

module.exports = { register, login, getMe };
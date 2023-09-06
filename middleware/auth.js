const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const Shop = require("../model/shop");
const asyncHandler = require("express-async-handler");

const isSeller = asyncHandler(async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        res.status(401);
        throw new Error("Not authorized, please login");
      }
  
      // Verify token
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      // Get user id from token
      const seller = await Shop.findById(verified.id).select("-password");
  
      if (!seller) {
        res.status(404);
        throw new Error("Seller not found");
      }
    
  
      req.user = seller;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }
  });

  module.exports = {
    isSeller,

  };


// const path = require("path");
// const fs = require("fs");
// var parser = require("ua-parser-js");
// const jwt = require("jsonwebtoken");
// const sendMail = require("../utils/sendMail");
// const sendToken = require("../utils/jwtToken");
// const { isAuthenticated } = require("../middleware/auth");
// const Shop = require("../model/shop");
// const { upload } = require("../multer");
// const ErrorHandler = require("../utils/ErrorHandler");
// const sendShopToken = require("../utils/shopToken");
// const bcrypt = require("bcryptjs");
// const asyncHandler = require("express-async-handler");
// const generateAuthToken = require("../utils/shopToken");
// const uuid = require("uuid");

// // Register shop
// const registerShop = asyncHandler(async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const sellerEmail = await Shop.findOne({ email });
//     if (sellerEmail) {
//       return next(new ErrorHandler("Sellerr already exists", 400));
//     }

//     // Generate a unique ID for the seller
//     // const sellerId = uuid.v4();

//     const seller = {
//       // _id: sellerId, // Assign the generated ID
//       name: req.body.name,
//       email: email,
//       password: req.body.password,
//       address: req.body.address,
//       phoneNumber: req.body.phoneNumber,
//       zipCode: req.body.zipCode,
//       isSeller: true
//     };

//     const activationToken = createActivationToken(seller);

//     const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

//     try {
//       await sendMail({
//         email: seller.email,
//         subject: "Activate your Shop",
//         message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
//       });


//       res.status(201).json({
//         success: true,
//         message: `Please check your email: ${seller.email} to activate your shop!`,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

// const createActivationToken = (seller) => {
//   return jwt.sign(seller, process.env.ACTIVATION_SECRET_TOKEN, {
//     expiresIn: "1d",
//   });
// };

// const activation = asyncHandler(async (req, res, next) => {
//   try {
//     const { activation_token } = req.body;

//     const newSeller = jwt.verify(
//       activation_token,
//       process.env.ACTIVATION_SECRET_TOKEN
//     );

//     if (!newSeller) {
//       return next(new ErrorHandler("Invalid token", 400));
//     }
//     const {
//       name,
//       email,
//       password,
//       avatar,
//       zipCode,
//       address,
//       phoneNumber,
//       _id,
//     } = newSeller;

//     let seller = await Shop.findOne({ email });

//     if (seller) {
//       return next(new ErrorHandler("Seller already exists", 400));
//     }

//     seller = await Shop.create({
//       _id,
//       name,
//       email,
//       avatar,
//       password,
//       zipCode,
//       address,
//       phoneNumber,
//     });

//     sendShopToken(seller, 201, res);
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// });

// // LOGIN SHOP
// const loginShop = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return next(new ErrorHandler("Please provide all fields!", 400));
//     }

//     const seller = await Shop.findOne({ email }).select("+password");

//     if (!seller) {
//       return next(new ErrorHandler("Seller doesn't exist!", 400));
//     }

//     const isPasswordValid = await seller.comparePassword(password);

//     if (!isPasswordValid) {
//       return next(
//         new ErrorHandler("Please provide the correct information", 400)
//       );
//     }

//     const token = sendShopToken(seller, 200, res);

//     const { _id, name, phoneNumber, zipCode, avatar, role, description } =
//       seller;

//     res.status(200).json({
//       _id,
//       name,
//       email,
//       phoneNumber,
//       zipCode,
//       avatar,
//       role,
//       description,
//       token,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };

// const loadSeller = async (req, res, next) => {
//   try {
//     const seller = await Shop.findOne(req.params.name);

//     if (!seller) {
//       return next(new ErrorHandler("Seller not found.", 404)); // Return a 404 Not Found error.
//     }

//     res.status(200).json({
//       success: true,
//       seller,
//     });
//   } catch (error) {
//     next(error); // Forward any unexpected errors to the error handling middleware.
//   }
// };

// // LOG OUT HANDLER
// const logoutShop = async (req, res, next) => {
//   try {
//     // Clear the token cookie
//     res.cookie("seller_token", "", {
//       path: "/",
//       httpOnly: true,
//       expires: new Date(0), // Set the expiration date to past to immediately expire the cookie
//       sameSite: "none",
//       secure: true,
//     });

//     // Send a JSON response indicating successful logout
//     return res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     next(error);
//   }
// };

// // GET INFO SHOP
// const getShopInfo = async (req, res, next) => {
//   try {
//     const shop = await Shop.findById(req.params.id);
//     res.status(201).json({
//       success: true,
//       shop,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const updateShopAvatar = async (req, res, next) => {
//   try {
//     const existsSeller = await Shop.findById(req.seller);

//     const existAvatarPath = path.join("uploads", existsSeller.avatar);
//     fs.unlinkSync(existAvatarPath);

//     const fileUrl = path.join(req.file.filename);
//     const seller = await Shop.findByIdAndUpdate(req.seller, {
//       avatar: fileUrl,
//     });

//     console.log(existsSeller);

//     res.status(200).json({
//       success: true,
//       seller,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const updateSellerInfo = async (req, res, next) => {
//   try {
//     const { name, description, address, phoneNumber, zipCode } = req.body;

//     const shop = await Shop.findOne(req.seller);

//     if (!shop) {
//       return next(new ErrorHandler("Seller not found", 400));
//     }

//     shop.name = name;
//     shop.description = description;
//     shop.address = address;
//     shop.phoneNumber = phoneNumber;
//     shop.zipCode = zipCode;

//     await shop.save();

//     res.status(201).json({
//       success: true,
//       shop,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const updatePayment = async (req, res, next) => {
//   try {
//     const { withdrawMethod } = req.body;

//     const seller = await Shop.findByIdAndUpdate(req.seller?._id, {
//       withdrawMethod,
//     });

//     res.status(201).json({
//       success: true,
//       seller,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };

// const deleteWithdraw = async (req, res, next) => {
//   try {
//     const seller = await Shop.findById(req.seller._id);

//     if (!seller) {
//       return next(new ErrorHandler("Seller not found with this id", 400));
//     }

//     seller.withdrawMethod = null;

//     await seller.save();

//     res.status(201).json({
//       success: true,
//       seller,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };

// module.exports = {
//   registerShop,
//   activation,
//   loginShop,
//   loadSeller,
//   logoutShop,
//   getShopInfo,
//   updateShopAvatar,
//   updateSellerInfo,
//   updatePayment,
//   deleteWithdraw,
// };

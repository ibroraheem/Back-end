const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncError = require("../middleware/catchAsyncError");
const router = express.Router();
const Product = require("../model/product");
const Order = require("../model/order");
const Shop = require("../model/shop");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");

router.post(
  "/createProducts",
  upload.array("images", 5),
  catchAsyncError(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("ShopId is invalid", 400));
      } else {
        const files = req.files; // Use req.files to get the uploaded files

        if (!Array.isArray(files) || files.length === 0) {
          return next(
            new ErrorHandler(
              "No files uploaded or files format is incorrect",
              400
            )
          );
        }

        const imageUrls = files.map((file) => `${file.filename}`);
        console.log(imageUrls);

        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;

        // Create the product
        const product = await Product.create(productData);

        res.status(201).json({
          success: true,
          product,
        });

      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// get all products of a shop
router.get(
  "/getAllProductShop/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// delete product of a shop
router.delete(
  "/deleteShopProduct/:id",
  isSeller,
  catchAsyncError(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product is not found with this id", 404));
      }

      // Define a function to delete product images
      const deleteProductImages = async (images) => {
        for (let i = 0; i < images.length; i++) {
          // Perform deletion logic for each image (e.g., removing from storage)
          // Replace the following line with your custom image deletion logic
          // Example: fs.unlinkSync(images[i].path);
        }
      };

      // Call the custom function to delete product images
      await deleteProductImages(product.images);

      await product.remove();

      res.status(201).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// get all products
router.get(
  "/getAllProducts",
  catchAsyncError(async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);



module.exports = router;

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

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// })


router.post(
  "/createProducts",
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findOne({ _id: req.body.shopId });
      if (!shop) {
        return next(new ErrorHandler("shopId is invalid", 400));
      } else {
        let images = [];
        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else {
          images.push(req.body.images);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
        const productData = req.body;
        productData.images = imagesLinks;
        productData.shop = shop;

        // create product
        const product = await Product.create(productData);

        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      console.log(error);
      // return next(new ErrorHandler(error, 400));
      res.status(500).json(error)
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

router.get("/getshops",
  catchAsyncError(async (req, res, next) => {
    try {
      const shop = await Shop.findOne({ id: req.body.id });
      if (!shop) return next(new ErrorHandler("shopId is invalid", 400));
      res.status(200).send(shop);
    } catch (err) {
      console.log(err);
      res.status(500).send(err)
    }
  }));

module.exports = router;

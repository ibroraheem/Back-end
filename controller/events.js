const express = require("express");
const catchAsyncError = require("../middleware/catchAsyncError");
const Shop = require("../model/shop");
const Event = require("../model/events");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const { upload } = require("../multer");

router.post(
  "/createEvent",
  upload.array("images", 5), // Assuming you have a field named "images" for file uploads, and limit it to 5 images
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

        const imagesLinks = files.map((file) => `${file.filename}`);
        // console.log(imagesLinks);

        const productData = req.body;
        productData.images = imagesLinks;
        productData.shop = shop;

        // Create the event
        const event = await Event.create(productData);

        res.status(201).json({
          success: true,
          event,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all events
router.get("/getAllEvents", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events of a shop
router.get(
  "/getAllEventShop/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.delete(
  "/deleteShopEvent/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return next(new ErrorHandler("Event is not found with this id", 404));
      }

      // Define a function to delete event images
      const deleteEventImages = async (images) => {
        for (let i = 0; i < images.length; i++) {
          // Perform deletion logic for each image (e.g., removing from storage)
          // Replace the following line with your custom image deletion logic
          // Example: fs.unlinkSync(images[i].path);
        }
      };

      // Call the custom function to delete event images
      await deleteEventImages(event.images);

      await event.remove();

      res.status(201).json({
        success: true,
        message: "Event Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;

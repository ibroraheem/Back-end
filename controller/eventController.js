const express = require("express");
const Event = require("../model/events");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

const registerEvent = async (req, res, next) => {
  try {
    const files = []; // Make sure req.files contains an array of uploaded files

    if (!Array.isArray(files)) {
      return next(
        new ErrorHandler("No files uploaded or files format is incorrect", 400)
      );
    }

    const imageUrls = files.map((file) => `${file.filename}`);
    console.log(imageUrls);

    const productData = req.body;
    productData.images = imageUrls;

    const event = await Event.create(productData);

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const event = await Event.find();

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

// DELETE PRODUCTS
const deleteEvents = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const eventData = await Event.findById(productId);

    eventData.images.forEach((imageUrl) => {
      const filename = imageUrl;
      const filePath = `uploads/${filename}`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

    const events = await Event.findByIdAndDelete(productId);
    if (!events) {
      return next(new ErrorHandler("Events not found with this id", 500));
    }

    res.status(201).json({
      success: true,
      message: "Events Deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find();

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

module.exports = {
  registerEvent,
  getEvents,
  deleteEvents,
  getAllEvents,
};

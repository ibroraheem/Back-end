const express = require("express");
const {
  registerProduct,
  getProducts,
  deleteProducts,
  getAllProducts,
  CreateNewReview,
} = require("../controller/productController");
const router = express.Router();
const { upload } = require("../multer");
const { isSeller, isAuthenticated } = require("../middleware/auth");

router.post("/createProducts",  registerProduct)

router.get("/getAllProducts", getProducts);

router.delete("/deleteProducts", isSeller, deleteProducts);

router.get("/getAllProducts", getAllProducts);

router.put("/createNewReview", CreateNewReview);

module.exports = router;

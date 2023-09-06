const order = require("../model/order");
const Product = require("../model/product");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");


const registerProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};




const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

// DELETE PRODUCTS
const deleteProducts = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const productData = await Product.findById(productId);

    productData.images.forEach((imageUrl) => {
      const filename = imageUrl;
      const filePath = `uploads/${filename}`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found with this id", 500));
    }

    res.status(201).json({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

const CreateNewReview = async (req, res, next) => {
  try {
    const { user, rating, comment, productId, orderId } = req.body;

    const product = await Product.findById(productId);

    const review = {
      user,
      rating,
      comment,
      productId,
    };

    console.log(review);

    const isReviewed = product.reviews.find(
      (rev) => rev.user._id === req.user._id
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user._id === req.user._id) {
          (rev.rating = rating), (rev.comment = comment), (rev.user = user);
        }
      });
    } else {
      product.reviews.push(review);
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    await order.findByIdAndUpdate(
      orderId,
      { $set: { "cart.$[elem].isReviewed": true } },
      { arrayFilters: [{ "elem._id": productId }], new: true }
    );

    res.status(200).json({
      success: true,
      message: "Reviwed succesfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
};

module.exports = {
  registerProduct,
  getProducts,
  deleteProducts,
  getAllProducts,
  CreateNewReview,
};

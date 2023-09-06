const express = require("express");
const {
  registerShop,
  activation,
  loginShop,
  loadUser,
  logoutShop,
  loadSeller,
  getShopInfo,
  updateShopAvatar,
  updateShopInfo,
  updateSellerInfo,
  updatePayment,
  deleteWithdraw,
} = require("../controller/shopController");
const { upload } = require("../multer");
const { isSeller } = require("../middleware/auth");
const router = express.Router();

router.post("/createShop",  registerShop);

router.post("/activation", activation);

router.post("/loginShop", loginShop);

router.get("/getSeller", loadSeller);

router.get("/logout", logoutShop);

router.get("/getShopInfo/:id", getShopInfo);

router.put("/updateShopAvatar", upload.single("image"), updateShopAvatar);

router.put("/updateSellerInfo", updateSellerInfo);

router.put("/updatePaymentMethods", updatePayment);

router.put("/deleteWithdrawMethod", deleteWithdraw);

module.exports = router;

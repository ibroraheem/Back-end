const express = require("express");
const {
  registerEvent,
  getEvents,
  deleteEvents,
  getAllEvents,
} = require("../controller/eventController");
const router = express.Router();
const { isSeller } = require("../middleware/auth");

router.post("/createEvent", registerEvent);

router.get("/getAllEvents", getEvents);

router.delete("/deleteEvents", isSeller, deleteEvents);

router.get("/getEvents", getAllEvents);

module.exports = router;

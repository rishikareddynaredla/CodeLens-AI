const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  clearSession,
} = require("../controllers/settingsController");

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/clear", clearSession);

module.exports = router;
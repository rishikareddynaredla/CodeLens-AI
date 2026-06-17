const express = require("express");
const router = express.Router();

const {
  getRepository,
  analyzeRepository,
} = require("../controllers/repoController");

// Existing route
router.get("/:owner/:repo", getRepository);

// New analyze route
router.post("/analyze", analyzeRepository);

module.exports = router;
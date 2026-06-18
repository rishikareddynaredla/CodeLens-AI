const express = require("express");
const router = express.Router();

const {
  getRepository,
  analyzeRepository,
  askRepository,
} = require("../controllers/repoController");

// Existing route
router.get("/:owner/:repo", getRepository);

// New analyze route
router.post("/analyze", analyzeRepository);

router.post("/ask", askRepository);

module.exports = router;
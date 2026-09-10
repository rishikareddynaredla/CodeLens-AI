const express = require("express");
const router = express.Router();

const {
  getRepository,
  analyzeRepository,
  askRepository,
  getFileContentByPath,
} = require("../controllers/repoController");

// Existing routes
router.get("/:owner/:repo", getRepository);
router.get("/:owner/:repo/file/{*filePath}", getFileContentByPath);

router.post("/analyze", analyzeRepository);
router.post("/ask", askRepository);

module.exports = router;
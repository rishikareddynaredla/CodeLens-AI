const express = require("express");
const router = express.Router();

const {
  getRepository,
} = require("../controllers/repoController");

router.get("/:owner/:repo", getRepository);

module.exports = router;
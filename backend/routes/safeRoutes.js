const express = require('express');
const { checkUrlSafety } = require('../services/safeBrowsing.js');
const { checkPasswordBreached } = require("../utils/hbpUtil.jsx");
const router = express.Router();

//POST /api/safe/check
router.post('/check', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const result = await checkUrlSafety(url);
  res.json(result);
});

router.post("/checkpassword", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const result = await checkPasswordBreached(password);
    res.json(result);
  } catch (error) {
    console.error("HIBP check failed:", error);
    res.status(500).json({ error: "Failed to check password breach" });
  }
});


module.exports = router;

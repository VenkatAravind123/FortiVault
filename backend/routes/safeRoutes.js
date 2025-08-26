const express = require('express');
const { checkUrlSafety } = require('../services/safeBrowsing.js');
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

module.exports = router;

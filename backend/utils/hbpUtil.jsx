// backend/utils/hibpUtil.js
const crypto = require("crypto");
const fetch = require("node-fetch");

async function checkPasswordBreached(password) {
  // 1. Hash the password using SHA-1
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();

  const prefix = sha1.substring(0, 5);
  const suffix = sha1.substring(5);

  // 2. Query the HIBP API with prefix
  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status}`);
  }

  const body = await response.text();

  // 3. Check if suffix exists in returned list
  const lines = body.split("\n");
  for (const line of lines) {
    const [hashSuffix, count] = line.split(":");
    if (hashSuffix === suffix) {
      return { breached: true, count: parseInt(count, 10) };
    }
  }

  return { breached: false, count: 0 };
}

module.exports = { checkPasswordBreached };

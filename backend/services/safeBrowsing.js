const axios = require("axios");

const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
//console.log("Loaded Safe Browsing API key:", API_KEY);
const SAFE_BROWSING_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

async function checkUrlSafety(url) {
  try {
    const requestBody = {
      client: {
        clientId: "fortivault-app",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    };

    const response = await axios.post(SAFE_BROWSING_URL, requestBody, {
      headers: { "Content-Type": "application/json" }
    });

    if (response.data && response.data.matches) {
      return { safe: false, threats: response.data.matches };
    }
    return { safe: true, threats: [] };

  } catch (error) {
    console.error("Safe Browsing check failed:", error.response?.data || error.message);
    console.log("Using Safe Browsing API key:", API_KEY);
    return { safe: true, error: "Check failed, assuming safe." };
  }
}

module.exports = { checkUrlSafety };

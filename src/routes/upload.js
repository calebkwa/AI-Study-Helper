const express = require("express");

const router = express.Router();

/*
POST /api/upload
Accepts text content from uploaded .txt file
Returns parsed text back to frontend
*/

router.post("/", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "No text content provided"
      });
    }

    return res.json({
      message: "File parsed successfully",
      parsedText: text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "File parsing failed"
    });
  }
});

module.exports = router;
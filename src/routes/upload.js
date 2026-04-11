const express = require('express');
const { validateUploadBody } = require('../services/parseTextFile');

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const result = validateUploadBody(req.body);

    if (!result.ok) {
      return res.status(400).json({
        error: result.error,
      });
    }

    return res.json({
      message: 'File parsed successfully',
      parsedText: result.text,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'File parsing failed',
    });
  }
});

module.exports = router;

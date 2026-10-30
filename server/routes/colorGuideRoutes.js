
const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/color-guide", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../html/color-guide.html")
  );
});

module.exports = router;

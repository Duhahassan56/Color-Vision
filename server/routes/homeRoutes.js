const express = require("express");
const path = require("path");
//read the colors from json file 
const namedColors = require("../data/colors.json");


const router = express.Router();

// Convert HEX color to RGB
function hexToRgb(hex) {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}


// Display home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "html", "index.html"));
});

// Find the closest color name
router.post("/api/color-name", (req, res) => {
    const { r, g, b } = req.body || {};

    // Validate RGB values
    const validRgb = [r, g, b].every(value =>
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 255
    );

    if (!validRgb) {
        return res.status(400).json({
            success: false,
            message: "Invalid RGB values."
        });
    }

    let closestColor = null;
    let smallestDistance = Infinity;

    // Compare the selected color with saved colors
    for (const color of namedColors) {
        const rgb = hexToRgb(color.hex);

        const distance =
            (r - rgb.r) ** 2 +
            (g - rgb.g) ** 2 +
            (b - rgb.b) ** 2;

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = color;
        }
    }

    // Return the closest color
    res.status(200).json({
        success: true,
        name: closestColor.name,
        hex: closestColor.hex
    });
});


module.exports = router;

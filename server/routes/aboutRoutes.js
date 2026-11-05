const express = require("express");
const path = require("path");
const fs = require("fs");
const feedbackFile = path.join(__dirname, "..", "data", "feedback.json");

const router = express.Router();

// Display About page
router.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "html", "about.html"));
});

// Receive and validate feedback
router.post("/api/feedback", (req, res) => {
    const { name, email, type, message } = req.body || {};

    // Check if all fields are filled
    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        typeof type !== "string" || !type.trim() ||
        typeof message !== "string" || !message.trim()
    ) {
        return res.status(400).json({
            success: false,
            title: "Oops! Something's missing",
            message: "Looks like you missed a spot! Fill in all the fields and let's try that again"
        });
    }

    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
        return res.status(400).json({
            success: false,
            title: "That email looks a little off!",
            message: "Double-check your email address and give it another try"
        });
    }
    
    // Check input lengths
    if (
       name.length > 100 ||
       email.length > 254 ||
       message.length > 2000
    ) {
    return res.status(400).json({
        success: false,
        title: "A Little Too Much!",
        message: "Your message is a bit too long! Shorten it up and try again."
    });
    }
    
    // Check feedback type
    const allowedTypes = ["Suggestion", "Problem", "General Feedback"];

    if (!allowedTypes.includes(type.trim())) {
    return res.status(400).json({
        success: false,
        title: "Oops! Pick a Type!",
        message: "That feedback type doesn't look right. Pick one from the list and try again!"
    });
    }
  
    // Save feedback to JSON file
    try {
    const feedbackList = JSON.parse(
        fs.readFileSync(feedbackFile, "utf8")
    );

    feedbackList.push({
        name: name.trim(),
        email: email.trim(),
        type: type.trim(),
        message: message.trim(),
        date: new Date().toISOString()
    });

    fs.writeFileSync(
        feedbackFile,
        JSON.stringify(feedbackList, null, 2)
    );
    // success message
    res.status(200).json({
        success: true,
        title: "And... It's Sent!",
        message: "Thanks for your feedback. We'll get back to you soon!"
    });
    // error mesage
    } catch (error) {
      console.error("Error saving feedback:", error);

      res.status(500).json({
        success: false,
        title: "Oops! Something went wrong",
        message: "We couldn't save your message. Please try again!"
      });
    }

});

module.exports = router;

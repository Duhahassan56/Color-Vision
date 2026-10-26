const express = require("express");
const path = require("path");

// routes call
const homeRoutes = require("./routes/homeRoutes");
const aboutRoutes = require("./routes/aboutRoutes");


const app = express();
const PORT = 3000;

// read the form
app.use(express.json());

// Serve only public files
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));
app.use("/contact", express.static(path.join(__dirname, "..", "contact")));



// connect page routes
app.use("/", homeRoutes);
app.use("/", aboutRoutes);


// start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

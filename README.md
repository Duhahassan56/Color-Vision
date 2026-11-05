# Color Vision

Color Vision is a web application designed to help users discover, explore, and work with colors through interactive tools and a simple, user-friendly interface.

## Features

- **Home:** Upload an image, select colors, view their HEX and RGB values, and discover color names.
- **Palette Generator:** Generate color palettes and explore color combinations.
- **Contrast Checker:** Compare two colors and check their contrast ratio and readability.
- **Color Guide:** Browse, search, filter, and sort a collection of colors.
- **About:** Learn about Color Vision and submit feedback.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js

## Project Structure

```text
Color-Vision/
├── contact/          # Images and icons
├── css/              # Stylesheets
├── html/             # Website pages
├── js/               # Frontend JavaScript
├── server/           # Backend routes and logic
├── index.html        # GitHub Pages entry point
├── package.json
├── package-lock.json
└── README.md
```

## How to Run

**1. Download the project**

Download the repository as a ZIP file and extract it, or clone the repository using Git.

**2. Open the project**

Open the project folder in Visual Studio Code.

**3. Install dependencies**

Open a terminal in the project's root folder and run:

```bash
npm install
```

**4. Start the server**

```bash
npm start
```

**5. Open the website**

Visit:

http://localhost:3000

The application requires the Node.js server to run for its server-side features to work correctly.

## Frontend & Backend Integration

The frontend communicates with the Node.js and Express backend through HTTP requests.

The server receives and validates requests, processes the required operations, and sends responses back to the browser.

## Testing

The application was tested using functional test cases covering image uploading, color selection, palette generation, contrast checking, color searching, filtering, sorting, and feedback validation.

A separate Stage 5 testing report documents the test cases, results, and screenshot evidence.

## Project Information

**Course:** Server-Side 2

**Project:** Color Vision

**Type:** Semester Web Application Project

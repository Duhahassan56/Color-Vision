
# Color Vision 🎨

Color Vision is a web application that helps users explore, identify, and work with colors.

## Technologies
- HTML
- CSS
- JavaScript
- Node.js
- Express

## How to Run

1. Download or clone the project.
2. Open the project folder in VS Code.
3. Open the terminal and install dependencies:

   npm install

4. Start the server:

   npm start

5. Open the website at:

   http://localhost:3000

## Stage 4 – Server-Side Development

### Home
- Identifies colors from uploaded images.
- Sends RGB values to the server.
- Finds the closest name from 100 predefined colors.
- Validates RGB values on the server.
- Saves the last three selected colors locally.

### About
- Accepts user feedback.
- Validates feedback on the server.
- Saves feedback to a JSON file.
- Displays success and error messages.

## Server Structure

- server/server.js – Main Express server
- server/routes/homeRoutes.js – Home routes and color recognition
- server/routes/aboutRoutes.js – About routes and feedback handling
- server/data/colors.json – Color reference list
- server/data/feedback.json – Feedback storage

## Notes

- Node.js is required to run the server.
- GitHub Pages does not support the Express backend.
- Color Tools and Color Guide server integration will be completed when the team pages are added.

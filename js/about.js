
// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('nav-links');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

// Form and popup references
const feedbackForm = document.getElementById('feedback-form');
const dialogBackdrop = document.getElementById('feedback-dialog');
const dialogBox = dialogBackdrop.querySelector('.feedback-dialog');
const dialogIcon = document.getElementById('dialog-icon');
const dialogTitle = document.getElementById('dialog-title');
const dialogDescription = document.getElementById('dialog-description');
const dialogClose = document.getElementById('dialog-close');
let previousFocus = null;

// Display popup message
function showFeedbackDialog(success, message, title) {
  previousFocus = document.activeElement;

  // Change icon
  dialogIcon.src = success
    ? '/contact/icons/patch-check.png'
    : '/contact/icons/patch-exclamation.png';


  // Change title
  dialogTitle.textContent = title ||
    (success ? "And... It's Sent!" : 'Something went wrong');

  // Change message
  dialogDescription.textContent = message;

  // Change button text
  dialogClose.textContent = success ? 'Got it' : 'Try again';

  // Show popup
  dialogBackdrop.hidden = false;
  dialogBox.focus();
}


// Closing from the button or Escape key
function hideFeedbackDialog() {
  dialogBackdrop.hidden = true;
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
}
dialogClose.addEventListener('click', hideFeedbackDialog);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialogBackdrop.hidden) hideFeedbackDialog();
  if (event.key === 'Tab' && !dialogBackdrop.hidden) {
    event.preventDefault();
    dialogClose.focus();
  }
});


 // Send feedback to the server
feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('feedback-name').value.trim();
  const email = document.getElementById('feedback-email').value.trim();
  const type = document.getElementById('feedback-type').value;
  const message = document.getElementById('feedback-message').value.trim();

  try {
    // Send feedback data to Express
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, type, message })
    });

    // Read the server response
    const result = await response.json();

    // Show the popup with the server message
    showFeedbackDialog(result.success, result.message, result.title);

    // Clear the form only if feedback was saved
    if (response.ok && result.success) {
      feedbackForm.reset();
    }

  } catch (error) {
    // Handle connection errors
    showFeedbackDialog(
      false,
      "We couldn't send your message. Please try again!",
      "Oops! Connection lost"
    );
  }
});

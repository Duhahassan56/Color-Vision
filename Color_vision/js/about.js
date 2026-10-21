
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

// Display success or error
function showFeedbackDialog(success, message) {
  previousFocus = document.activeElement;
  // change icon
  dialogIcon.src = success ? '../contact/icons/patch-check.png' : '../contact/icons/patch-exclamation.png';
  // change title
  dialogTitle.textContent = success ? 'Message Sent!' : 'Something went wrong';
  // change contact popup
  dialogDescription.textContent = message;
  dialogClose.textContent = success ? 'Got it' : 'Try again';
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

// validate input and store locally
feedbackForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('feedback-name').value.trim();
  const emailInput = document.getElementById('feedback-email');
  const email = emailInput.value.trim();
  const type = document.getElementById('feedback-type').value;
  const message = document.getElementById('feedback-message').value.trim();
// check data
  if (!name || !email || !emailInput.checkValidity() || !type || !message) {
    showFeedbackDialog(false, 'Please fill in all fields and enter a valid email address, then try again.');
    return;
  }

  try {
    // One locally stored feedback draft
    localStorage.setItem('colorVisionFeedbackDraft', JSON.stringify({name, email, type, message, savedAt: new Date().toISOString()}));
    feedbackForm.reset();
    showFeedbackDialog(true, "Thanks for your feedback. We'll get back to you soon!");
  } catch (error) {
    showFeedbackDialog(false, 'We could not save your feedback in this browser. Please try again.');
  }
});

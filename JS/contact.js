/**
 * ShopZone - Contact Page DOM JavaScript (contact.js)
 * Implements:
 * 1. Real-time DOM Form Validation on input and blur events (classList, error spans)
 * 2. Live Character Counter for Message Textarea (DOM input event, textContent)
 * 3. Form Submit Handling with DOM Loading State & Success Confirmation Card (e.preventDefault, DOM creation)
 * 4. Interactive Click-to-Copy for Support Email & Phone (DOM events, clipboard API, toast)
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactFormValidation();
    initClickToCopyContactInfo();
});

/**
 * 1 & 2 & 3. Handles form validation, character counter, and submission handling
 */
function initContactFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!nameInput || !emailInput || !messageInput || !submitBtn) return;

    // Helper: Create error element below an input if not exists
    function getOrCreateErrorElement(inputEl) {
        let errorEl = inputEl.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('field-error-msg')) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error-msg';
            inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
        }
        return errorEl;
    }

    const nameError = getOrCreateErrorElement(nameInput);
    const emailError = getOrCreateErrorElement(emailInput);
    const messageError = getOrCreateErrorElement(messageInput);

    // 2. Add Live Character Counter below message textarea
    const maxChars = 300;
    messageInput.setAttribute('maxlength', maxChars);

    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.id = 'charCounter';
    charCounter.textContent = `0 / ${maxChars} characters`;
    messageError.parentNode.insertBefore(charCounter, messageError.nextSibling);

    // Validation functions
    function validateName() {
        const val = nameInput.value.trim();
        if (!val) {
            nameInput.classList.remove('input-valid');
            nameInput.classList.add('input-invalid');
            nameError.textContent = '⚠️ Name is required.';
            nameError.classList.add('visible');
            return false;
        } else if (val.length < 3) {
            nameInput.classList.remove('input-valid');
            nameInput.classList.add('input-invalid');
            nameError.textContent = '⚠️ Name must be at least 3 characters long.';
            nameError.classList.add('visible');
            return false;
        } else {
            nameInput.classList.remove('input-invalid');
            nameInput.classList.add('input-valid');
            nameError.textContent = '';
            nameError.classList.remove('visible');
            return true;
        }
    }

    function validateEmail() {
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!val) {
            emailInput.classList.remove('input-valid');
            emailInput.classList.add('input-invalid');
            emailError.textContent = '⚠️ Email address is required.';
            emailError.classList.add('visible');
            return false;
        } else if (!emailRegex.test(val)) {
            emailInput.classList.remove('input-valid');
            emailInput.classList.add('input-invalid');
            emailError.textContent = '⚠️ Please enter a valid email (e.g. name@domain.com).';
            emailError.classList.add('visible');
            return false;
        } else {
            emailInput.classList.remove('input-invalid');
            emailInput.classList.add('input-valid');
            emailError.textContent = '';
            emailError.classList.remove('visible');
            return true;
        }
    }

    function validateMessage() {
        const val = messageInput.value.trim();
        if (!val) {
            messageInput.classList.remove('input-valid');
            messageInput.classList.add('input-invalid');
            messageError.textContent = '⚠️ Message is required.';
            messageError.classList.add('visible');
            return false;
        } else if (val.length < 10) {
            messageInput.classList.remove('input-valid');
            messageInput.classList.add('input-invalid');
            messageError.textContent = '⚠️ Message must be at least 10 characters.';
            messageError.classList.add('visible');
            return false;
        } else {
            messageInput.classList.remove('input-invalid');
            messageInput.classList.add('input-valid');
            messageError.textContent = '';
            messageError.classList.remove('visible');
            return true;
        }
    }

    // Input & Blur event listeners
    nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('input-invalid')) validateName();
    });
    nameInput.addEventListener('blur', validateName);

    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('input-invalid')) validateEmail();
    });
    emailInput.addEventListener('blur', validateEmail);

    messageInput.addEventListener('input', () => {
        const len = messageInput.value.length;
        charCounter.textContent = `${len} / ${maxChars} characters`;

        if (len >= maxChars) {
            charCounter.className = 'char-counter limit-reached';
        } else if (len >= maxChars - 30) {
            charCounter.className = 'char-counter warning';
        } else {
            charCounter.className = 'char-counter';
        }

        if (messageInput.classList.contains('input-invalid')) validateMessage();
    });
    messageInput.addEventListener('blur', validateMessage);

    // 3. Form Submit handling
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMsgValid = validateMessage();

        if (!isNameValid || !isEmailValid || !isMsgValid) {
            if (window.showToast) {
                window.showToast('Please fix the errors in the form before submitting.', 'error');
            }
            // Focus first invalid field
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else messageInput.focus();
            return;
        }

        // Capture data
        const submittedName = nameInput.value.trim();
        const submittedEmail = emailInput.value.trim();

        // Loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending Message...';

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            // Hide form and show DOM confirmation card
            form.style.display = 'none';

            let successCard = document.getElementById('contactSuccessCard');
            if (!successCard) {
                successCard = document.createElement('div');
                successCard.id = 'contactSuccessCard';
                successCard.className = 'form-success-card';
                form.parentNode.insertBefore(successCard, form);
            }

            successCard.innerHTML = `
                <h3>🎉 Message Sent Successfully!</h3>
                <p>Thank you, <strong>${submittedName}</strong>! We have received your query and sent a confirmation receipt to <strong>${submittedEmail}</strong>. Our support team will reply within 24 hours.</p>
                <button type="button" class="send-another-btn" id="sendAnotherBtn">Send Another Message</button>
            `;
            successCard.style.display = 'block';

            if (window.showToast) {
                window.showToast('Your message has been delivered to ShopZone support!', 'success');
            }

            // Wire reset / send another button
            const sendAnotherBtn = document.getElementById('sendAnotherBtn');
            if (sendAnotherBtn) {
                sendAnotherBtn.addEventListener('click', () => {
                    form.reset();
                    nameInput.classList.remove('input-valid', 'input-invalid');
                    emailInput.classList.remove('input-valid', 'input-invalid');
                    messageInput.classList.remove('input-valid', 'input-invalid');
                    charCounter.textContent = `0 / ${maxChars} characters`;
                    charCounter.className = 'char-counter';
                    successCard.style.display = 'none';
                    form.style.display = 'block';
                    nameInput.focus();
                });
            }
        }, 700);
    });
}

/**
 * 4. Enables one-click copy to clipboard for support email and phone
 */
function initClickToCopyContactInfo() {
    const contactInfo = document.querySelector('.contact-info');
    if (!contactInfo) return;

    const paragraphs = contactInfo.querySelectorAll('p');
    paragraphs.forEach(p => {
        const text = p.textContent;
        
        if (text.includes('support@shopzone.com')) {
            makeCopyable(p, 'support@shopzone.com', 'Email');
        } else if (text.includes('+91 98765 43210')) {
            makeCopyable(p, '+91 98765 43210', 'Phone');
        }
    });

    function makeCopyable(el, valueToCopy, label) {
        el.className = 'copyable-info';
        el.title = `Click to copy ${label}`;

        const badge = document.createElement('span');
        badge.className = 'copy-badge';
        badge.textContent = 'Click to Copy';
        el.appendChild(badge);

        el.addEventListener('click', () => {
            navigator.clipboard.writeText(valueToCopy).then(() => {
                badge.textContent = '✓ Copied!';
                badge.style.backgroundColor = '#dcfce7';
                badge.style.color = '#15803d';

                if (window.showToast) {
                    window.showToast(`${label} (${valueToCopy}) copied to clipboard!`, 'success');
                }

                setTimeout(() => {
                    badge.textContent = 'Click to Copy';
                    badge.style.backgroundColor = '#dbeafe';
                    badge.style.color = '#1e40af';
                }, 2000);
            });
        });
    }
}

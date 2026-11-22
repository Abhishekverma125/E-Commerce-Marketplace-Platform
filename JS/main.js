/**
 * ShopZone - Main Shared DOM JavaScript
 * Handles cross-page DOM features:
 * 1. Active Navigation Bar Link Highlighting
 * 2. Dynamic Footer Year Update
 * 3. Back-to-Top Floating Button (DOM creation & scroll listener)
 * 4. Global DOM Toast Notification Utility
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Navigation Highlighting
    highlightActiveNavLink();

    // 2. DOM Dynamic Footer Year
    updateFooterYear();

    // 3. DOM Scroll-To-Top Button
    initScrollToTopButton();
});

/**
 * Highlights the active link in the navigation bar using DOM selection & class manipulation
 */
function highlightActiveNavLink() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname.toLowerCase();

    navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        
        // Match current page or root default to home.html
        const isCurrentPage = currentPath.endsWith(href) || 
                              (href === 'home.html' && (currentPath.endsWith('/') || currentPath.endsWith('index.html')));

        if (isCurrentPage) {
            link.classList.add('active-nav');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active-nav');
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Updates copyright year in the footer dynamically using DOM textContent
 */
function updateFooterYear() {
    const footerBottom = document.querySelector('.footer-bottom p');
    if (footerBottom) {
        const currentYear = new Date().getFullYear();
        footerBottom.textContent = `© ${currentYear} ShopZone. All Rights Reserved.`;
    }
}

/**
 * Dynamically creates a scroll-to-top button element in the DOM and binds scroll events
 */
function initScrollToTopButton() {
    let scrollBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollTopBtn';
        scrollBtn.title = 'Back to top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Scroll back to top');
        document.body.appendChild(scrollBtn);
    }

    // Scroll event listener for toggling visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 250) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    // Click event listener to scroll smoothly to top
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Global Toast Notification Generator using pure DOM element creation
 * @param {string} message - Message to display
 * @param {'success'|'error'|'info'} type - Type of toast
 */
window.showToast = function(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 3500);
};

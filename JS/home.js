/**
 * ShopZone - Home Page DOM JavaScript (home.js)
 * Implements:
 * 1. Dynamic Promo Discount Banner & Copy Code Action (DOM creation, events, textContent)
 * 2. Interactive Category Spotlight Panel (DOM selection, classList, dynamic innerHTML)
 * 3. Hero Image Interactive Hover Zoom (DOM style manipulation & event listeners)
 * 4. Newsletter Subscription Form with Real-time DOM Validation (event handling, preventDefault)
 */

document.addEventListener('DOMContentLoaded', () => {
    initPromoBanner();
    initCategorySpotlight();
    initHeroImageEffects();
    initNewsletterSubscription();
});

/**
 * 1. Creates and inserts a promotional banner into the DOM with a one-click copy button
 */
function initPromoBanner() {
    const heroText = document.querySelector('.hero-text');
    if (!heroText) return;

    // Create promo container element via DOM
    const promoBanner = document.createElement('div');
    promoBanner.className = 'promo-banner';

    const promoCode = 'SHOPZONE20';

    promoBanner.innerHTML = `
        <p>🎉 <strong>FLASHSALE</strong> Use code <strong>${promoCode}</strong> for 20% off!</p>
        <button type="button" class="copy-code-btn" id="copyCodeBtn">Copy Code</button>
    `;

    // Insert banner before the first heading inside hero-text
    heroText.insertBefore(promoBanner, heroText.firstChild);

    // Event listener on copy button
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(promoCode).then(() => {
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.backgroundColor = '#10b981';
                copyBtn.style.color = '#ffffff';

                if (window.showToast) {
                    window.showToast(`Coupon code "${promoCode}" copied to clipboard!`, 'success');
                }

                // Reset button text after 2.5 seconds
                setTimeout(() => {
                    copyBtn.textContent = 'Copy Code';
                    copyBtn.style.backgroundColor = '#ffffff';
                    copyBtn.style.color = '#1456b8';
                }, 2500);
            }).catch(() => {
                if (window.showToast) {
                    window.showToast('Please copy manually: ' + promoCode, 'info');
                }
            });
        });
    }
}

/**
 * 2. Handles interactive category card clicks and dynamically renders a spotlight drawer
 */
function initCategorySpotlight() {
    const categoryCards = document.querySelectorAll('.category-container .category');
    const container = document.querySelector('.category-container');
    if (!categoryCards.length || !container) return;

    // Detailed metadata for dynamic rendering
    const categoryDetails = {
        'Electronics': {
            description: 'Laptops, smartphones, smart accessories, and high-performance audio equipment.',
            items: '120+ Products'
        },
        'Fashion': {
            description: 'Trendy clothing, stylish footwear, watches, and seasonal apparel for everyone.',
            items: '350+ Products'
        },
        'Home': {
            description: 'Furniture, elegant kitchenware, smart home devices, and decorative accents.',
            items: '95+ Products'
        },
        'Beauty': {
            description: 'Skincare essentials, cosmetics, haircare, and personal grooming fragrances.',
            items: '180+ Products'
        },
        'Sports': {
            description: 'Workout gear, athletic shoes, outdoor adventure equipment, and fitness accessories.',
            items: '75+ Products'
        }
    };

    // Ensure or create spotlight container
    let spotlight = document.getElementById('categorySpotlight');
    if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.id = 'categorySpotlight';
        spotlight.className = 'category-spotlight';
        spotlight.style.display = 'none';
        container.parentNode.insertBefore(spotlight, container.nextSibling);
    }

    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            const titleEl = card.querySelector('h3');
            const iconEl = card.querySelector('.category-icon');
            if (!titleEl) return;

            const categoryName = titleEl.textContent.trim();
            const icon = iconEl ? iconEl.textContent.trim() : '📦';

            // Check if already active
            const isAlreadyActive = card.classList.contains('selected-category');

            // Deselect all cards
            categoryCards.forEach(c => c.classList.remove('selected-category'));

            if (isAlreadyActive) {
                // Toggle off
                spotlight.style.display = 'none';
            } else {
                // Select clicked card
                card.classList.add('selected-category');

                const data = categoryDetails[categoryName] || {
                    description: 'Explore our wide selection in this top-rated category.',
                    items: '50+ Products'
                };

                // Populate DOM content
                spotlight.innerHTML = `
                    <div class="spotlight-info">
                        <h4>${icon} ${categoryName} Collection (${data.items})</h4>
                        <p>${data.description}</p>
                    </div>
                    <div>
                        <a href="categories.html" class="spotlight-link">Explore ${categoryName} &rarr;</a>
                    </div>
                `;
                spotlight.style.display = 'flex';

                if (window.showToast) {
                    window.showToast(`Selected "${categoryName}" category`, 'info');
                }
            }
        });
    });
}

/**
 * 3. Hero image mouseover effects using DOM style manipulation
 */
function initHeroImageEffects() {
    const heroImg = document.querySelector('.hero-image img');
    if (!heroImg) return;

    heroImg.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';

    heroImg.addEventListener('mouseenter', () => {
        heroImg.style.transform = 'scale(1.02)';
        heroImg.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.15)';
    });

    heroImg.addEventListener('mouseleave', () => {
        heroImg.style.transform = 'scale(1)';
        heroImg.style.boxShadow = 'none';
    });
}

/**
 * 4. Appends a newsletter subscription form to the DOM and performs validation on submit
 */
function initNewsletterSubscription() {
    const main = document.querySelector('main');
    if (!main) return;

    // Create newsletter section via DOM
    const newsletterSection = document.createElement('section');
    newsletterSection.className = 'newsletter-section';
    newsletterSection.innerHTML = `
        <h3>Stay Updated with ShopZone Deals! 💌</h3>
        <p>Subscribe to our newsletter and receive a 15% discount on your first checkout.</p>
        <form class="newsletter-form" id="newsletterForm" novalidate>
            <input type="email" id="newsletterEmail" placeholder="Enter your email address..." required>
            <button type="submit">Subscribe</button>
        </form>
        <div id="newsletterMsg" style="display: none; margin-top: 15px; font-weight: 500;"></div>
    `;

    main.appendChild(newsletterSection);

    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('newsletterEmail');
    const msgDiv = document.getElementById('newsletterMsg');

    if (!form || !emailInput || !msgDiv) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailValue = emailInput.value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailValue) {
            msgDiv.textContent = '⚠️ Please enter your email address.';
            msgDiv.style.color = '#ef4444';
            msgDiv.style.display = 'block';
            emailInput.focus();
            return;
        }

        if (!emailRegex.test(emailValue)) {
            msgDiv.textContent = '⚠️ Please enter a valid email address (e.g. name@example.com).';
            msgDiv.style.color = '#ef4444';
            msgDiv.style.display = 'block';
            emailInput.focus();
            return;
        }

        // Success state in DOM
        form.style.display = 'none';
        msgDiv.innerHTML = `✅ Thank you for subscribing! We've sent a 15% discount code to <strong>${emailValue}</strong>.`;
        msgDiv.style.color = '#10b981';
        msgDiv.style.display = 'block';

        if (window.showToast) {
            window.showToast('Subscribed to ShopZone newsletter successfully!', 'success');
        }
    });
}

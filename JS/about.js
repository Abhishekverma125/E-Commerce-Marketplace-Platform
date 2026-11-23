/**
 * ShopZone - About Us Page DOM JavaScript (about.js)
 * Implements:
 * 1. Animated Milestone Statistics Counters (setInterval & DOM textContent updates)
 * 2. Interactive Mission/Vision/Team Tab Switcher (DOM event listeners, classList toggle)
 * 3. Helpful Feedback Voting Widget (DOM element creation, state update)
 * 4. Interactive Cart Icon Emoji Cycler (DOM event handling & textContent rotation)
 */

document.addEventListener('DOMContentLoaded', () => {
    initStatsCounters();
    initAboutTabs();
    initFeedbackWidget();
    initCartIconEasterEgg();
});

/**
 * 1. Creates and animates milestone statistics in the DOM
 */
function initStatsCounters() {
    const page = document.querySelector('.page');
    if (!page) return;

    // Create stats section via DOM
    const statsSection = document.createElement('section');
    statsSection.className = 'stats-section';
    statsSection.innerHTML = `
        <h2>Our Impact in Numbers</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" data-target="15000" data-suffix="+">0</div>
                <div class="stat-label">Happy Shoppers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="2500" data-suffix="+">0</div>
                <div class="stat-label">Quality Products</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="450" data-suffix="+">0</div>
                <div class="stat-label">Verified Sellers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="99" data-suffix="%">0</div>
                <div class="stat-label">Satisfaction Rate</div>
            </div>
        </div>
    `;

    page.appendChild(statsSection);

    // Animate each counter
    const counterElements = statsSection.querySelectorAll('.stat-number');

    counterElements.forEach(counter => {
        const target = parseInt(counter.dataset.target, 10);
        const suffix = counter.dataset.suffix || '';
        const duration = 1200; // ms
        const steps = 40;
        const stepValue = Math.ceil(target / steps);
        let current = 0;

        const interval = setInterval(() => {
            current += stepValue;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            counter.textContent = current.toLocaleString() + suffix;
        }, duration / steps);
    });
}

/**
 * 2. Injects and handles interactive Mission / Vision / Values tabs
 */
function initAboutTabs() {
    const page = document.querySelector('.page');
    if (!page) return;

    const tabsSection = document.createElement('section');
    tabsSection.className = 'tabs-section';
    tabsSection.innerHTML = `
        <div class="tab-headers">
            <button type="button" class="tab-btn active" data-tab="mission">🎯 Our Mission</button>
            <button type="button" class="tab-btn" data-tab="vision">🌟 Our Vision</button>
            <button type="button" class="tab-btn" data-tab="values">💎 Core Values</button>
            <button type="button" class="tab-btn" data-tab="promise">🤝 Customer Promise</button>
        </div>

        <div class="tab-pane active" id="pane-mission">
            <h3>Empowering Seamless Online Shopping</h3>
            <p>Our mission is to simplify e-commerce by connecting verified sellers with everyday customers, offering dependable quality, competitive pricing, and fast nationwide delivery.</p>
        </div>

        <div class="tab-pane" id="pane-vision">
            <h3>Becoming Your Everyday Marketplace</h3>
            <p>We envision a platform where finding whatever you need—from household essentials to cutting-edge electronics—is effortless, transparent, and enjoyable.</p>
        </div>

        <div class="tab-pane" id="pane-values">
            <h3>What Guides Us Every Day</h3>
            <p><strong>Customer First:</strong> Every decision starts and ends with customer satisfaction.</p>
            <p><strong>Integrity & Quality:</strong> Verified product listings with zero compromises on genuineness.</p>
            <p><strong>Reliability:</strong> Fast turnaround times, transparent order tracking, and clear support.</p>
        </div>

        <div class="tab-pane" id="pane-promise">
            <h3>Our 100% Commitment</h3>
            <p>We guarantee 7-day hassle-free replacements, secure payment gateways, and round-the-clock customer assistance to resolve any issue without delay.</p>
        </div>
    `;

    page.appendChild(tabsSection);

    // Event listeners on tabs
    const buttons = tabsSection.querySelectorAll('.tab-btn');
    const panes = tabsSection.querySelectorAll('.tab-pane');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = `pane-${btn.dataset.tab}`;

            // Remove active class from all buttons and panes
            buttons.forEach(b => b.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));

            // Activate clicked
            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/**
 * 3. Interactive feedback widget allowing users to vote on page helpfulness
 */
function initFeedbackWidget() {
    const page = document.querySelector('.page');
    if (!page) return;

    let likes = 34;
    let voted = false;

    const feedbackBox = document.createElement('div');
    feedbackBox.className = 'feedback-box';
    feedbackBox.innerHTML = `
        <p>Did you find this information helpful?</p>
        <div class="feedback-buttons">
            <button type="button" class="feedback-btn" id="btnHelpful">👍 Yes (<span id="likeCount">${likes}</span>)</button>
            <button type="button" class="feedback-btn" id="btnFeedback">💬 Give Feedback</button>
        </div>
        <div id="feedbackResponse" style="margin-top: 10px; font-size: 13px; color: #15803d; display: none;"></div>
    `;

    page.appendChild(feedbackBox);

    const btnHelpful = document.getElementById('btnHelpful');
    const btnFeedback = document.getElementById('btnFeedback');
    const likeCountSpan = document.getElementById('likeCount');
    const responseDiv = document.getElementById('feedbackResponse');

    btnHelpful.addEventListener('click', () => {
        if (!voted) {
            likes++;
            likeCountSpan.textContent = likes;
            voted = true;
            btnHelpful.style.backgroundColor = '#dcfce7';
            btnHelpful.style.borderColor = '#86efac';
            responseDiv.textContent = '🎉 Thank you for your positive feedback!';
            responseDiv.style.display = 'block';

            if (window.showToast) {
                window.showToast('Thanks for your feedback!', 'success');
            }
        } else {
            if (window.showToast) {
                window.showToast('You have already submitted feedback!', 'info');
            }
        }
    });

    btnFeedback.addEventListener('click', () => {
        window.location.href = 'contact.html';
    });
}

/**
 * 4. Interactive easter egg on the big cart emoji
 */
function initCartIconEasterEgg() {
    const aboutImage = document.querySelector('.about-image');
    if (!aboutImage) return;

    const emojis = ['🛒', '🛍️', '🎁', '📦', '✨', '🚀'];
    let index = 0;

    aboutImage.title = 'Click me for a surprise!';

    aboutImage.addEventListener('click', () => {
        index = (index + 1) % emojis.length;
        aboutImage.textContent = emojis[index];

        if (window.showToast) {
            window.showToast(`Shopping mode: ${emojis[index]} ShopZone ready!`, 'info');
        }
    });
}

/**
 * ShopZone - Categories Page DOM JavaScript (categories.js)
 * Implements:
 * 1. Live Category Search with dynamic DOM filtering (input event, style manipulation)
 * 2. Filter Pills by Category Group (DOM dataset, classList manipulation)
 * 3. Interactive Category Card Click & Dynamic Drawer (DOM element creation, innerHTML)
 * 4. Empty State Handling (DOM creation when no search matches found)
 */

document.addEventListener('DOMContentLoaded', () => {
    initCategoryControls();
    initCategoryCardInteractions();
});

// Category metadata map
const CATEGORY_DATA = {
    'Electronics': {
        group: 'tech',
        desc: 'Cutting-edge gadgets, laptops, smartphones, home audio systems, and computer accessories.',
        tags: ['Laptops', 'Smartphones', 'Audio', 'Monitors', 'Smartwatches'],
        badge: '120+ Items'
    },
    'Fashion': {
        group: 'lifestyle',
        desc: 'Contemporary apparel, footwear, seasonal outerwear, and stylish fashion accessories for all.',
        tags: ['Men', 'Women', 'Footwear', 'Watches', 'Accessories'],
        badge: '350+ Items'
    },
    'Home & Living': {
        group: 'home',
        desc: 'Comfortable furniture, modern kitchenware, decorative lighting, and home organizers.',
        tags: ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Lighting'],
        badge: '95+ Items'
    },
    'Beauty': {
        group: 'lifestyle',
        desc: 'Premium skincare, makeup essentials, organic beauty products, and everyday personal care.',
        tags: ['Skincare', 'Makeup', 'Haircare', 'Perfumes', 'Organic'],
        badge: '180+ Items'
    },
    'Sports': {
        group: 'leisure',
        desc: 'Performance athletic gear, exercise equipment, running shoes, and outdoor camping tools.',
        tags: ['Fitness', 'Running', 'Gym Gear', 'Outdoor', 'Yoga'],
        badge: '75+ Items'
    },
    'Books': {
        group: 'leisure',
        desc: 'Bestselling novels, educational textbooks, self-improvement, biographies, and comics.',
        tags: ['Fiction', 'Non-Fiction', 'Academic', 'Comics', 'Business'],
        badge: '500+ Items'
    },
    'Toys': {
        group: 'leisure',
        desc: 'Safe and fun toys, educational games, puzzles, action figures, and creative craft sets.',
        tags: ['Puzzles', 'Educational', 'Action Figures', 'Board Games', 'Baby Toys'],
        badge: '140+ Items'
    },
    'Automotive': {
        group: 'other',
        desc: 'Car cleaning kits, replacement accessories, mobile car mounts, dashcams, and maintenance tools.',
        tags: ['Car Care', 'Accessories', 'Dashcams', 'Tools', 'Oils & Fluids'],
        badge: '60+ Items'
    }
};

/**
 * 1. Injects live search bar and filter pills into the DOM above the category grid
 */
function initCategoryControls() {
    const page = document.querySelector('.page');
    const grid = document.querySelector('.category-grid');
    if (!page || !grid) return;

    // Assign data attributes & badges to existing category cards via DOM
    const cards = grid.querySelectorAll('.category-card');
    cards.forEach(card => {
        const titleEl = card.querySelector('h3');
        if (!titleEl) return;
        const name = titleEl.textContent.trim();
        const info = CATEGORY_DATA[name];

        if (info) {
            card.dataset.category = name;
            card.dataset.group = info.group;

            // Add item count badge if not already added
            if (!card.querySelector('.category-card-badge')) {
                const badge = document.createElement('span');
                badge.className = 'category-card-badge';
                badge.textContent = info.badge;
                card.appendChild(badge);
            }
        }
    });

    // Create category control toolbar in DOM
    const controls = document.createElement('div');
    controls.className = 'category-controls';
    controls.innerHTML = `
        <div class="search-bar-wrapper">
            <input type="text" id="categorySearch" class="category-search-input" placeholder="🔍 Search categories by name or keyword...">
            <button type="button" id="searchClearBtn" class="search-clear-btn" title="Clear search">&times;</button>
        </div>

        <div class="filter-pills">
            <span>Filter:</span>
            <button type="button" class="filter-pill active" data-filter="all">All Categories</button>
            <button type="button" class="filter-pill" data-filter="tech">💻 Tech</button>
            <button type="button" class="filter-pill" data-filter="lifestyle">👕 Fashion & Beauty</button>
            <button type="button" class="filter-pill" data-filter="home">🛋️ Home</button>
            <button type="button" class="filter-pill" data-filter="leisure">⚽ Sports & Leisure</button>
        </div>

        <div id="categoryStats" style="font-size: 14px; color: #64748b; font-weight: 500;">
            Showing all 8 categories
        </div>
    `;

    // Insert controls before grid
    page.insertBefore(controls, grid);

    // Event listeners for search input
    const searchInput = document.getElementById('categorySearch');
    const clearBtn = document.getElementById('searchClearBtn');
    const pills = controls.querySelectorAll('.filter-pill');

    let currentFilter = 'all';

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        // Show/hide clear button
        clearBtn.style.display = query ? 'block' : 'none';

        cards.forEach(card => {
            const name = (card.dataset.category || '').toLowerCase();
            const group = card.dataset.group || '';

            const matchesSearch = name.includes(query);
            const matchesPill = (currentFilter === 'all') || (group === currentFilter);

            if (matchesSearch && matchesPill) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update stats counter
        const statsEl = document.getElementById('categoryStats');
        if (statsEl) {
            statsEl.textContent = `Showing ${visibleCount} of ${cards.length} categories`;
        }

        // Handle empty state in DOM
        handleEmptyState(visibleCount, query);
    }

    searchInput.addEventListener('input', applyFilters);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        applyFilters();
    });

    // Event listeners for filter pills
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            applyFilters();
        });
    });
}

/**
 * Handles DOM creation of empty state if no categories match search
 */
function handleEmptyState(visibleCount, query) {
    const grid = document.querySelector('.category-grid');
    const page = document.querySelector('.page');
    let noResults = document.getElementById('noCategoryResults');

    if (visibleCount === 0) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noCategoryResults';
            noResults.className = 'no-results-box';
            grid.parentNode.insertBefore(noResults, grid.nextSibling);
        }

        noResults.innerHTML = `
            <h3>🔍 No Categories Found</h3>
            <p>We couldn't find any categories matching "${query}". Try searching for another term.</p>
            <button type="button" class="reset-search-btn" id="resetCategorySearch">Reset Search</button>
        `;
        noResults.style.display = 'block';

        const resetBtn = document.getElementById('resetCategorySearch');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('categorySearch');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            });
        }
    } else if (noResults) {
        noResults.style.display = 'none';
    }
}

/**
 * 2. Handles clicking on category cards to display a detailed preview drawer via DOM
 */
function initCategoryCardInteractions() {
    const grid = document.querySelector('.category-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll('.category-card');

    // Create drawer element container in DOM
    let drawer = document.getElementById('categoryDrawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'categoryDrawer';
        drawer.className = 'category-details-drawer';
        drawer.style.display = 'none';
        grid.parentNode.insertBefore(drawer, grid.nextSibling);
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const titleEl = card.querySelector('h3');
            const iconEl = card.querySelector('div');
            if (!titleEl) return;

            const name = titleEl.textContent.trim();
            const icon = iconEl ? iconEl.textContent.trim() : '🏷️';
            const info = CATEGORY_DATA[name] || {
                desc: 'Explore quality products in this category.',
                tags: ['Popular', 'Quality', 'Discounted'],
                badge: 'Active'
            };

            const isAlreadyActive = card.classList.contains('active-card');

            // Reset active state on all cards
            cards.forEach(c => c.classList.remove('active-card'));

            if (isAlreadyActive) {
                drawer.style.display = 'none';
            } else {
                card.classList.add('active-card');

                const tagsHtml = info.tags.map(t => `<span class="drawer-tag">#${t}</span>`).join(' ');

                drawer.innerHTML = `
                    <div class="drawer-left">
                        <div class="drawer-icon">${icon}</div>
                        <div class="drawer-content">
                            <h3>${name} (${info.badge})</h3>
                            <p>${info.desc}</p>
                            <div class="drawer-tags">${tagsHtml}</div>
                        </div>
                    </div>
                    <div>
                        <button type="button" class="drawer-close-btn" id="closeDrawerBtn">✕ Close Details</button>
                    </div>
                `;
                drawer.style.display = 'flex';

                // Wire close button
                const closeBtn = document.getElementById('closeDrawerBtn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        drawer.style.display = 'none';
                        card.classList.remove('active-card');
                    });
                }

                if (window.showToast) {
                    window.showToast(`Loaded details for ${name}`, 'info');
                }
            }
        });
    });
}

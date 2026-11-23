// Product listing: category filters, price filters and sorting.
document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("product-grid");
    const cards = Array.from(grid.querySelectorAll(".product-card"));
    const categoryInputs = document.querySelectorAll(".category-filter");
    const priceInputs = document.querySelectorAll('input[name="price"]');
    const sortSelect = document.getElementById("sort-by");
    const count = document.getElementById("product-count");

    function applyFiltersAndSort() {
        const selectedCategories = Array.from(categoryInputs).filter(input => input.checked).map(input => input.value);
        const priceRange = document.querySelector('input[name="price"]:checked').value;
        let visibleCards = cards.filter(card => {
            const price = Number(card.dataset.price);
            const categoryMatches = selectedCategories.length === 0 || selectedCategories.includes(card.dataset.category);
            let priceMatches = true;
            if (priceRange === "under") priceMatches = price < 1000;
            if (priceRange === "middle") priceMatches = price >= 1000 && price <= 5000;
            if (priceRange === "above") priceMatches = price > 5000;
            return categoryMatches && priceMatches;
        });

        const sortValue = sortSelect.value;
        if (sortValue === "low-high") visibleCards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        else if (sortValue === "high-low") visibleCards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        else if (sortValue === "name") visibleCards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
        else visibleCards.sort((a, b) => Number(b.dataset.popularity) - Number(a.dataset.popularity));

        cards.forEach(card => { card.hidden = true; });
        visibleCards.forEach(card => { card.hidden = false; grid.appendChild(card); });
        count.textContent = `Showing ${visibleCards.length} of ${cards.length} products`;
        let empty = document.getElementById("empty-state");
        if (visibleCards.length === 0) {
            if (!empty) { empty = document.createElement("p"); empty.id = "empty-state"; empty.className = "empty-state"; empty.textContent = "No products match the selected filters."; grid.appendChild(empty); }
        } else if (empty) empty.remove();
    }

    categoryInputs.forEach(input => input.addEventListener("change", applyFiltersAndSort));
    priceInputs.forEach(input => input.addEventListener("change", applyFiltersAndSort));
    sortSelect.addEventListener("change", applyFiltersAndSort);
    document.getElementById("clear-filters").addEventListener("click", function () {
        categoryInputs.forEach(input => input.checked = false);
        document.querySelector('input[name="price"][value="all"]').checked = true;
        sortSelect.value = "popular";
        applyFiltersAndSort();
    });
    applyFiltersAndSort();
});

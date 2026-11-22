
/* =====================================
   SHOPZONE - CART JAVASCRIPT
===================================== */

// DOM ELEMENTS

const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");

const itemCount = document.getElementById("itemCount");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const totalElement = document.getElementById("total");

const checkoutBtn = document.getElementById("checkoutBtn");
const cartNotice = document.getElementById("cartNotice");

const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCoupon");
const couponMessage = document.getElementById("couponMessage");

const discountRow = document.getElementById("discountRow");
const discountElement = document.getElementById("discount");

const progressBar = document.getElementById("progressBar");
const deliveryMessage = document.getElementById("deliveryMessage");

const checkoutSection = document.getElementById("checkoutSection");
const checkoutForm = document.getElementById("checkoutForm");
const orderSuccess = document.getElementById("orderSuccess");


// CONSTANTS

const CART_KEY = "shopZoneCart";

const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_LIMIT = 999;


// SAMPLE PRODUCTS

const sampleProducts = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 1499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 2499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
    }
];


// CART DATA

let cart = [];

// Temporarily hidden products.
// This resets automatically after refreshing.

let hiddenProductIds = new Set();

let appliedCoupon = null;


// GET VISIBLE PRODUCTS

function getVisibleCart() {

    return cart.filter(
        product => !hiddenProductIds.has(String(product.id))
    );

}


// LOAD CART FROM LOCAL STORAGE

function loadCart() {

    try {

        const savedCart = localStorage.getItem(CART_KEY);

        if (savedCart === null) {

            // First visit: load sample products.

            cart = [...sampleProducts];

            saveCart();

        } else {

            const parsedCart = JSON.parse(savedCart);

            if (!Array.isArray(parsedCart)) {
                throw new Error("Invalid cart data");
            }

            cart = parsedCart.filter(item =>
                item &&
                (
                    typeof item.id === "string" ||
                    Number.isSafeInteger(item.id)
                ) &&
                String(item.id).length > 0 &&
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                item.price >= 0 &&
                Number.isSafeInteger(item.quantity) &&
                item.quantity >= 1
            );

            // Restore sample products if saved cart is empty.

            if (cart.length === 0) {

                cart = [...sampleProducts];

                saveCart();

            }
        }

        // All products become visible after refresh.

        hiddenProductIds.clear();

    } catch (error) {

        cart = [...sampleProducts];

        hiddenProductIds.clear();

        saveCart();

        showNotice("Cart restored with sample products.");

    }

}


// SAVE CART IN LOCAL STORAGE

function saveCart() {

    try {

        // Save all products, including temporarily hidden products.

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    } catch (error) {

        showNotice(
            "Unable to save cart. Browser storage may be unavailable."
        );

    }

}


// FORMAT PRICE

function formatPrice(price) {

    return "₹" + price.toLocaleString("en-IN");

}


// ESCAPE PRODUCT TEXT

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}


// SAFE IMAGE URL

function safeImageURL(url) {

    try {

        const parsedURL = new URL(url);

        if (
            parsedURL.protocol === "https:" ||
            parsedURL.protocol === "http:"
        ) {
            return escapeHTML(url);
        }

    } catch (error) {

        // Use fallback image.

    }

    return "https://placehold.co/150x150?text=Product";

}


// DISPLAY CART PRODUCTS

function displayCart() {

    cartItems.innerHTML = "";

    const visibleCart = getVisibleCart();

    if (visibleCart.length === 0) {

        emptyCart.hidden = false;

        checkoutBtn.disabled = true;

    } else {

        emptyCart.hidden = true;

        checkoutBtn.disabled = false;

        visibleCart.forEach(product => {

            const item = document.createElement("div");

            item.className = "cart-item";

            item.innerHTML = `
                <img
                    src="${safeImageURL(product.image)}"
                    alt="${escapeHTML(product.name)}"
                >

                <div class="item-info">

                    <h3>${escapeHTML(product.name)}</h3>

                    <p class="item-price">
                        ${formatPrice(product.price)}
                    </p>

                    <div class="quantity">

                        <button
                            type="button"
                            data-action="decrease"
                            data-id="${escapeHTML(product.id)}"
                            aria-label="Decrease quantity"
                            ${product.quantity <= 1 ? "disabled" : ""}
                        >−</button>

                        <span class="qty-value">
                            ${product.quantity}
                        </span>

                        <button
                            type="button"
                            data-action="increase"
                            data-id="${escapeHTML(product.id)}"
                            aria-label="Increase quantity"
                            ${product.quantity >= 99 ? "disabled" : ""}
                        >+</button>

                    </div>

                    <button
                        type="button"
                        class="remove-btn"
                        data-action="remove"
                        data-id="${escapeHTML(product.id)}"
                    >
                        Remove
                    </button>

                </div>

                <div class="line-total">
                    ${formatPrice(product.price * product.quantity)}
                </div>
            `;

            cartItems.appendChild(item);

            // IMAGE FALLBACK

            const image = item.querySelector("img");

            image.addEventListener("error", function() {

                this.src =
                    "https://placehold.co/150x150?text=Product";

            }, { once: true });

        });

    }

    updateSummary();

}


// HANDLE QUANTITY AND REMOVE BUTTONS

cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const productId = String(button.dataset.id);

    const product = cart.find(
        item => String(item.id) === productId
    );

    if (!product) return;

    const action = button.dataset.action;


    // INCREASE QUANTITY

    if (action === "increase") {

        if (product.quantity >= 99) {

            showNotice("Maximum quantity allowed is 99.");

            return;

        }

        product.quantity++;

        saveCart();

    }


    // DECREASE QUANTITY

    else if (action === "decrease") {

        if (product.quantity > 1) {

            product.quantity--;

        }

        saveCart();

    }


    // REMOVE PRODUCT TEMPORARILY

    else if (action === "remove") {

        const confirmation = confirm(
            `Are you sure you want to remove ${product.name}?`
        );

        if (!confirmation) return;

        // Hide the product without deleting it from Local Storage.

        hiddenProductIds.add(productId);

        showNotice(
            `${product.name} removed from your cart.`
        );

        if (getVisibleCart().length === 0) {

            checkoutSection.hidden = true;

        }

    }

    displayCart();

});


// CALCULATE TOTALS

function updateSummary() {

    const visibleCart = getVisibleCart();

    let subtotal = 0;

    let count = 0;

    visibleCart.forEach(product => {

        subtotal += product.price * product.quantity;

        count += product.quantity;

    });


    // DELIVERY CHARGES

    const delivery = subtotal === 0
        ? 0
        : subtotal >= FREE_DELIVERY_LIMIT
            ? 0
            : DELIVERY_CHARGE;


    // COUPON DISCOUNT

    let discount = 0;

    if (appliedCoupon === "SAVE10") {

        discount = subtotal * 0.10;

    }

    else if (appliedCoupon === "SHOP50" && subtotal >= 500) {

        discount = 50;

    }

    discount = Math.min(discount, subtotal);


    // FINAL TOTAL

    const total = subtotal + delivery - discount;


    // UPDATE DOM

    itemCount.textContent = count;

    subtotalElement.textContent =
        formatPrice(subtotal);

    deliveryElement.textContent =
        formatPrice(delivery);

    discountElement.textContent =
        "-" + formatPrice(discount);

    totalElement.textContent =
        formatPrice(total);

    discountRow.hidden = discount === 0;

    checkoutBtn.disabled = visibleCart.length === 0;

    updateDeliveryProgress(subtotal);

}


// FREE DELIVERY PROGRESS

function updateDeliveryProgress(subtotal) {

    const percentage = Math.min(
        (subtotal / FREE_DELIVERY_LIMIT) * 100,
        100
    );

    progressBar.style.width = percentage + "%";


    if (subtotal === 0) {

        deliveryMessage.textContent =
            "Add items to unlock free delivery!";

    }

    else if (subtotal >= FREE_DELIVERY_LIMIT) {

        deliveryMessage.textContent =
            "Congratulations! You have unlocked free delivery.";

    }

    else {

        const remaining = FREE_DELIVERY_LIMIT - subtotal;

        deliveryMessage.textContent =
            `Add ${formatPrice(remaining)} more to get free delivery!`;

    }

}


// COUPON VALIDATION

applyCouponBtn.addEventListener("click", applyCoupon);


function applyCoupon() {

    const code = couponInput.value.trim().toUpperCase();

    const visibleCart = getVisibleCart();

    if (visibleCart.length === 0) {

        showCouponMessage(
            "Add products before applying a coupon.",
            false
        );

        return;

    }

    if (code === "") {

        showCouponMessage(
            "Please enter a coupon code.",
            false
        );

        return;

    }


    // SAVE10 COUPON

    if (code === "SAVE10") {

        appliedCoupon = "SAVE10";

        showCouponMessage(
            "10% discount applied successfully!",
            true
        );

    }


    // SHOP50 COUPON

    else if (code === "SHOP50") {

        const subtotal = visibleCart.reduce(
            (sum, product) =>
                sum + product.price * product.quantity,
            0
        );

        if (subtotal < 500) {

            showCouponMessage(
                "SHOP50 requires a minimum purchase of ₹500.",
                false
            );

            return;

        }

        appliedCoupon = "SHOP50";

        showCouponMessage(
            "₹50 discount applied successfully!",
            true
        );

    }


    // INVALID COUPON

    else {

        appliedCoupon = null;

        showCouponMessage(
            "Invalid coupon code.",
            false
        );

    }

    updateSummary();

}


// COUPON MESSAGE

function showCouponMessage(message, success) {

    couponMessage.textContent = message;

    couponMessage.className = success
        ? "coupon-message success"
        : "coupon-message error";

}


// CHECKOUT BUTTON

checkoutBtn.addEventListener("click", function () {

    if (getVisibleCart().length === 0) {
        return;
    }

    window.location.href = "checkout.html";

});


// FORM VALIDATION

checkoutForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (getVisibleCart().length === 0) {

        showNotice("Your cart is empty.");

        return;

    }


    // GET FORM VALUES

    const name = document.getElementById("customerName").value.trim();

    const email = document.getElementById("customerEmail").value.trim();

    const phone = document.getElementById("customerPhone").value.trim();

    const pin = document.getElementById("customerPin").value.trim();

    const address = document.getElementById("customerAddress").value.trim();


    let valid = true;

    clearErrors();


    // NAME VALIDATION

    if (name.length < 3 || !/^[A-Za-z ]+$/.test(name)) {

        showError(
            "nameError",
            "Enter a valid name (at least 3 letters)."
        );

        valid = false;

    }


    // EMAIL VALIDATION

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        showError(
            "emailError",
            "Enter a valid email address."
        );

        valid = false;

    }


    // PHONE VALIDATION

    if (!/^[6-9][0-9]{9}$/.test(phone)) {

        showError(
            "phoneError",
            "Enter a valid 10-digit mobile number."
        );

        valid = false;

    }


    // PIN CODE VALIDATION

    if (!/^[1-9][0-9]{5}$/.test(pin)) {

        showError(
            "pinError",
            "Enter a valid 6-digit PIN code."
        );

        valid = false;

    }


    // ADDRESS VALIDATION

    if (address.length < 10) {

        showError(
            "addressError",
            "Address must contain at least 10 characters."
        );

        valid = false;

    }


    if (!valid) return;


    // PLACE DEMO ORDER

    const orderId = "SZ" + Date.now().toString().slice(-8);

    const finalAmount = totalElement.textContent;

    orderSuccess.textContent =
        `Order placed successfully! Your Order ID is ${orderId}. Total: ${finalAmount}`;

    orderSuccess.hidden = false;


    // CLEAR CART AFTER ORDER

    cart = [];

    hiddenProductIds.clear();

    appliedCoupon = null;

    saveCart();


    // RESET CHECKOUT FORM

    checkoutForm.reset();

    checkoutForm.hidden = true;

    couponInput.value = "";

    couponMessage.textContent = "";

    couponMessage.className = "coupon-message";


    // UPDATE CART DISPLAY

    displayCart();

    checkoutSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


// DISPLAY VALIDATION ERROR

function showError(elementId, message) {

    document.getElementById(elementId).textContent = message;

}


// CLEAR VALIDATION ERRORS

function clearErrors() {

    const errors = [
        "nameError",
        "emailError",
        "phoneError",
        "pinError",
        "addressError"
    ];

    errors.forEach(id => {

        document.getElementById(id).textContent = "";

    });

}


// DISPLAY CART NOTICE

function showNotice(message) {

    cartNotice.textContent = message;

    cartNotice.hidden = false;

}


// INITIALIZE CART

loadCart();

displayCart();

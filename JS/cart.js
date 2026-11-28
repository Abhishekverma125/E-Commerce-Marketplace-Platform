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
const CART_KEY = "shopZoneCart";
const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_LIMIT = 999;
const MAX_QUANTITY = 99;
let cart = [];
let appliedCoupon = null;
function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_KEY);
        if (savedCart === null) {
            cart = [];
            saveCart();
            return;
        }
        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
            throw new Error("Invalid cart data");
        }
        cart = parsedCart.filter(product => {
            return (
                product &&
                (typeof product.id === "string" ||
                    Number.isSafeInteger(product.id)) &&
                String(product.id).length > 0 &&
                typeof product.name === "string" &&
                product.name.trim().length > 0 &&
                Number.isFinite(Number(product.price)) &&
                Number(product.price) >= 0 &&
                Number.isSafeInteger(Number(product.quantity)) &&
                Number(product.quantity) >= 1 &&
                Number(product.quantity) <= MAX_QUANTITY
            );
        }).map(product => ({
            ...product,
            id: String(product.id),
            name: product.name.trim(),
            price: Number(product.price),
            quantity: Number(product.quantity)
        }));
        saveCart();
    } catch (error) {
        cart = [];
        localStorage.removeItem(CART_KEY);
        saveCart();
        showNotice(
            "Your cart was reset because its saved data was invalid."
        );
    }
}
function saveCart() {
    try {
        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );
        return true;
    } catch (error) {
        showNotice(
            "Unable to save cart. Browser storage may be unavailable."
        );
        return false;
    }
}
function formatPrice(price) {
    return "₹" + Number(price).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
function safeImageURL(url) {
    try {
        const parsedURL = new URL(url, window.location.href);
        if (
            parsedURL.protocol === "https:" ||
            parsedURL.protocol === "http:"
        ) {
            return escapeHTML(parsedURL.href);
        }
    } catch (error) {
    }
    return "https://placehold.co/150x150?text=Product";
}
function displayCart() {
    cartItems.innerHTML = "";
    if (cart.length === 0) {
        emptyCart.hidden = false;
        checkoutBtn.disabled = true;
    } else {
        emptyCart.hidden = true;
        checkoutBtn.disabled = false;

        cart.forEach(product => {
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
                            ${product.quantity >= MAX_QUANTITY ? "disabled" : ""}
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
            const image = item.querySelector("img");

            image.addEventListener("error", function () {
                this.src =
                    "https://placehold.co/150x150?text=Product";

            }, { once: true });
        });
    }
    updateSummary();
}

cartItems.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const productId = String(button.dataset.id);
    const productIndex = cart.findIndex(
        item => String(item.id) === productId
    );

    if (productIndex === -1) return;

    const product = cart[productIndex];
    const action = button.dataset.action;

    if (action === "increase") {
        if (product.quantity >= MAX_QUANTITY) {
            showNotice("Maximum quantity allowed is 99.");
            return;
        }
        product.quantity++;
    }

    else if (action === "decrease") {
        if (product.quantity > 1) {
            product.quantity--;
        }
    }

    else if (action === "remove") {
        const confirmation = confirm(
            `Are you sure you want to remove ${product.name}?`
        );

        if (!confirmation) return;

        cart.splice(productIndex, 1);
        showNotice(
            `${product.name} removed from your cart.`
        );
    }
    saveCart();
    displayCart();
});

function updateSummary() {
    let subtotal = 0;
    let count = 0;

    cart.forEach(product => {
        subtotal += product.price * product.quantity;
        count += product.quantity;
    });

    const delivery = subtotal === 0
        ? 0
        : subtotal >= FREE_DELIVERY_LIMIT
            ? 0
            : DELIVERY_CHARGE;

    let discount = 0;
    if (appliedCoupon === "SAVE10") {
        discount = subtotal * 0.10;
    }
    else if (appliedCoupon === "SHOP50" && subtotal >= 500) {
        discount = 50;
    }

    discount = Math.min(discount, subtotal);
    const total = subtotal + delivery - discount;

    itemCount.textContent = count;
    subtotalElement.textContent = formatPrice(subtotal);
    deliveryElement.textContent = formatPrice(delivery);
    discountElement.textContent = "-" + formatPrice(discount);
    totalElement.textContent = formatPrice(total);
    discountRow.hidden = discount === 0;
    checkoutBtn.disabled = cart.length === 0;
    updateDeliveryProgress(subtotal);
}

function updateDeliveryProgress(subtotal) {
    const percentage = Math.min(
        (subtotal / FREE_DELIVERY_LIMIT) * 100,
        100
    );

    progressBar.style.width = percentage + "%";
    if (subtotal === 0) {
        deliveryMessage.textContent = "Add items to unlock free delivery!";
    }

    else if (subtotal >= FREE_DELIVERY_LIMIT) {
        deliveryMessage.textContent =  "Congratulations! You have unlocked free delivery.";
    }

    else {
        const remaining = FREE_DELIVERY_LIMIT - subtotal;
        deliveryMessage.textContent = `Add ${formatPrice(remaining)} more to get free delivery!`;
    }
}

applyCouponBtn.addEventListener("click", applyCoupon);

function applyCoupon() {
    const code = couponInput.value.trim().toUpperCase();
    if (cart.length === 0) {
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

    if (code === "SAVE10") {
        appliedCoupon = "SAVE10";
        showCouponMessage(
            "10% discount applied successfully!",
            true
        );

    }

    else if (code === "SHOP50") {
        const subtotal = cart.reduce(
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
    else {
        appliedCoupon = null;
        showCouponMessage(
            "Invalid coupon code.",
            false
        );
    }
    updateSummary();
}

function showCouponMessage(message, success) {
    couponMessage.textContent = message;
    couponMessage.className = success
        ? "coupon-message success"
        : "coupon-message error";

}

checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) {
        showNotice("Your cart is empty.");
        return;
    }
    window.location.href = "checkout.html";
});

function showNotice(message) {
    cartNotice.textContent = message;
    cartNotice.hidden = false;
}

loadCart();
displayCart();
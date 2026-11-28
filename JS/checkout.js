(function () {
    "use strict";
    var CART_KEY = "shopZoneCart";
    var USER_KEY = "shopzoneCurrentUser";
    var ORDERS_KEY = "shopzoneOrders";
    var LAST_ORDER_KEY = "shopzoneLastOrder";
    var SHIPPING_FEE = 50;
    var MAX_QTY = 99;
    var PAYMENT_DELAY_MS = 900;
    var form = document.getElementById("checkoutForm");
    var placeOrderBtn = document.getElementById("placeOrderBtn");
    var layoutEl = document.getElementById("checkoutLayout");
    var emptyStateEl = document.getElementById("emptyState");
    var authNoticeEl = document.getElementById("authNotice");
    var formErrorEl = document.getElementById("formError");
    var checkoutItemsEl = document.getElementById("checkoutItems");
    var cart = loadCart();
    var placing = false;
    var orderPlaced = false;
    function $(id) {
        return document.getElementById(id);
    }
    function firstDefined() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined && arguments[i] !== null) {
                return arguments[i];
            }
        }
        return undefined;
    }
    function parsePrice(value) {
        if (typeof value === "number") {
            return isFinite(value) ? value : NaN;
        }
        var match = String(value === undefined || value === null ? "" : value)
            .replace(/,/g, "")
            .match(/\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : NaN;
    }
    function round2(number) {
        return Math.round(number * 100) / 100;
    }
    function formatINR(number) {
        return "₹" + number.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function normalizeItem(raw) {
        if (!raw || typeof raw !== "object") {
            return null;
        }
        var name = String(
            firstDefined(raw.name, raw.title, raw.productName) || ""
        ).trim();
        var price = parsePrice(
            firstDefined(raw.price, raw.amount, raw.cost)
        );
        var qty = parseInt(
            firstDefined(raw.quantity, raw.qty, 1), 10
        );
        if (!name || !isFinite(price) || price < 0) {
            return null;
        }
        if (!isFinite(qty) || qty < 1) {
            qty = 1;
        }
        return {
            id: firstDefined(raw.id, raw.productId, name),
            name: name,
            price: price,
            image: String(
                firstDefined(raw.image, raw.img, raw.imageUrl, raw.thumbnail) || ""
            ),
            quantity: Math.min(qty, MAX_QTY),
            _src: raw
        };
    }
    function loadCart() {
        var parsed = null;
        try {
            parsed = JSON.parse(localStorage.getItem(CART_KEY));
        } catch (error) {
            parsed = null;
        }
        if (!Array.isArray(parsed)) {
            return [];
        }
        var byId = {};
        var list = [];
        parsed.map(normalizeItem).filter(Boolean).forEach(function (item) {
            var key = String(item.id);
            if (byId[key]) {
                byId[key].quantity = Math.min(
                    MAX_QTY,
                    byId[key].quantity + item.quantity
                );
            } else {
                byId[key] = item;
                list.push(item);
            }
        });
        return list;
    }
    function calcTotals(items) {
        var subtotal = 0;
        items.forEach(function (item) {
            subtotal += item.price * item.quantity;
        });
        subtotal = round2(subtotal);
        var delivery = subtotal === 0
            ? 0
            : subtotal >= 999
                ? 0
                : SHIPPING_FEE;
        return {
            subtotal: subtotal,
            delivery: delivery,
            total: round2(subtotal + delivery)
        };
    }
    function getCurrentUserEmail() {
        var raw = null;
        try {
            raw = localStorage.getItem(USER_KEY);
        } catch (error) {
            return "";
        }
        if (!raw) {
            return "";
        }
        raw = raw.trim();
        if (raw.charAt(0) === "{" || raw.charAt(0) === '"') {
            try {
                var parsed = JSON.parse(raw);
                return String(
                    parsed && typeof parsed === "object"
                        ? (parsed.email || "")
                        : parsed
                ).trim();
            } catch (error) {
                return "";
            }
        }
        return raw;
    }
    function renderSummary() {
        checkoutItemsEl.innerHTML = cart.map(function (item) {
            return '<div class="checkout-product">' +
                '<span>' + escapeHtml(item.name) + ' × ' + item.quantity + '</span>' +
                '<strong>' + formatINR(round2(item.price * item.quantity)) + '</strong>' +
                '</div>';
        }).join("");
        var totals = calcTotals(cart);
        $("subtotal").textContent = formatINR(totals.subtotal);
        $("delivery").textContent = formatINR(totals.delivery);
        $("total").textContent = formatINR(totals.total);
        if (!placing) {
            placeOrderBtn.textContent =
                "Place Order · " + formatINR(totals.total);
        }
    }
    function showEmptyState() {
        layoutEl.hidden = true;
        emptyStateEl.hidden = false;
        $("pageSubtitle").hidden = true;
        placeOrderBtn.disabled = true;
    }
    function showFormError(message) {
        formErrorEl.textContent = message;
        formErrorEl.hidden = false;
        formErrorEl.scrollIntoView({
            block: "center",
            behavior: "smooth"
        });
    }
    function hideFormError() {
        formErrorEl.hidden = true;
        formErrorEl.textContent = "";
    }
    var NAME_RE = /^[A-Za-z\u00C0-\u024F\u0900-\u097F][A-Za-z\u00C0-\u024F\u0900-\u097F .'-]*$/;
    var FIELDS = [
        {
            id: "fullName",
            group: "base",
            check: function (value) {
                if (value.length < 2) {
                    return "Please enter your full name.";
                }
                if (!NAME_RE.test(value)) {
                    return "Name can only contain letters, spaces and . ' -";
                }
                return "";
            }
        },
        {
            id: "email",
            group: "base",
            check: function (value) {
                if (!value) {
                    return "Please enter your email address.";
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                    return "Please enter a valid email address.";
                }
                return "";
            }
        },
        {
            id: "phone",
            group: "base",
            check: function (value) {
                if (!value) {
                    return "Please enter your phone number.";
                }
                if (!/^[6-9]\d{9}$/.test(value)) {
                    return "Enter a valid 10-digit mobile number.";
                }
                return "";
            }
        },
        {
            id: "address",
            group: "base",
            check: function (value) {
                if (value.length < 10) {
                    return "Please enter your complete delivery address.";
                }
                return "";
            }
        },
        {
            id: "city",
            group: "base",
            check: function (value) {
                if (value.length < 2 || !NAME_RE.test(value)) {
                    return "Please enter a valid city name.";
                }
                return "";
            }
        },
        {
            id: "pincode",
            group: "base",
            check: function (value) {
                if (!/^[1-9]\d{5}$/.test(value)) {
                    return "Enter a valid 6-digit PIN code.";
                }
                return "";
            }
        },
        {
            id: "upiId",
            group: "upi",
            check: function (value) {
                if (!value) {
                    return "Please enter your UPI ID.";
                }
                if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(value)) {
                    return "Enter a valid UPI ID, like name@bank.";
                }
                return "";
            }
        },
        {
            id: "cardNumber",
            group: "card",
            check: function (value) {
                var digits = value.replace(/\s/g, "");
                if (!/^\d{13,19}$/.test(digits)) {
                    return "Enter a valid demo card number.";
                }
                return "";
            }
        },
        {
            id: "cardName",
            group: "card",
            check: function (value) {
                if (value.length < 2 || !NAME_RE.test(value)) {
                    return "Enter the name for the demo card.";
                }
                return "";
            }
        },
        {
            id: "cardExpiry",
            group: "card",
            check: function (value) {
                var match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
                if (!match) {
                    return "Enter expiry as MM/YY.";
                }
                var now = new Date();
                var year = 2000 + parseInt(match[2], 10);
                var month = parseInt(match[1], 10);
                if (
                    year < now.getFullYear() ||
                    (year === now.getFullYear() &&
                        month < now.getMonth() + 1)
                ) {
                    return "This demo expiry date has passed.";
                }
                return "";
            }
        },
        {
            id: "cardCvv",
            group: "card",
            check: function (value) {
                if (!/^\d{3,4}$/.test(value)) {
                    return "Enter a 3 or 4 digit demo CVV.";
                }
                return "";
            }
        }
    ];
    function selectedPayment() {
        var selected = document.querySelector(
            'input[name="payment"]:checked'
        );
        return selected ? selected.value : "Cash on Delivery";
    }
    function activeGroups() {
        var method = selectedPayment();
        return {
            base: true,
            upi: method === "UPI",
            card: method === "Card"
        };
    }
    function fieldValue(id) {
        return $(id).value.trim();
    }
    function setError(id, message) {
        var input = $(id);
        var errorEl = $(id + "-error");
        errorEl.textContent = message;
        input.setAttribute("aria-invalid", message ? "true" : "false");
        input.classList.toggle("invalid", !!message);
    }
    function validateField(field) {
        var message = field.check(fieldValue(field.id));
        setError(field.id, message);
        return message === "";
    }
    function validateAll() {
        var groups = activeGroups();
        var firstInvalid = null;
        FIELDS.forEach(function (field) {
            if (!groups[field.group]) {
                setError(field.id, "");
                return;
            }
            if (!validateField(field) && !firstInvalid) {
                firstInvalid = field.id;
            }
        });
        if (firstInvalid) {
            $(firstInvalid).focus();
            return false;
        }
        return true;
    }
    function updatePlaceOrderButton() {
        placeOrderBtn.disabled =
            cart.length === 0 ||
            placing ||
            orderPlaced;
    }
    function onlyDigits(id, maxLength) {
        $(id).addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "").slice(0, maxLength);
            updatePlaceOrderButton();
        });
    }
    onlyDigits("phone", 10);
    onlyDigits("pincode", 6);
    onlyDigits("cardCvv", 4);
    $("cardNumber").addEventListener("input", function () {
        var digits = this.value.replace(/\D/g, "").slice(0, 19);
        this.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
        updatePlaceOrderButton();
    });
    $("cardExpiry").addEventListener("input", function () {
        var digits = this.value.replace(/\D/g, "").slice(0, 4);
        this.value = digits.length > 2
            ? digits.slice(0, 2) + "/" + digits.slice(2)
            : digits;
        updatePlaceOrderButton();
    });
    FIELDS.forEach(function (field) {
        var input = $(field.id);
        input.addEventListener("blur", function () {
            if (activeGroups()[field.group]) {
                validateField(field);
            }
            updatePlaceOrderButton();
        });
        input.addEventListener("input", function () {
            if (input.classList.contains("invalid")) {
                validateField(field);
            }
            updatePlaceOrderButton();
        });
    });
    function updatePaymentUI() {
        var method = selectedPayment();
        $("upiDetails").hidden = method !== "UPI";
        $("cardDetails").hidden = method !== "Card";
        Array.prototype.forEach.call(
            document.querySelectorAll(".payment-option"),
            function (option) {
                var radio = option.querySelector('input[type="radio"]');
                option.classList.toggle("selected", radio.checked);
            }
        );
        FIELDS.forEach(function (field) {
            if (!activeGroups()[field.group]) {
                setError(field.id, "");
            }
        });
    }
    Array.prototype.forEach.call(
        document.querySelectorAll('input[name="payment"]'),
        function (radio) {
            radio.addEventListener("change", function () {
                updatePaymentUI();
                updatePlaceOrderButton();
            });
        }
    );
    function buildOrder(userEmail, method) {
        var totals = calcTotals(cart);
        var fullName = fieldValue("fullName");
        var phone = fieldValue("phone");
        var address = fieldValue("address");
        var city = fieldValue("city");
        var pincode = fieldValue("pincode");
        var order = {
            orderId: "SZ" + Date.now(),
            email: userEmail,
            customerName: fullName,
            phone: phone,
            address: address + ", " + city + " - " + pincode,
            items: cart.map(function (item) {
                var line = {};
                Object.keys(item._src).forEach(function (key) {
                    line[key] = item._src[key];
                });
                line.id = item.id;
                line.name = item.name;
                line.price = item.price;
                line.image = item.image;
                line.quantity = item.quantity;
                return line;
            }),
            subtotal: totals.subtotal,
            delivery: totals.delivery,
            total: totals.total,
            paymentMethod: method,
            date: new Date().toLocaleString(),
            status: "Order Placed",
            paymentStatus: method === "Cash on Delivery"
                ? "Pay on Delivery"
                : "Demo Payment",
            shipping: {
                fullName: fullName,
                phone: phone,
                address: address,
                city: city,
                pincode: pincode
            },
            placedAt: new Date().toISOString()
        };
        if (method === "UPI") {
            order.paymentDetails = {
                upiId: fieldValue("upiId")
            };
        } else if (method === "Card") {
            order.paymentDetails = {
                cardLast4: fieldValue("cardNumber")
                    .replace(/\s/g, "")
                    .slice(-4),
                cardHolder: fieldValue("cardName")
            };
        }
        return order;
    }
    function saveOrder(order) {
        try {
            var orders = [];
            var rawOrders = localStorage.getItem(ORDERS_KEY);
            if (rawOrders) {
                try {
                    var parsed = JSON.parse(rawOrders);
                    if (!Array.isArray(parsed)) {
                        throw new Error("Orders data is not an array.");
                    }
                    orders = parsed;
                } catch (error) {
                    try {
                        localStorage.setItem(
                            ORDERS_KEY + "Backup",
                            rawOrders
                        );
                    } catch (backupError) {
                    }
                    orders = [];
                }
            }
            var existingIds = {};
            orders.forEach(function (item) {
                if (item && item.orderId) {
                    existingIds[item.orderId] = true;
                }
            });
            while (existingIds[order.orderId]) {
                order.orderId = "SZ" + (Date.now() + Math.floor(Math.random() * 1000));
            }
            orders.push(order);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            try {
                localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
            } catch (error) {
            }
            return true;
        } catch (error) {
            return false;
        }
    }
    function clearCart() {
        try {
            localStorage.removeItem(CART_KEY);
        } catch (error) {
            try {
                localStorage.setItem(CART_KEY, "[]");
            } catch (secondError) {
            }
        }
    }
    function resetButton() {
        placing = false;
        placeOrderBtn.disabled = false;
        renderSummary();
        updatePlaceOrderButton();
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (placing || orderPlaced) {
            return;
        }
        hideFormError();
        cart = loadCart();
        renderSummary();
        updatePlaceOrderButton();
        if (cart.length === 0) {
            showEmptyState();
            return;
        }
        var userEmail = getCurrentUserEmail() || fieldValue("email");
        if (!validateAll()) {
            updatePlaceOrderButton();
            return;
        }
        var method = selectedPayment();
        placing = true;
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent =
            method === "Cash on Delivery"
                ? "Placing your order..."
                : "Processing payment...";
        window.setTimeout(function () {
            var order = buildOrder(userEmail, method);
            if (!saveOrder(order)) {
                resetButton();
                showFormError(
                    "We couldn't save your order. Your cart is unchanged. Please try again."
                );
                return;
            }
            clearCart();
            cart = [];
            placing = false;
            orderPlaced = true;
            window.location.href = "confirmation.html";
        }, method === "Cash on Delivery" ? 0 : PAYMENT_DELAY_MS);
    });
    function init() {
        var userEmail = getCurrentUserEmail();
        if (userEmail) {
            $("email").value = userEmail;
            $("email").readOnly = true;
            $("email-hint").hidden = false;
        } else {
            $("email").readOnly = false;
            $("email-hint").hidden = true;
        }
        authNoticeEl.hidden = true;
        if (cart.length === 0) {
            showEmptyState();
            return;
        }
        updatePaymentUI();
        renderSummary();
        updatePlaceOrderButton();
    }
    window.addEventListener("pageshow", function (event) {
        if (event.persisted && !orderPlaced) {
            cart = loadCart();
            if (cart.length === 0) {
                showEmptyState();
            } else {
                layoutEl.hidden = false;
                emptyStateEl.hidden = true;
                renderSummary();
                updatePlaceOrderButton();
            }
        }
    });
    init();
})();

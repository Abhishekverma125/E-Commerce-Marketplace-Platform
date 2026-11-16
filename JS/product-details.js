// Product details: update quantity total and add selected quantity to the cart.
document.addEventListener("DOMContentLoaded", function () {
    const quantityInput = document.getElementById("quantity");
    const unitPrice = Number(document.getElementById("unit-price").dataset.price);
    const totalPrice = document.getElementById("total-price");
    const productName = document.getElementById("product-name").textContent.trim();
    const toast = document.getElementById("cart-toast");
    let toastTimer;

    function getQuantity() {
        let quantity = parseInt(quantityInput.value, 10);
        if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
        quantityInput.value = quantity;
        return quantity;
    }
    function updateTotal() {
        totalPrice.textContent = (unitPrice * getQuantity()).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    }
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
    }
    function addToCart() {
        const quantity = getQuantity();
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem("shopzoneCart") || "[]"); } catch (error) { cart = []; }
        const existing = cart.find(item => item.name === productName);
        if (existing) existing.quantity += quantity;
        else cart.push({ name: productName, price: unitPrice, quantity: quantity });
        localStorage.setItem("shopzoneCart", JSON.stringify(cart));
        showToast(`${productName} (${quantity}) added to cart!`);
    }

    quantityInput.addEventListener("input", updateTotal);
    quantityInput.addEventListener("change", updateTotal);
    document.getElementById("add-to-cart").addEventListener("click", addToCart);
    document.getElementById("buy-now").addEventListener("click", function () {
        addToCart();
        showToast("Item added to cart. You can continue to checkout!");
    });
    updateTotal();
});

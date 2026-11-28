
// =====================================
// SHOPZONE - PRODUCT DETAILS JAVASCRIPT
// Dynamic products + Add to Cart
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    // PRODUCT DATA

    const products = {
        1: {
            name: "Wireless Headphones",
            price: 1999,
            oldPrice: 2499,
            image: "../IMAGES/headphones.jpg",
            rating: "★★★★★",
            features: [
                "High quality sound",
                "Noise cancellation",
                "Bluetooth 5.0",
                "1 year warranty"
            ],
            description: "Experience immersive sound with our wireless headphones. Comfortable, stylish and long-lasting."
        },

        2: {
            name: "T-Shirt",
            price: 499,
            image: "../IMAGES/tshirt.jpg",
            rating: "★★★★☆",
            features: [
                "Comfortable fabric",
                "Stylish design",
                "Regular fit",
                "Easy to wash"
            ],
            description: "A comfortable and stylish T-Shirt suitable for everyday wear."
        },

        3: {
            name: "Sneakers",
            price: 1299,
            image: "../IMAGES/shoes.jpg",
            rating: "★★★★★",
            features: [
                "Comfortable footwear",
                "Stylish design",
                "Durable sole",
                "Suitable for everyday use"
            ],
            description: "Enjoy comfort and style with these versatile everyday sneakers."
        },

        4: {
            name: "Laptop",
            price: 52999,
            image: "../IMAGES/laptop.jpg",
            rating: "★★★★☆",
            features: [
                "High performance",
                "Modern design",
                "Large display",
                "Suitable for work and study"
            ],
            description: "A versatile laptop designed for everyday computing, work and study."
        },

        5: {
            name: "Smart Watch",
            price: 2499,
            image: "../IMAGES/watch.jpg",
            rating: "★★★★★",
            features: [
                "Smart notifications",
                "Fitness tracking",
                "Stylish design",
                "Comfortable strap"
            ],
            description: "Stay connected and track your daily activities with this smart watch."
        },

        6: {
            name: "Backpack",
            price: 999,
            image: "../IMAGES/backpack.jpg",
            rating: "★★★★☆",
            features: [
                "Spacious storage",
                "Multiple compartments",
                "Comfortable straps",
                "Suitable for everyday use"
            ],
            description: "A practical backpack with spacious storage for everyday essentials."
        }
    };


    // CONSTANTS

    const CART_KEY = "shopZoneCart";


    // GET PRODUCT ID FROM URL

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id") || "1";

    const product = products[productId];


    // CHECK PRODUCT

    if (!product) {

        document.querySelector("main").innerHTML =
            "<h2>Product not found!</h2><a href='products.html'>Back to Products</a>";

        return;
    }


    // DOM ELEMENTS

    const productName = document.getElementById("product-name");
    const productImage = document.getElementById("product-image");
    const unitPrice = document.getElementById("unit-price");
    const oldPrice = document.getElementById("old-price");
    const productRating = document.getElementById("product-rating");
    const productFeatures = document.getElementById("product-features");
    const productDescription = document.getElementById("product-description");

    const quantityInput = document.getElementById("quantity");
    const totalPrice = document.getElementById("total-price");

    const toast = document.getElementById("cart-toast");

    let toastTimer;


    // DISPLAY PRODUCT INFORMATION

    productName.textContent = product.name;

    productImage.src = product.image;
    productImage.alt = product.name;

    unitPrice.dataset.price = product.price;

    unitPrice.textContent =
        "₹" + product.price.toLocaleString("en-IN");

    if (product.oldPrice) {

        oldPrice.textContent =
            "₹" + product.oldPrice.toLocaleString("en-IN");

    } else {

        oldPrice.hidden = true;

    }

    productRating.textContent = product.rating;

    productFeatures.innerHTML = "";

    product.features.forEach(function (feature) {

        const li = document.createElement("li");

        li.textContent = feature;

        productFeatures.appendChild(li);

    });

    productDescription.textContent = product.description;


    // GET VALID QUANTITY

    function getQuantity() {

        let quantity = parseInt(quantityInput.value, 10);

        if (!Number.isFinite(quantity) || quantity < 1) {
            quantity = 1;
        }

        quantityInput.value = quantity;

        return quantity;
    }


    // UPDATE TOTAL PRICE

    function updateTotal() {

        const quantity = getQuantity();

        const total = product.price * quantity;

        totalPrice.textContent =
            total.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            });

    }


    // SHOW NOTIFICATION

    function showToast(message) {

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            toast.classList.remove("show");

        }, 2800);

    }


    // ADD PRODUCT TO CART

    function addToCart() {

        const quantity = getQuantity();

        let cart = [];

        try {

            cart = JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

            if (!Array.isArray(cart)) {
                cart = [];
            }

        } catch (error) {

            cart = [];

        }


        // CHECK WHETHER PRODUCT ALREADY EXISTS

        const existingProduct = cart.find(function (item) {

            return String(item.id) === String(productId);

        });


        if (existingProduct) {

            const newQuantity =
                Number(existingProduct.quantity) + quantity;

            if (newQuantity > 99) {

                showToast("Maximum quantity allowed is 99.");

                return;

            }

            existingProduct.quantity = newQuantity;

        } else {

            // ADD NEW PRODUCT

            cart.push({

                id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image

            });

        }


        // SAVE CART

        try {

            localStorage.setItem(
                CART_KEY,
                JSON.stringify(cart)
            );

            showToast(
                product.name + " (" + quantity + ") added to cart!"
            );

        } catch (error) {

            showToast("Unable to save product to cart.");

        }

    }


    // EVENT LISTENERS

    
    // EVENT LISTENERS

    quantityInput.addEventListener("input", updateTotal);

    quantityInput.addEventListener("change", updateTotal);

    function checkLogin() {
        const currentUser = localStorage.getItem("shopzoneCurrentUser");

        if (!currentUser) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    }

    document.getElementById("add-to-cart")
        .addEventListener("click", function () {
            if (!checkLogin()) return;
            addToCart();
        });

    document.getElementById("buy-now")
        .addEventListener("click", function () {
            if (!checkLogin()) return;
            addToCart();
        });

   



    // INITIAL TOTAL

    updateTotal();

});

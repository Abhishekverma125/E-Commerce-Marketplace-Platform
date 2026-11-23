let currentEmail = localStorage.getItem("shopzoneCurrentUser");


let ordersList = document.getElementById("ordersList");


if (!currentEmail) {

    window.location.href = "login.html";

} else {

   
    let users = JSON.parse(localStorage.getItem("shopzoneUsers")) || [];

    
    let currentUser = users.find(function(user) {
        return user.email.toLowerCase() === currentEmail.toLowerCase();
    });


    if (currentUser) {
        document.getElementById("welcomeMessage").textContent =
            "Hello, " + currentUser.name + "! Here are your orders.";
    }

   
    let allOrders = JSON.parse(localStorage.getItem("shopzoneOrders")) || [];

    
    let userOrders = allOrders.filter(function(order) {
        return order.email.toLowerCase() === currentEmail.toLowerCase();
    });

   
    if (userOrders.length === 0) {

        let message = document.createElement("p");
        message.className = "no-orders";
        message.textContent = "You have no orders yet.";

        ordersList.appendChild(message);

    } else {

        
        userOrders.forEach(function(order) {

          
            let card = document.createElement("section");
            card.className = "order-card";

            let info = document.createElement("div");
            info.className = "order-info";

            
            let heading = document.createElement("h3");
            heading.textContent = "Order #" + order.orderId;

        
            let product = document.createElement("p");

            product.textContent = order.items.map(function(item) {
                return item.name + " x " + item.quantity;
            }).join(", ");

           
            let date = document.createElement("p");
            date.textContent = "Order Date: " + order.date;

            
            let total = document.createElement("p");
            total.textContent = "Total: ₹" + order.total;

           
            let status = document.createElement("span");
            status.textContent = order.status;

            if (order.status === "Delivered") {
                status.className = "delivered";

            } else if (order.status === "Shipped") {
                status.className = "shipped";

            } else {
                status.className = "processing";
            }

         
            let link = document.createElement("a");
            link.href = "product-details.html";
            link.textContent = "View Product";

   
            info.appendChild(heading);
            info.appendChild(product);
            info.appendChild(date);
            info.appendChild(total);

            
            card.appendChild(info);
            card.appendChild(status);
            card.appendChild(link);

        
            ordersList.appendChild(card);

        });

    }

}

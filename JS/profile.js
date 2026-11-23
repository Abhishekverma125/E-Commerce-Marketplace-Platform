let currentEmail = localStorage.getItem("shopzoneCurrentUser");


if (!currentEmail) {

    window.location.href = "login.html";

} else {

   
    let users = JSON.parse(localStorage.getItem("shopzoneUsers")) || [];

    
    let currentUser = users.find(function(user) {
        return user.email === currentEmail;
    });

    if (!currentUser) {

        localStorage.removeItem("shopzoneCurrentUser");
        window.location.href = "login.html";

    } else {

      
        document.getElementById("name").value = currentUser.name;
        document.getElementById("email").value = currentUser.email;
        document.getElementById("phone").value = currentUser.phone || "";
        document.getElementById("address").value = currentUser.address || "";

        
        let profileForm = document.getElementById("profileForm");

        
        profileForm.addEventListener("submit", function(event) {

            event.preventDefault();

            
            currentUser.name = document.getElementById("name").value.trim();
            currentUser.phone = document.getElementById("phone").value.trim();
            currentUser.address = document.getElementById("address").value.trim();

            
            let userIndex = users.findIndex(function(user) {
                return user.email === currentEmail;
            });

            
            users[userIndex] = currentUser;

            
            localStorage.setItem("shopzoneUsers", JSON.stringify(users));

            document.getElementById("message").style.color = "green";
            document.getElementById("message").textContent =
                "Profile updated successfully!";

        });

        
        let logoutButton = document.getElementById("logoutButton");

        logoutButton.addEventListener("click", function(event) {

            event.preventDefault();

            
            localStorage.removeItem("shopzoneCurrentUser");

           
            window.location.href = "login.html";

        });

    }

}

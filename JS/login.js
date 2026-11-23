let loginForm = document.getElementById("loginForm");


loginForm.addEventListener("submit", function(event) {

    
    event.preventDefault();

    
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    
    let users = JSON.parse(localStorage.getItem("shopzoneUsers")) || [];

    
    let foundUser = users.find(function(user) {
        return user.email === email &&
               user.password === password;
    });

    let message = document.getElementById("message");

    
    if (foundUser) {

        
        localStorage.setItem("shopzoneCurrentUser", email);

        message.style.color = "green";
        message.textContent = "Login successful!";

        
        window.location.href = "home.html";

    } else {

        message.style.color = "red";
        message.textContent = "Invalid email or password.";

    }

});

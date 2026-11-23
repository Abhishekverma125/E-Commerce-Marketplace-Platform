let registerForm = document.getElementById("registerForm");


registerForm.addEventListener("submit", function(event) {

   
    event.preventDefault();

   
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    
    let users = JSON.parse(localStorage.getItem("shopzoneUsers")) || [];

    let message = document.getElementById("message");

   
    let existingUser = users.find(function(user) {
        return user.email === email;
    });

    if (existingUser) {

        message.style.color = "red";
        message.textContent = "This email is already registered.";

    } else {

       
        let newUser = {
            name: name,
            email: email,
            password: password,
            phone: "",
            address: ""
        };

       
        users.push(newUser);

       
        localStorage.setItem("shopzoneUsers", JSON.stringify(users));

        message.style.color = "green";
        message.textContent = "Registration successful! Please login.";

       
        registerForm.reset();

    }

});

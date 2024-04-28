// Import the necessary Firebase modules
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Get a reference to the Firebase auth service
const auth = getAuth();

// Handle the registration form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('register-email').value;
    var password = document.getElementById('register-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // The user has been registered and is signed in!
            alert('User registered successfully');
        })
        .catch((error) => {
            // Something went wrong. Inspect the error code and provide better user feedback in a production environment
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
});

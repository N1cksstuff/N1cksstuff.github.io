// Import the necessary Firebase modules
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Get a reference to the Firebase auth service
const auth = getAuth();

// Handle the login form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var email = document.getElementById('login-email').value;
    var password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // The user is signed in!
            window.location.href = "users/Nick.html"; // Redirect to your desired URL
        })
        .catch((error) => {
            // Something went wrong. Inspect the error code and provide better user feedback in a production environment
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorMessage);
        });
});
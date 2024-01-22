// Select the body element
var body = document.querySelector('body');

// Determine the number of dots you want to create
var numberOfDots = 1000;

// Create and append the dots
for (var i = 0; i < numberOfDots; i++) {
    var dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.position = 'absolute';
    dot.style.left = Math.random() * window.innerWidth + 'px';
    dot.style.top = Math.random() * window.innerHeight + 'px';
    body.appendChild(dot);
}

// Select all dots
var dots = document.querySelectorAll('.dot');

// Add event listeners to all dots
dots.forEach(function(dot) {
    dot.addEventListener('mouseover', function() {
        // Change the color of the hovered dot
        dot.style.backgroundColor = 'red';
    });

    dot.addEventListener('mouseout', function() {
        // Reset the color of the hovered dot
        dot.style.backgroundColor = 'white';
    });
});
// Variables to store the mouse coordinates
var mouseX = 0;
var mouseY = 0;

// Add a mousemove event listener to the body
document.body.addEventListener('mousemove', function(event) {
    // Update the mouse coordinates
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Create an array to store the dots and their positions
var dots = Array.from(document.querySelectorAll('.dot')).map(function(dot) {
    return {
        element: dot,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };
});

// Function to move the dots
function moveDots() {
    // Move the dots that are near the mouse
    dots.forEach(function(dot) {
        // Calculate the distance between the mouse and the dot
        var distance = getDistance(mouseX, mouseY, dot.x, dot.y);

        // If the distance is less than the threshold, move the dot towards the mouse
        if (distance < 200) { // You can adjust the threshold as needed
            var moveX = (mouseX - dot.x) / distance * 10; // The speed of the movement can be adjusted by changing the multiplier (10 in this case)
            var moveY = (mouseY - dot.y) / distance * 10; // The speed of the movement can be adjusted by changing the multiplier (10 in this case)
            dot.x += moveX;
            dot.y += moveY;
            dot.element.style.left = dot.x + 'px';
            dot.element.style.top = dot.y + 'px';
        }
    });

    // Call the moveDots function again after a short delay
    requestAnimationFrame(moveDots);
}

// Start moving the dots
moveDots();
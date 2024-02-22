window.onload = function() {
    var overlay = document.getElementById('overlay');
    setTimeout(function() {
        overlay.style.opacity = '0';
    }, 2000);

    overlay.addEventListener('transitionend', function() {
        // remove the overlay from the DOM
        overlay.remove();
    });

    window.openModal = function(src) {
        var modal = document.getElementById("myModal");
        var modalImg = document.getElementById("img01");
        var mainContent = document.getElementById("main-content"); // Get the main content
        modal.style.display = "block";
        modalImg.src = src;
    }
    
    var span = document.getElementsByClassName("close")[0];
    
    span.onclick = function() { 
        var modal = document.getElementById("myModal");
        var mainContent = document.getElementById("main-content"); // Get the main content
        modal.style.display = "none";
    }
    window.onload = function() {
        if (window.innerWidth <= 800) {
            var table = document.querySelector('.table-container');
            table.parentNode.removeChild(table);
        }
    }
}
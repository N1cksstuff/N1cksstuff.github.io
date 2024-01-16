(function($) { "use strict";
	//Navigation

	var app = function () {
		var body = undefined;
		var menu = undefined;
		var menuItems = undefined;
		var init = function init() {
			body = document.querySelector('body');
			menu = document.querySelector('.menu-icon');
			menuItems = document.querySelectorAll('.nav__list-item');
			applyListeners();
		};
		var applyListeners = function applyListeners() {
			menu.addEventListener('click', function () {
				return toggleClass(body, 'nav-active');
			});
		};
		var toggleClass = function toggleClass(element, stringClass) {
			if (element.classList.contains(stringClass)) element.classList.remove(stringClass);else element.classList.add(stringClass);
		};
		init();
	}();


	//Page cursors

    document.getElementsByTagName("body")[0].addEventListener("mousemove", function(n) {
        t.style.left = n.clientX + "px", 
		t.style.top = n.clientY + "px", 
		e.style.left = n.clientX + "px", 
		e.style.top = n.clientY + "px", 
		i.style.left = n.clientX + "px", 
		i.style.top = n.clientY + "px"
    });
    var t = document.getElementById("cursor"),
        e = document.getElementById("cursor2"),
        i = document.getElementById("cursor3");
    function n(t) {
        e.classList.add("hover"), i.classList.add("hover")
    }
    function s(t) {
        e.classList.remove("hover"), i.classList.remove("hover")
    }
    s();
    for (var r = document.querySelectorAll(".hover-target"), a = r.length - 1; a >= 0; a--) {
        o(r[a])
    }
    function o(t) {
        t.addEventListener("mouseover", n), t.addEventListener("mouseout", s)
    } 

	//day counter
	var countDownDate = new Date("Oct 15, 2006 00:00:00").getTime();
	var x = setInterval(function() {
		var now = new Date().getTime();
		var distance = now - countDownDate;
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		document.getElementById("counter").innerHTML = days;
	}, 1000);

	//dynamically change website on certain dates
(function() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1; // JavaScript months are 0-11
	var year = currentDate.getFullYear();

	var element = document.getElementById("Panel");

	if (month === 5) {
		// Pride Month
		element.style.background = "linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,165,0,0.1), rgba(255,255,0,0.1), rgba(0,128,0,0.1), rgba(0,0,255,0.1), rgba(75,0,130,0.1), rgba(238,130,238,0.1))";
		element.style.backgroundSize = "1400% 1400%";
		element.style.animation = "rainbow 5s ease infinite";
		element.style.color = "white";
		var textElement = document.createElement("Pridemonth"); // Create a new <p> element
		textElement.textContent = "HAPPY PRIDE MONTH!!!"; // Set its text content
		
		// Add CSS styles to position the text element
		textElement.style.position = "absolute";
		textElement.style.bottom = "90%";
		textElement.style.left = "50%";
		textElement.style.transform = "translate(-50%, -50%)";
		
		element.appendChild(textElement); // Append it to the 'element'

	} else if (month === 10 && day === 15) {
		//Birthday
		var textElement = document.createElement("Birthday"); // Create a new <p> element
		textElement.textContent = "Happy Birthday to me!"; // Set its text content
		element.style.color = "white";
		textElement.style.animation = "flashing 5s ease infinite";
		textElement.style.fontSize = "x-large";
		textElement.style.position = "absolute";
		textElement.style.bottom = "90%";
		textElement.style.left = "50%";
		textElement.style.transform = "translate(-50%, -50%)";

		element.appendChild(textElement); // Append it to the 'element'
	} else {
		// Default
	}
})();
})(jQuery); 
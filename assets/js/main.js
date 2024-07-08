document.addEventListener('DOMContentLoaded', () => {
    const interBubble = document.querySelector('.interactive');
    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;
  
    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      requestAnimationFrame(move);
    };
  
    window.addEventListener('mousemove', event => {
      tgX = event.clientX;
      tgY = event.clientY;
    });
  
    move();
  });
  
  
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

	//day counter
	var countDownDate = new Date("Oct 15, 2006 00:00:00").getTime();
	var x = setInterval(function() {
		var now = new Date().getTime();
		var distance = now - countDownDate;
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		document.getElementById("counter").innerHTML = days;
	}, 1000);


})();



(jQuery); 


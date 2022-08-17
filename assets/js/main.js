/* Please ❤ this if you like it! */



(function($) {
    "use strict";

    //Switch dark/light

    $(".switch").on('click', function() {
        if ($("body").hasClass("light")) {
            $("body").removeClass("light");
            $(".switch").removeClass("switched");
        } else {
            $("body").addClass("light");
            $(".switch").addClass("switched");
        }
    });

    $(document).ready(function() {
        "use strict";

        //Scroll back to top

        var progressPath = document.querySelector('.progress-wrap path');
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
        var updateProgress = function() {
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            var progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
        updateProgress();
        $(window).scroll(updateProgress);
        var offset = 50;
        var duration = 550;
        jQuery(window).on('scroll', function() {
            if (jQuery(this).scrollTop() > offset) {
                jQuery('.progress-wrap').addClass('active-progress');
            } else {
                jQuery('.progress-wrap').removeClass('active-progress');
            }
        });
        jQuery('.progress-wrap').on('click', function(event) {
            event.preventDefault();
            jQuery('html, body').animate({ scrollTop: 0 }, duration);
            return false;
        })


    });

})(jQuery);




class CircleAndDot {
    constructor() {
        this.root = document.body
        this.cursor = document.querySelector(".curzr")

        this.position = {
                distanceX: 0,
                distanceY: 0,
                distance: 0,
                pointerX: 0,
                pointerY: 0,
            },
            this.previousPointerX = 0
        this.previousPointerY = 0
        this.angle = 0
        this.previousAngle = 0
        this.angleDisplace = 0
        this.degrees = 57.296
        this.cursorSize = 22.6
        this.fading = false

        this.cursorStyle = {
            boxSizing: 'border-box',
            position: 'fixed',
            top: `${ this.cursorSize / -2 }px`,
            left: `${ this.cursorSize / -2 }px`,
            zIndex: '2147483647',
            width: `${ this.cursorSize }px`,
            height: `${ this.cursorSize }px`,
            backgroundColor: '#fff0',
            border: '1.25px solid #111920',
            borderRadius: '50%',
            boxShadow: '0 -15px 0 -8px #0000',
            transition: '250ms, transform 100ms',
            userSelect: 'none',
            pointerEvents: 'none'
        }

        this.init(this.cursor, this.cursorStyle)
    }

    init(el, style) {
        Object.assign(el.style, style)
        this.cursor.removeAttribute("hidden")

        document.body.style.cursor = 'none'
        document.body.querySelectorAll("button, label, input, textarea, select, a").forEach((el) => {
            el.style.cursor = 'inherit'
        })
    }

    move(event) {
        this.previousPointerX = this.position.pointerX
        this.previousPointerY = this.position.pointerY
        this.position.pointerX = event.pageX + this.root.getBoundingClientRect().x
        this.position.pointerY = event.pageY + this.root.getBoundingClientRect().y
        this.position.distanceX = this.previousPointerX - this.position.pointerX
        this.position.distanceY = this.previousPointerY - this.position.pointerY
        this.distance = Math.sqrt(this.position.distanceY ** 2 + this.position.distanceX ** 2)

        if (event.target.localName === 'button' ||
            event.target.localName === 'a' ||
            event.target.onclick !== null ||
            event.target.className.includes('curzr-hover')) {
            this.hover()
        } else {
            this.hoverout()
        }

        this.cursor.style.transform = `translate3d(${this.position.pointerX}px, ${this.position.pointerY}px, 0)`

        this.rotate(this.position)
        this.fade(this.distance)
    }

    rotate(position) {
        let unsortedAngle = Math.atan(Math.abs(position.distanceY) / Math.abs(position.distanceX)) * this.degrees
        this.previousAngle = this.angle

        if (position.distanceX <= 0 && position.distanceY >= 0) {
            this.angle = 90 - unsortedAngle + 0
        } else if (position.distanceX < 0 && position.distanceY < 0) {
            this.angle = unsortedAngle + 90
        } else if (position.distanceX >= 0 && position.distanceY <= 0) {
            this.angle = 90 - unsortedAngle + 180
        } else if (position.distanceX > 0 && position.distanceY > 0) {
            this.angle = unsortedAngle + 270
        }

        if (isNaN(this.angle)) {
            this.angle = this.previousAngle
        } else {
            if (this.angle - this.previousAngle <= -270) {
                this.angleDisplace += 360 + this.angle - this.previousAngle
            } else if (this.angle - this.previousAngle >= 270) {
                this.angleDisplace += this.angle - this.previousAngle - 360
            } else {
                this.angleDisplace += this.angle - this.previousAngle
            }
        }
        this.cursor.style.transform += ` rotate(${this.angleDisplace}deg)`
    }

    hover() {
        this.cursor.style.border = '11.3px solid #111920'
    }

    hoverout() {
        this.cursor.style.border = '1.25px solid #111920'
    }

    fade(distance) {
        this.cursor.style.boxShadow = `0 ${-15 - distance}px 0 -8px #111920, 0 0 0 1px #F2F5F8`
        if (!this.fading) {
            this.fading = true
            setTimeout(() => {
                this.cursor.style.boxShadow = '0 -15px 0 -8px #11192000, 0 0 0 1px #F2F5F8'
                this.fading = false
            }, 50)
        }
    }

    click() {
        this.cursor.style.transform += ` scale(0.75)`
        setTimeout(() => {
            this.cursor.style.transform = this.cursor.style.transform.replace(` scale(0.75)`, '')
        }, 35)
    }

    remove() {
        this.cursor.remove()
    }
}

(() => {
    const cursor = new CircleAndDot()
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.onmousemove = function(event) {
            cursor.move(event)
        }
        document.onclick = function() {
            cursor.click()
        }
    } else {
        cursor.remove()
    }
})()


particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 355,
            "density": {
                "enable": true,
                "value_area": 789.1476416322727
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.48927153781200905,
            "random": false,
            "anim": {
                "enable": true,
                "speed": 0.2,
                "opacity_min": 0,
                "sync": false
            }
        },
        "size": {
            "value": 2,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 2,
                "size_min": 0,
                "sync": false
            }
        },
        "line_linked": {
            "enable": false,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 0.2,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "bubble"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 83.91608391608392,
                "size": 1,
                "duration": 3,
                "opacity": 1,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});
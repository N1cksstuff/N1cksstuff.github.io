document.addEventListener("DOMContentLoaded", function () {
    // Display current name based on schedule
    displayCurrentName();

function displayCurrentName() {
    var currentDate = new Date();
    var currentDay = currentDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    var currentTime = currentDate.getHours() * 100 + currentDate.getMinutes();

    var names = {
        0:  [
            { start: 630, end: 2330, name: "Ginette" }, //Sunday
        ],
        1: [
            { start: 630, end: 900, name: "Tobias" }, //Monday
            { start: 1400, end: 1800, name: "Jaci" },
            { start: 1800, end: 2330, name: "Benny" }
        ],
        2: [
            { start: 1000, end: 1400, name: "Maria" }, //Tuesday
            { start: 1400, end: 1800, name: "Sina" },
            { start: 1800, end: 2330, name: "Maxi" }
        ],
        3: [
            { start: 1000, end: 1400, name: "Edwin" }, //Wednesday
            { start: 1400, end: 1800, name: "Maria" },
            { start: 1800, end: 2330, name: "Hannah" }
        ],
        4: [
            { start: 630, end: 900, name: "Maxi" }, //Thursday
            { start: 1400, end: 1800, name: "Henne" },
            { start: 1800, end: 2330, name: "Sina" },
        ],
        5: [
            { start: 630, end: 900, name: "Tobias" }, //Friday
            { start: 1400, end: 1800, name: "Anna ( RB bis 22:00 )" },
            { start: 1800, end: 2330, name: "Ginette" }
        ],
        6: [
            { start: 630, end: 2330, name: "Ginette" } //Saturday
        ]
    };

    var currentNames = names[currentDay];

    if (currentNames) {
        var currentName = findCurrentName(currentNames, currentTime);
        if (currentName) {
            document.getElementById("greetingMessage").innerText = "Gerade im Dienst ist: " + currentName;
        } else {
            document.getElementById("greetingMessage").innerText = "Niemand im Haus / Keine Plandaten vorhanden";
        }
    } else {
        document.getElementById("greetingMessage").innerText = "Keine Plandaten, bitte Nick schreiben! Email: Nickdoesstuff@proton.me";
    }
}

function findCurrentName(schedule, currentTime) {
    for (var i = 0; i < schedule.length; i++) {
        if (currentTime >= schedule[i].start && currentTime <= schedule[i].end) {
            return schedule[i].name;
        }
    }
    return null;
}
})

function findCurrentName(schedule, currentTime) {
    for (var i = 0; i < schedule.length; i++) {
        if (currentTime >= schedule[i].start && currentTime <= schedule[i].end) {
            return schedule[i].name;
        }
    }
    return null;
}

function formatTime(time) {
    var hours = Math.floor(time / 100);
    var minutes = time % 100;

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return hours + ':' + minutes;
}

function displayFullPlanTable() {
    var currentDate = new Date();
    var currentDay = currentDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    var names = getNames();
    var fullPlanTable = document.getElementById("fullPlanTable");
    var tableHtml = '<table>';

    var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    Object.keys(names).forEach(function(day) {
        var dayName = dayNames[day];
        var currentDayNames = names[day];
        if (!Array.isArray(currentDayNames)) {
            currentDayNames = [currentDayNames];
        }

        currentDayNames.forEach(function(name) {
            var startTime = formatTime(name.start);
            var endTime = formatTime(name.end);
            var rowClass = day == currentDay ? ' class="current-day"' : '';
            tableHtml += '<tr' + rowClass + '><td>' + dayName + '</td><td>' + startTime + '-' + endTime + '</td><td>' + name.name + '</td></tr>';
        });
    });

    tableHtml += '</table>';
    fullPlanTable.innerHTML = tableHtml;
}

function getNames() {
    return {
        0:  [
            { start: 630, end: 2330, name: "Ginette" }, //Sunday
        ],
        1: [
            { start: 630, end: 900, name: "Tobias" }, //Monday
            { start: 1400, end: 1800, name: "Jaci" },
            { start: 1800, end: 2330, name: "Benny" }
        ],
        2: [
            { start: 1000, end: 1400, name: "Maria" }, //Tuesday
            { start: 1400, end: 1800, name: "Sina" },
            { start: 1800, end: 2330, name: "Maxi" }
        ],
        3: [
            { start: 1000, end: 1400, name: "Edwin" }, //Wednesday
            { start: 1400, end: 1800, name: "Maria" },
            { start: 1800, end: 2330, name: "Hannah" }
        ],
        4: [
            { start: 630, end: 900, name: "Maxi" }, //Thursday
            { start: 1400, end: 1800, name: "Henne" },
            { start: 1800, end: 2330, name: "Sina" },
        ],
        5: [
            { start: 630, end: 900, name: "Tobias" }, //Friday
            { start: 1400, end: 1800, name: "Anna ( RB bis 22:00 )" },
            { start: 1800, end: 2330, name: "Ginette" }
        ],
        6: [
            { start: 630, end: 2330, name: "Ginette" } //Saturday
        ]
    };

}

window.onload = function() {
    var fullPlanTable = document.getElementById("fullPlanTable");
    var otherElement = document.getElementById("otherElement");

    // Hide the table and show the other element initially
    fullPlanTable.style.display = "none";
    otherElement.style.display = "block";

    // Display current name based on schedule
    displayFullPlanTable();
}

window.addEventListener("scroll", function () {
    var fullPlanTable = document.getElementById("fullPlanTable");
    var otherElement = document.getElementById("otherElement");
    var currentNameSection = document.getElementById("currentNameSection");

    var isScrolled = currentNameSection.classList.contains("scrolled");

    if (window.scrollY > window.innerHeight / 2 && !isScrolled) {
        // Show the table and hide the other element when scrolling down
        fullPlanTable.style.display = "block";
        otherElement.style.display = "none";
        currentNameSection.classList.add("scrolled");
    } else if (window.scrollY <= window.innerHeight / 2 && isScrolled) {
        // Hide the table and show the other element when scrolling up
        fullPlanTable.style.display = "none";
        otherElement.style.display = "block";
        currentNameSection.classList.remove("scrolled");
    }
});

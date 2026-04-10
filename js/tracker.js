const logExercise = document.getElementById("log-exercise"); // Exercise name text input
const logSets = document.getElementById("log-sets");         // Sets number input
const logReps = document.getElementById("log-reps");         // Reps number input
const logWeight = document.getElementById("log-weight");     // Weight number input
const logDate = document.getElementById("log-date");         // Date picker input
const logBtn = document.getElementById("log-btn");           // "Log Workout" button
const logError = document.getElementById("log-error");       // Red error message
const logSuccess = document.getElementById("log-success");   // Green success message
const totalWorkoutsEl = document.getElementById("total-workouts"); // Shows total workout count
const totalVolumeEl = document.getElementById("total-volume");     // Shows total volume number
const currentStreakEl = document.getElementById("current-streak"); // Shows day streak number
const logTable = document.getElementById("log-table");           // The whole table element
const logTableBody = document.getElementById("log-table-body");  // The table body where rows go
const noLogsMsg = document.getElementById("no-logs-msg");        // "No workouts logged" message
const clearLogsBtn = document.getElementById("clear-logs-btn");  // "Clear All Logs" button

// Mobile navigation
const navToggle = document.querySelector(".nav-toggle");  // Hamburger menu button
const navLinks = document.querySelector(".nav-links");    // Navigation links list


let volumeChart = null;    // Will hold the line chart (volume over time)
let frequencyChart = null; // Will hold the bar chart (workouts per week)

// When "Log Workout" button is clicked, run handleLogWorkout
logBtn.addEventListener("click", handleLogWorkout);

// When "Clear All Logs" button is clicked, run handleClearLogs
clearLogsBtn.addEventListener("click", handleClearLogs);

// Toggle mobile navigation menu
navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
});

// Set the date input to today's date by default
logDate.valueAsDate = new Date();

// When the page finishes loading, display all existing data
document.addEventListener("DOMContentLoaded", function () {
    renderLogTable(); // Show the workout history table
    updateStats();    // Update the stats dashboard numbers
    renderCharts();   // Draw the charts
});

function validateLogForm() {
    // Get the values from each input
    const exercise = logExercise.value.trim(); // .trim() removes extra spaces
    const sets = parseInt(logSets.value);    
    const reps = parseInt(logReps.value);
    const weight = parseFloat(logWeight.value);
    const date = logDate.value;

    // Check if exercise name is empty
    if (!exercise) {
        logError.textContent = "⚠️ Please enter an exercise name.";
        return false;
    }

    // Check if sets, reps, or weight fields are empty
    if (!logSets.value || !logReps.value || !logWeight.value) {
        logError.textContent = "⚠️ Please fill in sets, reps, and weight.";
        return false;
    }
    if (!date) {
        logError.textContent = "⚠️ Please select a date.";
        return false;
    }

    // Check that sets is a valid number and at least 1
    // isNaN() returns true if the value is "Not a Number"
    if (isNaN(sets) || sets < 1) {
        logError.textContent = "⚠️ Sets must be at least 1.";
        return false;
    }

    // Check that reps is at least 1
    if (isNaN(reps) || reps < 1) {
        logError.textContent = "⚠️ Reps must be at least 1.";
        return false;
    }

    // Check that weight is not negative (0 is ok for bodyweight)
    if (isNaN(weight) || weight < 0) {
        logError.textContent = "⚠️ Weight cannot be negative.";
        return false;
    }

    // All checks passed – clear any old error
    logError.textContent = "";
    return true;
}

function calculateVolume(sets, reps, weight) {
    return sets * reps * weight;
}

function handleLogWorkout() {

    // Validate the form first. If not valid, stop here.
    if (!validateLogForm()) return;

    // Get the values from the form inputs
    const sets = parseInt(logSets.value);
    const reps = parseInt(logReps.value);
    const weight = parseFloat(logWeight.value);

    // Calculate the volume using our custom function
    const volume = calculateVolume(sets, reps, weight);

    // Create an object to hold all the data for this workout log
    const entry = {
        id: Date.now(),                    // Unique ID (current time in milliseconds)
        exercise: logExercise.value.trim(), // Exercise name (trimmed)
        sets: sets,                        // Number of sets
        reps: reps,                        // Number of reps
        weight: weight,                    // Weight in lbs
        volume: volume,                    // Calculated volume
        date: logDate.value                // The date string
    };

    // Get any existing logs from Local Storage
    const logs = getWorkoutLogs();

    // Add the new entry to the array
    logs.push(entry);

    // Save the updated array back to Local Storage
    localStorage.setItem("fitforge_logs", JSON.stringify(logs));

    // Show a green success message
    logSuccess.textContent = "✅ Logged: " + entry.exercise + " – Volume: " + volume.toLocaleString() + " lbs";
    // .toLocaleString() adds commas to big numbers (e.g., 4,050)
    logSuccess.classList.remove("hidden");

    // Clear the form inputs so the user can log another workout
    logExercise.value = "";
    logSets.value = "";
    logReps.value = "";
    logWeight.value = "";
    logDate.valueAsDate = new Date(); // Reset date to today

    // Refresh everything on the page
    renderLogTable(); // Update the table
    updateStats();    // Update the stat numbers
    renderCharts();   // Redraw the charts

    // Hide the success message after 3 seconds (3000 milliseconds)
    setTimeout(function () {
        logSuccess.classList.add("hidden");
    }, 3000);
}

function getWorkoutLogs() {
    // Try to get the data from Local Storage
    const data = localStorage.getItem("fitforge_logs");

    // If nothing is saved, return an empty array
    if (!data) return [];

    // Try to convert the text back into a JavaScript array
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        // If the data is broken, return empty array
        return [];
    }
}

function renderLogTable() {
    // Get the logs from Local Storage
    const logs = getWorkoutLogs();

    // Clear the existing table rows
    logTableBody.innerHTML = "";

    // If there are no logs, show the "no logs" message and hide the table
    if (logs.length === 0) {
        noLogsMsg.classList.remove("hidden");
        logTable.classList.add("hidden");
        clearLogsBtn.classList.add("hidden");
        return;
    }

    // Hide the "no logs" message and show the table
    noLogsMsg.classList.add("hidden");
    logTable.classList.remove("hidden");
    clearLogsBtn.classList.remove("hidden");

    // Sort logs by date (newest first)
    // .slice() makes a copy so we don't change the original array
    const sorted = logs.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
        // Subtracting dates gives a number: positive = b is newer
    });

    // Loop through each log entry and create a table row
    sorted.forEach(function (entry) {
        const row = document.createElement("tr"); // Create a new table row

        // Fill the row with cells for each piece of data
        row.innerHTML =
            "<td>" + sanitize(entry.date) + "</td>" +
            "<td>" + sanitize(entry.exercise) + "</td>" +
            "<td>" + entry.sets + "</td>" +
            "<td>" + entry.reps + "</td>" +
            "<td>" + entry.weight + " lbs</td>" +
            "<td>" + entry.volume.toLocaleString() + " lbs</td>" +
            "<td><button class='delete-btn' onclick='deleteLog(" + entry.id + ")'>🗑️</button></td>";
        // The delete button calls deleteLog() with this entry's ID

        // Add the row to the table body
        logTableBody.appendChild(row);
    });
}

function sanitize(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

function deleteLog(id) {
    // Get all logs
    let logs = getWorkoutLogs();

    // Keep only the logs that DON'T match this ID
    logs = logs.filter(function (entry) { return entry.id !== id; });

    // Save the filtered array back to Local Storage
    localStorage.setItem("fitforge_logs", JSON.stringify(logs));

    // Refresh the page
    renderLogTable();
    updateStats();
    renderCharts();
}

function handleClearLogs() {
    // Show a confirmation popup
    if (!confirm("Are you sure you want to delete all workout logs?")) return;

    // Remove the logs from Local Storage
    localStorage.removeItem("fitforge_logs");

    // Refresh the page
    renderLogTable();
    updateStats();
    renderCharts();
}

function updateStats() {
    // Get all logs
    const logs = getWorkoutLogs();

    totalWorkoutsEl.textContent = logs.length;

    const totalVol = logs.reduce(function (sum, entry) {
        return sum + entry.volume;
    }, 0); // 0 is the starting sum
    totalVolumeEl.textContent = totalVol.toLocaleString();

    currentStreakEl.textContent = calculateStreak(logs);
}

function calculateStreak(logs) {
    // If there are no logs, streak is 0
    if (logs.length === 0) return 0;

    // Get all unique dates (no duplicates) from the logs
    const uniqueDates = [];
    const seen = {}; // An object to track which dates we've already added

    logs.forEach(function (entry) {
        // If we haven't seen this date yet, add it
        if (!seen[entry.date]) {
            seen[entry.date] = true;
            uniqueDates.push(new Date(entry.date)); // Convert string to Date object
        }
    });

    // Sort dates from newest to oldest
    uniqueDates.sort(function (a, b) { return b - a; });

    // Check if the most recent workout was today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison

    const mostRecent = new Date(uniqueDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    // Calculate how many days ago the most recent workout was
    const daysDiff = Math.round((today - mostRecent) / (1000 * 60 * 60 * 24));

    // If the most recent workout was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;

    // Count consecutive days going backwards
    let streak = 1; // Start at 1 (the most recent day counts)

    for (let i = 1; i < uniqueDates.length; i++) {
        const current = new Date(uniqueDates[i]);      // This date
        const previous = new Date(uniqueDates[i - 1]); // The date before this one
        current.setHours(0, 0, 0, 0);
        previous.setHours(0, 0, 0, 0);

        // Check if these two dates are exactly 1 day apart
        const diff = Math.round((previous - current) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++; // They are consecutive – increase the streak
        } else {
            break;
        }
    }

    return streak;
}

function renderCharts() {
    const logs = getWorkoutLogs();
    renderVolumeChart(logs);    // Draw the line chart
    renderFrequencyChart(logs); // Draw the bar chart
}

function renderVolumeChart(logs) {
    // If a user logged multiple exercises on the same day, add them together
    const volumeByDate = {};

    logs.forEach(function (entry) {
        if (volumeByDate[entry.date]) {
            volumeByDate[entry.date] += entry.volume;
        } else {
            volumeByDate[entry.date] = entry.volume;
        }
    });

    // Get the dates and sort them oldest to newest
    const dates = Object.keys(volumeByDate).sort(function (a, b) {
        return new Date(a) - new Date(b);
    });

    // Get the volume numbers in the same order as the dates
    const volumes = dates.map(function (d) { return volumeByDate[d]; });

    // If there's already a chart, destroy it before creating a new one
    // (Chart.js requires this to avoid duplicates)
    if (volumeChart) {
        volumeChart.destroy();
    }

    // Get the canvas element and create a 2D drawing context
    const ctx = document.getElementById("volumeChart").getContext("2d");

    // Create the Chart.js line chart
    volumeChart = new Chart(ctx, {
        type: "line", // Line chart type

        // DATA: what the chart displays
        data: {
            labels: dates, // X-axis labels (dates)
            datasets: [{
                label: "Volume (lbs)",        // Legend label
                data: volumes,                // Y-axis data points
                borderColor: "#39ff14",       // Line color (neon green)
                backgroundColor: "rgba(57, 255, 20, 0.1)", // Fill color under the line
                fill: true,                   // Fill the area under the line
                tension: 0.3,                 // How curved the line is
                pointBackgroundColor: "#39ff14", // Dot color at each data point
                pointRadius: 5                // Size of the dots
            }]
        },

        // OPTIONS: how the chart looks
        options: {
            responsive: true, // Chart resizes with the container
            scales: {
                x: {
                    ticks: { color: "#a0a0b0" },                // X-axis text color
                    grid: { color: "rgba(255,255,255,0.05)" }  // X-axis grid line color
                },
                y: {
                    beginAtZero: true,                          // Y-axis starts at 0
                    ticks: { color: "#a0a0b0" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            },
            plugins: {
                legend: { labels: { color: "#f0f0f0" } } // Legend text color
            }
        }
    });
}

function renderFrequencyChart(logs) {

    // Group logs by week label (like "2026-W12")
    const weekCounts = {};

    logs.forEach(function (entry) {
        const week = getWeekLabel(entry.date); // Get the week label for this date
        if (weekCounts[week]) {
            weekCounts[week]++;  // Add 1 to existing count
        } else {
            weekCounts[week] = 1; // First workout this week
        }
    });

    // Get the weeks and sort them
    const weeks = Object.keys(weekCounts).sort();
    const counts = weeks.map(function (w) { return weekCounts[w]; });

    // Destroy old chart if it exists
    if (frequencyChart) {
        frequencyChart.destroy();
    }

    // Get the canvas and create the bar chart
    const ctx = document.getElementById("frequencyChart").getContext("2d");

    frequencyChart = new Chart(ctx, {
        type: "bar", // Bar chart type

        data: {
            labels: weeks,  // X-axis labels (week names)
            datasets: [{
                label: "Workouts",                            // Legend label
                data: counts,                                 // Y-axis data (count per week)
                backgroundColor: "rgba(57, 255, 20, 0.6)",   // Bar fill color
                borderColor: "#39ff14",                       // Bar border color
                borderWidth: 1,                               // Bar border thickness
                borderRadius: 6                               // Rounded bar corners
            }]
        },

        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: { color: "#a0a0b0" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#a0a0b0",
                        stepSize: 1  // Y-axis goes up by 1 (whole numbers only)
                    },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            },
            plugins: {
                legend: { labels: { color: "#f0f0f0" } }
            }
        }
    });
}

function getWeekLabel(dateStr) {
    const date = new Date(dateStr);                                    // Convert string to Date
    const jan1 = new Date(date.getFullYear(), 0, 1);                  // January 1st of that year
    const dayOfYear = Math.ceil((date - jan1) / (1000 * 60 * 60 * 24)); // What day of the year it is
    const weekNum = Math.ceil((dayOfYear + jan1.getDay()) / 7);       // Calculate week number

    // Return a string like "2026-W12"
    // String(weekNum).padStart(2, "0") adds a leading zero if needed (e.g., "03")
    return date.getFullYear() + "-W" + String(weekNum).padStart(2, "0");
}
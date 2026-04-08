const goalSelect = document.getElementById("goal");         // The fitness goal dropdown
const levelSelect = document.getElementById("level");       // The experience level dropdown
const muscleSelect = document.getElementById("muscle");     // The muscle group dropdown
const generateBtn = document.getElementById("generate-btn"); // The "Generate Workout" button
const formError = document.getElementById("form-error");     // The red error text below the button
const resultsSection = document.getElementById("workout-results"); // The section that shows generated exercises
const exerciseCards = document.getElementById("exercise-cards");   // The container where exercise cards go
const saveWorkoutBtn = document.getElementById("save-workout-btn"); // The "Save Workout" button
const saveMsg = document.getElementById("save-msg");               // The green "Workout saved!" message
const savedList = document.getElementById("saved-list");         // Where saved workout cards are displayed
const noSavedMsg = document.getElementById("no-saved-msg");      // "No saved workouts yet" message
const clearSavedBtn = document.getElementById("clear-saved-btn"); // "Clear All Saved" button

// Grab the mobile navigation elements
const navToggle = document.querySelector(".nav-toggle");  // The hamburger menu button (☰)
const navLinks = document.querySelector(".nav-links");    // The navigation links list

let currentExercises = []; // This will hold the exercises from the current generated workout

const API_BASE = "https://api.api-ninjas.com/v1/exercises";
const API_KEY = "";

generateBtn.addEventListener("click", handleGenerate);
saveWorkoutBtn.addEventListener("click", handleSaveWorkout);
clearSavedBtn.addEventListener("click", handleClearSaved);

// When the hamburger menu is clicked, show/hide the nav links (for mobile)
navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
});

// When the page finishes loading, load any previously saved workouts from Local Storage
document.addEventListener("DOMContentLoaded", loadSavedWorkouts);

// This function checks that the user selected all 3 dropdowns
// before we try to fetch exercises. Returns true or false.
function validateForm() {
    // Get the current value of each dropdown
    const goal = goalSelect.value;
    const level = levelSelect.value;
    const muscle = muscleSelect.value;

    // If any dropdown is empty (value is ""), show an error
    if (!goal || !level || !muscle) {
        formError.textContent = "⚠️ Please select a goal, level, and muscle group.";
        return false;
    }

    // If we get here, everything is filled in
    formError.textContent = ""; // Clear any old error message
    return true;
}

async function handleGenerate() {
    if (validateForm()) return;
    const level = levelSelect.value;
    const muscle = muscleSelect.value;

    // Change the button text to show it's loading
    generateBtn.textContent = "Loading...";
    generateBtn.disabled = true; // Prevent clicking again while loading

    try {
        const url = API_BASE + "?muscle=" + encodeURIComponent(muscle) + "&difficulty=" + encodeURIComponent(level);
        const response = await fetch(url, {
            headers: { "X-Api-Key": API_KEY}
        });

        if (!response.ok) {
            throw new Error ("API error: " + response.status);
        }
         // Convert the response from JSON text into a JavaScript array
        let data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            const fallbackUrl = API_BASE + "?muscle=" + encodeURIComponent(muscle);
            const fallbackResponse = await fetch(fallbackUrl, {
                headers: { "X-Api-Key": API_KEY }
            });

            if (fallbackResponse.ok) {
                data = await fallbackResponse.json();
            }
        }

         // If STILL no exercises found, this will show an error message
        if (!Array.isArray(data) || data.length === 0) {
            formError.textContent = "No exercises found. Try a different muscle group!";
            resultsSection.classList.add("hidden"); // Hide the results section
            return;
        }

        // Save the exercises to our variable and display them as cards
        currentExercises = data;
        displayExercises(data);

    } catch (error) {
        // If anything went wrong (network error, bad API key, etc.), show an error
        console.error("Fetch error:", error);
        formError.textContent = "❌ Could not fetch exercises. Check your API key or try again.";

    } finally {
        generateBtn.textContent = "Generate Workout";
        generateBtn.disabled = false;
    }
}

function displayExercises(exercises) {
    exerciseCards.innerHTML = "";
    exerciseCards.forEach(function (exercise) {
        const card = document.createElement("div");
        card.classList.add("exercise-card");

        card.innerHTML = 
            "<h3>" + saanitize(exercise.name) + "</h3>" +
            "<span class='tag'>" + sanitize(exercise.type) + "</span>" +
                "<span class='tag'>" + sanitize(exercise.difficulty) + "</span>" +
            "</div>" +
            (exercise.equipment ? "<p><strong>Equipment:</strong> " + sanitize(exercise.equipment) + "</p>" : "") +
            "<p class='instructions'>" + sanitize(exercise.instructions) + "</p>";
        exerciseCards.appendChild(card);
    });

      // Show the results section and save button (remove the "hidden" class)
    resultsSection.classList.remove("hidden");
    saveWorkoutBtn.classList.remove("hidden");
    saveMsg.classList.add("hidden"); // Hide any old "saved!" message
}

function sanitize(str) {
    if (!str) return ""; // If the string is empty or undefined, return empty string
    const div = document.createElement("div");      // Create a temporary div
    div.appendChild(document.createTextNode(str)); // Add the text as plain text (not HTML)
    return div.innerHTML;                         
}

function handleSaveWorkout() {
    if (currentExercises.length === 0) return; // this make it not save if there is no workout generated
    const workout = {
        id: Date.now(),   // Use the current time as a unique ID
        date: new Date().toLocaleDateString(), // Today's date as a readable string
        goal: goalSelect.value,
        level: levelSelect.value, 
        muscle: muscleSelect.value, 
        exercises: currentExercises.map(function (ex) {
            // .map() creates a new array with just the info we want from each exercise
            return {
                name: ex.name,
                type: ex.type,
                muscle: ex.muscle,
                difficulty: ex.difficulty,
                equipment: ex.equipment || "None"
            };
        })
    };

    const saved = getSavedWorkouts(); // Get the current list of saved workouts from Local Storage
    saved.push(workout); // Add the new workout to the list
    localStorage.setItem("fitforge_workouts", JSON.stringify(saved));
    saveMsg.classList.remove("hidden");
    saveMsg.textContent = "✅ Workout saved!";

    loadSavedWorkouts();
}

function getSavedWorkouts() {
    // Try to get the data from Local Storage
    const data = localStorage.getItem("fitforge_workouts");
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : []; // If it's an array, return it. Otherwise return empty array.
    } catch (e) {
        return [];// If the data is corrupted, return empty array
    }
}

function loadSavedWorkouts() {
    const saved = getSavedWorkouts();
    savedList.innerHTML = "";
    if (saved.length === 0) {
        noSavedMsg.classList.remove("hidden");  // Show "No saved workouts" text
        clearSavedBtn.classList.add("hidden");  // Hide the clear button
        return;
    }
    // If we have saved workouts, hide the "no saved" message and show the clear button
    noSavedMsg.classList.add("hidden");
    clearSavedBtn.classList.remove("hidden");

    // Loop through each saved workout and create a card for it
    saved.forEach(function (workout) {
        const card = document.createElement("div");
        card.classList.add("exercise-card");
        // Get all exercise names as a comma-separated string
        const exerciseNames = workout.exercises
            .map(function (ex) { return sanitize(ex.name); }) // Get each name
            .join(", "); // Join them with commas

        card.innerHTML =
            "<h3>" + sanitize(workout.goal) + " – " + sanitize(workout.muscle) + "</h3>" +
            "<div>" +
                "<span class='tag'>" + sanitize(workout.level) + "</span>" +
                "<span class='tag'>" + sanitize(workout.date) + "</span>" +
            "</div>" +
            "<p><strong>Exercises:</strong> " + exerciseNames + "</p>" +
            "<button class='btn btn-danger' style='margin-top:0.5rem; padding:0.4rem 0.8rem; font-size:0.8rem;' " +
                "onclick='deleteSavedWorkout(" + workout.id + ")'>Remove</button>"; // onclick runs deleteSavedWorkout() when the Remove button is clicked

        savedList.appendChild(card);
    });
}
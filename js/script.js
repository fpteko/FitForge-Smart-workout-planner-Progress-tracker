const goalSelect = document.getElementById("goal");         // The fitness goal dropdown
const levelSelect = document.getElementById("level");       // The experience level dropdown
const muscleSelect = document.getElementById("muscle");     // The muscle group dropdown

// Grab the generate button and error message paragraph
const generateBtn = document.getElementById("generate-btn"); // The "Generate Workout" button
const formError = document.getElementById("form-error");     // The red error text below the button

// Grab elements in the results section
const resultsSection = document.getElementById("workout-results"); // The section that shows generated exercises
const exerciseCards = document.getElementById("exercise-cards");   // The container where exercise cards go
const saveWorkoutBtn = document.getElementById("save-workout-btn"); // The "Save Workout" button
const saveMsg = document.getElementById("save-msg");               // The green "Workout saved!" message

// Grab elements in the saved workouts section
const savedList = document.getElementById("saved-list");         // Where saved workout cards are displayed
const noSavedMsg = document.getElementById("no-saved-msg");      // "No saved workouts yet" message
const clearSavedBtn = document.getElementById("clear-saved-btn"); // "Clear All Saved" button

// Grab the mobile navigation elements
const navToggle = document.querySelector(".nav-toggle");  // The hamburger menu button (☰)
const navLinks = document.querySelector(".nav-links");    // The navigation links list

let currentExercises = [];

const API_BASE = "/api/exercises";

generateBtn.addEventListener("click", handleGenerate);
saveWorkoutBtn.addEventListener("click", handleSaveWorkout);
clearSavedBtn.addEventListener("click", handleClearSaved);

// When the hamburger menu is clicked, show/hide the nav links (for mobile)
navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
});

// When the page finishes loading, load any previously saved workouts from Local Storage  
document.addEventListener("DOMContentLoaded", loadSavedWorkouts)

function validateForm() {
    const goal = goalSelect.value;
    const level = levelSelect.value;
    const muscle = muscleSelect.value;

    // If any dropdown is empty (value is ""), show an error
    if (!goal || !level || !muscle) {
        formError.textContent = "⚠️ Please select a goal, level, and muscle group.";
        return false;
    }

    formError.textContent = ""; // Clear any old error message
    return true;
}

async function handleGenerate() {
    if (!validateForm()) return;
    const level = levelSelect.value;
    const muscle = muscleSelect.value;

    // Change the button text to show it's loading
    generateBtn.textContent = "Loading...";
    generateBtn.disabled = true; // Prevent clicking again while loading

    try {
        // Build the API URL with the muscle and difficulty as search parameters
        // encodeURIComponent() makes the values safe to put in a URL
        const url = API_BASE + "?muscle=" + encodeURIComponent(muscle) + "&difficulty=" + encodeURIComponent(level);

        // Send a request to our backend proxy route
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("API error: " + response.status);
        }

        let data = await response.json();

        // FALLBACK: If no exercises were found for this difficulty level,
        // try again without the difficulty filter to get ANY exercises for that muscle
        if (!Array.isArray(data) || data.length === 0) {
            const fallbackUrl = API_BASE + "?muscle=" + encodeURIComponent(muscle);
            const fallbackResponse = await fetch(fallbackUrl);

            if (fallbackResponse.ok) {
                data = await fallbackResponse.json();
            }
        }
        // If STILL no exercises found, show an error message
        if (!Array.isArray(data) || data.length === 0) {
            formError.textContent = "No exercises found. Try a different muscle group!";
            resultsSection.classList.add("hidden"); // Hide the results section
            return;
        }

        // Save the exercises to the variables and display them as cards
        currentExercises = data;
        displayExercises(data);

    } catch (error) {
        // If anything went wrong (network error, bad API key, etc.), show an error
        console.error("Fetch error:", error);
        formError.textContent = "❌ Could not fetch exercises. Try again in a moment.";

    } finally {
        generateBtn.textContent = "Generate Workout";
        generateBtn.disabled = false;
    }
}

function displayExercises(exercises) {
    exerciseCards.innerHTML = "";
    exercises.forEach(function (exercise) {
        const card = document.createElement("div");
        card.classList.add("exercise-card"); // Add the CSS class for styling

        // Using sanitize() to clean the text and prevent security issues (XSS)
        card.innerHTML =
            "<h3>" + sanitize(exercise.name) + "</h3>" +
            "<div>" +
                "<span class='tag'>" + sanitize(exercise.muscle) + "</span>" +
                "<span class='tag'>" + sanitize(exercise.type) + "</span>" +
                "<span class='tag'>" + sanitize(exercise.difficulty) + "</span>" +
            "</div>" +
            (exercise.equipment ? "<p><strong>Equipment:</strong> " + sanitize(exercise.equipment) + "</p>" : "") +
            "<p class='instructions'>" + sanitize(exercise.instructions) + "</p>";

        // Add the card to the page
        exerciseCards.appendChild(card);
    });

    // Show the results section and save button (remove the "hidden" class)
    resultsSection.classList.remove("hidden");
    saveWorkoutBtn.classList.remove("hidden");
    saveMsg.classList.add("hidden"); // Hide any old "saved!" message
}

function sanitize(str) {
    if (!str) return ""; // If the string is empty or undefined, return empty string
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str)); // Add the text as plain text (not HTML)
    return div.innerHTML;                         
}

function handleSaveWorkout() {

    // Don't save if there are no exercises to save
    if (currentExercises.length === 0) return;

    // Build a workout object with all the info to save
    const workout = {
        id: Date.now(),   // Use the current time as a unique ID
        date: new Date().toLocaleDateString(), // Today's date as a readable string
        goal: goalSelect.value,    // The selected goal
        level: levelSelect.value,  // The selected level
        muscle: muscleSelect.value, // The selected muscle
        exercises: currentExercises.map(function (ex) {
            return {
                name: ex.name,
                type: ex.type,
                muscle: ex.muscle,
                difficulty: ex.difficulty,
                equipment: ex.equipment || "None" // || "None" means: if equipment is empty, use "None" instead
            };
        })
    };

    const saved = getSavedWorkouts();

    // Add the new workout to the array
    saved.push(workout);

    // Save the updated array back to Local Storage
    // JSON.stringify() converts the array into a text string (Local Storage only stores text)
    localStorage.setItem("fitforge_workouts", JSON.stringify(saved));

    // Show the success message
    saveMsg.classList.remove("hidden");
    saveMsg.textContent = "✅ Workout saved!";

    loadSavedWorkouts();
}

function getSavedWorkouts() {
    const data = localStorage.getItem("fitforge_workouts");
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function loadSavedWorkouts() {
    const saved = getSavedWorkouts();
    savedList.innerHTML = ""; // Clear any existing cards
    if (saved.length === 0) {
        noSavedMsg.classList.remove("hidden");  // Show "No saved workouts" text
        clearSavedBtn.classList.add("hidden");  // Hide the clear button
        return;
    }

    // otherwise hide the "no saved" message and show the clear button
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

        // Set the card's HTML content
        card.innerHTML =
            "<h3>" + sanitize(workout.goal) + " – " + sanitize(workout.muscle) + "</h3>" +
            "<div>" +
                "<span class='tag'>" + sanitize(workout.level) + "</span>" +
                "<span class='tag'>" + sanitize(workout.date) + "</span>" +
            "</div>" +
            "<p><strong>Exercises:</strong> " + exerciseNames + "</p>" +
            "<button class='btn btn-danger' style='margin-top:0.5rem; padding:0.4rem 0.8rem; font-size:0.8rem;' " +
                "onclick='deleteSavedWorkout(" + workout.id + ")'>Remove</button>";
        // onclick runs deleteSavedWorkout() when the Remove button is clicked

        // Add the card to the page
        savedList.appendChild(card);
    });
}

function deleteSavedWorkout(id) {
    let saved = getSavedWorkouts();

    // Filter out the workout with the matching ID
    saved = saved.filter(function (w) { return w.id !== id; });

    // Save the updated array back to Local Storage
    localStorage.setItem("fitforge_workouts", JSON.stringify(saved));

    loadSavedWorkouts();
}

function handleClearSaved() {
    if (!confirm("Are you sure you want to delete all saved workouts?")) return;
    localStorage.removeItem("fitforge_workouts"); // Remove the saved workouts data from Local Storage

    loadSavedWorkouts();// Refresh the display (will now show "No saved workouts")
}
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
        console.error("Fetch error:", error); // Log the error to the browser console
        formError.textContent = "❌ Could not fetch exercises. Check your API key or try again.";

    } finally {
        generateBtn.textContent = "Generate Workout";
        generateBtn.disabled = false;
    }
}
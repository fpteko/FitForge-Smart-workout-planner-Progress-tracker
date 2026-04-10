# 🔥 FitForge – Workout Builder & Progress Tracker

FitForge is a fitness web app that generates personalized workout plans and tracks your progress over time with charts and stats. Built with HTML, CSS, and vanilla JavaScript.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## Pages

### Workout Builder (`index.html`)

The main page where users create custom workouts.

- **Three dropdown menus** to select a fitness goal (Strength, Cardio, or Weight Loss), experience level (Beginner, Intermediate, or Expert), and target muscle group (Abdominals, Biceps, Chest, Forearms, Glutes, Hamstrings, Lats, Quadriceps, Shoulders, Triceps)
- **Generate Workout** button fetches real exercises from the [API Ninjas Exercise API](https://api-ninjas.com/api/exercises) based on the selected muscle and difficulty
- Exercises display as cards showing the name, muscle, type, difficulty, equipment, and instructions
- **Save Workout** stores the generated workout to the browser's Local Storage
- **Saved Workouts** section shows all previously saved workouts with a **Clear All Saved** button
- Falls back to unfiltered results if no exercises match the exact difficulty level

### Progress Tracker (`tracker.html`)

A page for logging workouts and visualizing progress over time.

- **Stats Dashboard** — three stat cards at the top showing:
  - Total workouts logged
  - Total volume lifted (sets × reps × weight)
  - Current day streak 🔥
- **Log a Workout** form with inputs for exercise name, sets, reps, weight (lbs), and date
- **Volume Over Time** — a Chart.js line chart tracking total volume per session
- **Workouts Per Week** — a Chart.js bar chart showing workout frequency
- **Workout History** table listing all logged workouts sorted newest-first, with a delete button on each row
- **Clear All Logs** button to reset all tracked data
- All data persists in Local Storage

### About (`about.html`)

A static informational page explaining the app.

- **What is FitForge?** — overview of the app's purpose
- **The Problem** — the common fitness challenges FitForge solves
- **How It Works** — a 4-step visual guide:
  1. Choose your goal and level
  2. Generate a workout from the API
  3. Save and track your sets, reps, and weight
  4. Visualize your progress with charts

---

## Project Structure

```
├── index.html          # Workout Builder page
├── tracker.html        # Progress Tracker page
├── about.html          # About page
├── css/
│   └── styles.css      # All styles (dark theme, neon green accent)
├── js/
│   ├── script.js       # Workout Builder logic (API fetch, save/load)
│   └── tracker.js      # Progress Tracker logic (logging, stats, charts)
└── README.md
```

## Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Dark mode styling, Flexbox & CSS Grid layouts, responsive design |
| **JavaScript (ES6)** | DOM manipulation, API calls, form validation, Local Storage |
| **Chart.js** (CDN) | Line and bar charts on the Progress Tracker |
| **API Ninjas Exercise API** | External exercise data |

## Features

- **Dark mode UI** with neon green (`#39ff14`) accent color
- **Fully responsive** — mobile hamburger menu, fluid grids, and scrollable tables
- **No frameworks** — pure HTML, CSS, and vanilla JavaScript
- **Local Storage persistence** — saved workouts and logged data survive page refreshes
- **XSS protection** — user/API text is sanitized before rendering to the DOM
- **Form validation** — all inputs are checked before submission with clear error messages

## Getting Started

1. Clone or download the repository
2. Install dependencies:
  - `npm install`
3. Create a `.env` file in the project root and add:
  - `API_NINJAS_KEY=your_real_api_key`
  - `PORT=3000` (optional)
4. Start the app:
  - `npm start`
5. Open `http://localhost:3000` in your browser
6. Select a goal, level, and muscle group, then click **Generate Workout**
7. Switch to the **Progress Tracker** to log sets, reps, and weight
8. Watch your charts and stats update in real time

## API Key Safety

- The API key is now stored in `.env` and read only by `server.js`
- Frontend code in `js/script.js` calls `/api/exercises` and never contains the key
- `.gitignore` excludes `.env` so secrets do not get pushed to GitHub

## AI Usage Disclosure

ChatGPT was used to help plan component structure, refactor functions, and generate initial code scaffolding. All code was reviewed, understood, and customized by the developer.


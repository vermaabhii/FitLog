# 🏋️ FitLog – Gym Progress Tracker

> A clean, beginner-friendly web app to log your workouts, track progress over time, and stay motivated — all without any backend or framework.

![FitLog Banner](https://img.shields.io/badge/FitLog-Gym%20Progress%20Tracker-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTYuNSA2LjVINGExIDEgMCAwIDAtMSAxdjlhMSAxIDAgMCAwIDEgMWgyLjVNMTcuNSA2LjVIMjBhMSAxIDAgMCAxIDEgMXY5YTEgMSAwIDAgMS0xIDFoLTIuNU02LjUgOS41SDE3LjVNNi41IDE0LjVIMTcuNU02LjUgNC41djE1TTE3LjUgNC41djE1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsPSJub25lIi8+PC9zdmc+)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Data Storage](#-data-storage)
- [Responsive Design](#-responsive-design)
- [Technical Details](#-technical-details)
- [Keyboard & Accessibility](#-keyboard--accessibility)
- [Browser Support](#-browser-support)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)

---

## 🌟 Overview

**FitLog** is a zero-dependency, client-side web application that helps gym-goers track their workout sessions. Log exercises with weights and reps, visualise progress over time, filter your history, and never lose your data — everything is stored locally in your browser using **LocalStorage**.

Built with only **HTML**, **CSS**, and **Vanilla JavaScript** — no React, no Node.js, no database, no internet connection required.

---

## 🚀 Live Demo

Since FitLog is a pure client-side app, you can run it directly by opening `index.html` in any modern browser. No server or build step needed.

```
📁 FitLog-Gym Progress Tracker/
└── index.html  ← Just open this!
```

---

## ✨ Features

### Core Features

| Feature | Description |
|---|---|
| **Add Workout** | Log exercise name, weight (kg), reps, and date |
| **Workout History** | View all logged entries sorted newest-first by default |
| **Delete Entry** | Remove individual workout entries instantly |
| **Filter by Exercise** | Live search to filter history by exercise name |
| **Sort Options** | Sort by Newest, Oldest, Exercise Name, or Weight |
| **Progress Indicator** | See weight change (▲ +5kg / ▼ -5kg / = Same) vs. previous session |
| **Quick Stats** | Total sessions, unique exercises, most logged, last workout date |
| **Auto Date** | Date field pre-filled with today, but fully editable |
| **LocalStorage** | All data persists across page reloads and browser restarts |
| **Clear All** | Delete entire workout history with a confirmation modal |
| **Toast Notifications** | Instant feedback on add, delete, and clear actions |
| **Autocomplete** | Exercise name input suggests previously used exercises |

### UI / UX Extras

- **Dark gym theme** with deep charcoal backgrounds and vibrant indigo/purple accents
- **Animated background blobs** for a premium visual feel
- **Card-based layout** with glassmorphism-inspired styling
- **Hover micro-animations** on workout cards (slide + glow)
- **Fully responsive** — all screen sizes from 360px → 1600px+
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Print styles** — prints cleanly without UI chrome
- **Reduced motion** — respects `prefers-reduced-motion` OS setting
- **Touch-optimised** — bigger tap targets on mobile devices

---

## 📁 Project Structure

```
FitLog-Gym Progress Tracker/
│
├── index.html      # App shell — HTML structure and semantic markup
├── style.css       # All styling — design tokens, components, responsive breakpoints
├── script.js       # All logic — CRUD, LocalStorage, filtering, sorting, UI updates
└── README.md       # This file
```

The project deliberately avoids build tools, bundlers, or package managers so it stays beginner-friendly and universally openable.

---

## 🏁 Getting Started

### Just Open It

1. Download or clone this repository
2. Navigate to the folder
3. Double-click `index.html` — it opens in your default browser

No `npm install`, no `npm run dev`, no terminal required.

---

## 🧠 How It Works

### Logic Flow

```
Page Load
    │
    ▼
loadWorkouts() ← reads from LocalStorage
    │
    ▼
render() ← builds the workout list + stats
    │
    ├── No workouts? → show empty state
    ├── Filter active? → show filtered results
    └── Show workout cards with progress badges


Add Workout (form submit)
    │
    ├── validateForm() → show inline errors if invalid
    ├── Build workout object { id, exercise, weight, reps, date }
    ├── workouts.unshift(entry) → add to top of array
    ├── saveWorkouts() → JSON.stringify to LocalStorage
    └── render() + showToast()


Delete Workout (click trash icon)
    │
    ├── Remove entry from array by ID
    ├── saveWorkouts() → update LocalStorage
    └── render() + showToast()


Filter / Sort
    │
    ├── filterInput event → update filterQuery, re-render
    └── sortSelect change → update sortMode, re-render


Clear All
    │
    ├── Click "Clear All" → open confirmation modal
    ├── Confirm → workouts = [], saveWorkouts(), render()
    └── Cancel → closeModal()
```

### Progress Detection Logic

For each workout entry displayed, FitLog looks through the entire workout history for **any previous entry with the same exercise name** that has an **earlier date**. It picks the most recent one and compares weights:

```
delta = current.weight - previous.weight

delta > 0  →  ▲ +{delta}kg  (green badge)
delta < 0  →  ▼ {delta}kg   (red badge)
delta = 0  →  = Same        (grey badge)
no prior   →  (no badge)    (first entry)
```

---

## 💾 Data Storage

FitLog uses the browser's **LocalStorage API** to persist data. No data is ever sent to a server.

### Storage Key
```
fitlog_workouts_v1
```

### Data Schema

Each workout is stored as a JSON object in an array:

```json
[
  {
    "id": "lf3k2abc9",
    "exercise": "Bench Press",
    "weight": 85,
    "reps": 10,
    "date": "2026-04-09"
  },
  {
    "id": "lf3k1xyz7",
    "exercise": "Squat",
    "weight": 100,
    "reps": 8,
    "date": "2026-04-08"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID generated from `Date.now()` + random suffix |
| `exercise` | `string` | Exercise name as entered by the user |
| `weight` | `number` | Weight in kilograms |
| `reps` | `number` | Number of repetitions |
| `date` | `string` | ISO date in `YYYY-MM-DD` format |

### Storage Helpers

```js
// Read
JSON.parse(localStorage.getItem('fitlog_workouts_v1')) || []

// Write
localStorage.setItem('fitlog_workouts_v1', JSON.stringify(workouts))
```

> ⚠️ **Note**: LocalStorage is browser and device specific. Data does not sync across devices. If you clear browser data/site data, your workout history will be erased.

---

## 📱 Responsive Design

FitLog is fully responsive across **9 breakpoints** using a mobile-first approach:

| Breakpoint | Width | Layout |
|---|---|---|
| Large Desktop | ≥ 1280px | Wide 2-col, more padding, larger cards |
| Desktop | 1024px–1280px | Standard 2-col, narrower sidebar |
| Tablet Landscape | ≤ 1024px | Sidebar shrinks to 300px |
| Tablet Portrait | ≤ 900px | Stacked single column, stats as 4-col row |
| Large Mobile | ≤ 640px | Full single column, full-width buttons |
| Small Mobile | ≤ 480px | Tighter padding, dot separators hidden |
| Extra Small | ≤ 360px | Minimal header, header stats hidden |
| Touch Devices | `hover:none` | Bigger tap targets (42px delete btn) |
| Reduced Motion | OS setting | All animations disabled |

---

## 🔧 Technical Details

### XSS Prevention

All user-entered content is sanitised before being inserted into the DOM using an `escapeHtml()` utility:

```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

This prevents Cross-Site Scripting (XSS) attacks from malicious exercise names.

### Unique ID Generation

Each workout gets a unique ID that survives array mutation:

```js
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
// Example output: "lf3k2abc9"
```

### Sorting

Sorting is non-destructive — the original `workouts` array is never mutated for display:

```js
function sortWorkouts(arr) {
  const copy = [...arr]; // spread to avoid mutating source
  switch (sortMode) {
    case 'oldest':   return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'exercise': return copy.sort((a, b) => a.exercise.localeCompare(b.exercise));
    case 'weight':   return copy.sort((a, b) => b.weight - a.weight);
    default:         return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
```

### CSS Architecture

Styles follow a strict token-first architecture:

```
:root              → Design tokens (colours, radii, shadows, transitions)
Reset & Base       → Box-sizing, font, overflow
Background Blobs   → Animated ambient gradients
Layout             → App wrapper, header, main grid
Cards              → Shared card + card-header + card-icon system
Form               → Input grid, input wrappers, field errors
Buttons            → btn base + modifiers (primary, danger, ghost)
Quick Stats        → Stats grid and stat boxes
History            → Header, filter controls, search wrapper
Workout List       → Item cards, meta chips, progress badges
Empty States       → Centred empty/no-results prompts
Modal              → Backdrop + modal box
Toast              → Slide-up notifications with dot indicators
Footer / Scrollbar → Minor finishing styles
Responsive (x9)    → Full multi-breakpoint overrides
```

### CSS Custom Properties (Design Tokens)

```css
--bg-deep       #0a0b10   /* Page background  */
--bg-card       #12141f   /* Card surfaces     */
--bg-input      #1c1e2e   /* Input backgrounds */
--accent        #6366f1   /* Indigo — primary  */
--purple        #a855f7   /* Purple — accents  */
--gold          #f59e0b   /* Gold — stats icon */
--green         #22c55e   /* Progress up       */
--red           #ef4444   /* Delete / progress down */
--text-primary  #f1f5f9
--text-muted    #64748b
```

---

## ⌨️ Keyboard & Accessibility

| Key / Action | Behaviour |
|---|---|
| `Tab` | Navigate between all interactive elements |
| `Enter` on form | Submits the Add Workout form |
| `Escape` | Closes the Clear All confirmation modal |
| Form validation | Inline errors shown below invalid fields |
| ARIA labels | All icon-only buttons have `aria-label` |
| `role="list"` | Workout history is semantically a list |
| `aria-live="polite"` | Toast container announced to screen readers |
| `role="dialog"` + `aria-modal` | Confirmation modal correctly identified |
| `aria-labelledby` | All sections labelled by their headings |

---

## 🌐 Browser Support

FitLog uses only stable, widely-supported Web APIs:

| API | Support |
|---|---|
| LocalStorage | All modern browsers (Chrome, Firefox, Safari, Edge) |
| CSS Grid / Flexbox | All modern browsers |
| CSS Custom Properties | All modern browsers |
| `datalist` | All modern browsers |
| `backdrop-filter` | Chrome 76+, Firefox 103+, Safari 9+ |
| `prefers-reduced-motion` | All modern browsers |

> Internet Explorer is **not** supported (EOL since 2022).

---

## 🚀 Future Improvements

Here are features that could be added in future versions:

- [ ] **Charts & Graphs** — Visualise weight progression per exercise using `<canvas>` or SVG
- [ ] **Export to CSV / JSON** — Let users download their workout history
- [ ] **Import from JSON** — Restore data from a backup file
- [ ] **Sets support** — Log multiple sets per exercise in one entry
- [ ] **Rest timer** — Built-in countdown timer between sets
- [ ] **Custom categories** — Tag exercises (Push / Pull / Legs / Cardio)
- [ ] **Personal Records (PRs)** — Highlight all-time best lifts with a 🏆 badge
- [ ] **Dark / Light mode toggle** — Switch between themes
- [ ] **Weekly summary** — "This week you did X sessions" dashboard
- [ ] **PWA support** — Make it installable on mobile as a Progressive Web App
- [ ] **Body weight logging** — Track body weight alongside workout data

---

## 🤝 Contributing

Contributions are welcome! Since this is a frontend-only project, contributions can be as simple as suggesting a UX improvement or fixing a CSS layout bug.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add: my new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style Guidelines

- Use `'use strict'` in all JS
- Keep functions small and single-purpose
- Use JSDoc comments for all functions
- Don't use `innerHTML` with unsanitised user input — always use `escapeHtml()`
- CSS: follow the existing token-first architecture, no magic numbers

---

<div align="center">

Built with 💪 and Vanilla JS &nbsp;|&nbsp; No frameworks. No backend. Just pure web.

**[⬆ Back to Top](#-fitlog--gym-progress-tracker)**

</div>

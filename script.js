/* =========================================================
   FitLog – Gym Progress Tracker  |  script.js
   ========================================================= */

'use strict';

// ── CONSTANTS ────────────────────────────────────────────
const LS_KEY = 'fitlog_workouts_v1';

// ── STATE ─────────────────────────────────────────────────
let workouts = [];       // full workout array
let filterQuery = '';    // current search/filter string
let sortMode = 'newest'; // current sort mode

// ── DOM REFS ──────────────────────────────────────────────
const form          = document.getElementById('workoutForm');
const exNameInput   = document.getElementById('exerciseName');
const weightInput   = document.getElementById('weight');
const repsInput     = document.getElementById('reps');
const dateInput     = document.getElementById('workoutDate');
const filterInput   = document.getElementById('filterInput');
const clearFilterEl = document.getElementById('clearFilter');
const sortSelect    = document.getElementById('sortSelect');
const workoutList   = document.getElementById('workoutList');
const emptyState    = document.getElementById('emptyState');
const noResults     = document.getElementById('noResults');
const resultMeta    = document.getElementById('resultMeta');
const clearAllBtn   = document.getElementById('clearAllBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalCancel   = document.getElementById('modalCancel');
const modalConfirm  = document.getElementById('modalConfirm');
const toastContainer = document.getElementById('toastContainer');
const datalistEl    = document.getElementById('exerciseSuggestions');

// Header counters
const totalWorkoutsEl  = document.getElementById('totalWorkouts');
const totalExercisesEl = document.getElementById('totalExercises');

// Quick stats
const statTotalEl  = document.getElementById('statTotal');
const statUniqueEl = document.getElementById('statUnique');
const statMostEl   = document.getElementById('statMost');
const statLastEl   = document.getElementById('statLast');

// ── LOCALSTORAGE HELPERS ──────────────────────────────────

/**
 * Load workouts from LocalStorage.
 * @returns {Array} Array of workout objects.
 */
function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Save workout array to LocalStorage.
 * @param {Array} data - The workouts array to persist.
 */
function saveWorkouts(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ── DATE UTILITIES ────────────────────────────────────────

/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 * @returns {string}
 */
function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format an ISO date string for display.
 * @param {string} iso - YYYY-MM-DD format string.
 * @returns {string} Human-readable date.
 */
function formatDate(iso) {
  const [yyyy, mm, dd] = iso.split('-');
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ── VALIDATION ────────────────────────────────────────────

/**
 * Validate the add-workout form.
 * @returns {boolean} True if form is valid.
 */
function validateForm() {
  clearErrors();
  let valid = true;

  if (!exNameInput.value.trim()) {
    showError('exerciseError', 'Exercise name is required.');
    valid = false;
  }
  if (!weightInput.value || Number(weightInput.value) < 0) {
    showError('weightError', 'Enter a valid weight (≥ 0).');
    valid = false;
  }
  if (!repsInput.value || Number(repsInput.value) < 1) {
    showError('repsError', 'Enter at least 1 rep.');
    valid = false;
  }
  return valid;
}

/** Clear all inline field errors. */
function clearErrors() {
  ['exerciseError', 'weightError', 'repsError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

/**
 * Display an error message for a form field.
 * @param {string} id  - Element id of the error span.
 * @param {string} msg - Error message text.
 */
function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

// ── SORTING ───────────────────────────────────────────────

/**
 * Sort a copy of the workouts array by the current sort mode.
 * @param {Array} arr - Workouts to sort.
 * @returns {Array} Sorted copy.
 */
function sortWorkouts(arr) {
  const copy = [...arr];
  switch (sortMode) {
    case 'oldest':
      return copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'exercise':
      return copy.sort((a, b) => a.exercise.localeCompare(b.exercise));
    case 'weight':
      return copy.sort((a, b) => b.weight - a.weight);
    case 'newest':
    default:
      return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

// ── PROGRESS DETECTION ────────────────────────────────────

/**
 * For a given workout entry, find the immediately prior entry
 * for the same exercise and compute a weight delta.
 * @param {Object} entry  - Current workout object.
 * @param {number} index  - Index within the *full* workouts array.
 * @returns {{delta: number, prev: number|null}}
 */
function getProgress(entry, index) {
  // Look at all workouts before this one (by date) for the same exercise
  const exercise = entry.exercise.toLowerCase();
  const entryDate = new Date(entry.date);

  const earlier = workouts.filter(w =>
    w.exercise.toLowerCase() === exercise &&
    new Date(w.date) < entryDate,
  );

  if (earlier.length === 0) return { delta: null, prev: null };

  // Sort descending to get most recent previous entry
  earlier.sort((a, b) => new Date(b.date) - new Date(a.date));
  const prev = earlier[0];
  return { delta: entry.weight - prev.weight, prev: prev.weight };
}

// ── RENDER ────────────────────────────────────────────────

/** Render the workout list, filtered and sorted, and update all counts. */
function render() {
  // Filter
  const query = filterQuery.toLowerCase().trim();
  const filtered = query
    ? workouts.filter(w => w.exercise.toLowerCase().includes(query))
    : workouts;

  // Sort
  const sorted = sortWorkouts(filtered);

  // Clear list
  workoutList.innerHTML = '';

  // Empty / no-results states
  if (workouts.length === 0) {
    emptyState.hidden = false;
    noResults.hidden  = true;
    resultMeta.textContent = '';
  } else if (filtered.length === 0 && query) {
    noResults.hidden  = false;
    emptyState.hidden = true;
    resultMeta.textContent = '';
  } else {
    emptyState.hidden = true;
    noResults.hidden  = true;
    resultMeta.textContent = query
      ? `Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${filterQuery}"`
      : `${workouts.length} workout${workouts.length !== 1 ? 's' : ''} logged`;
  }

  // Render rows
  sorted.forEach(entry => {
    // Find original index in workouts array for deletion
    const origIdx = workouts.findIndex(
      w => w.id === entry.id,
    );
    const { delta, prev } = getProgress(entry, origIdx);
    const card = buildWorkoutCard(entry, origIdx, delta, prev);
    workoutList.appendChild(card);
  });

  updateStats();
  updateDatalist();
}

/**
 * Build a single workout card element.
 * @param {Object} entry   - Workout data.
 * @param {number} origIdx - Index in the workouts array (for deletion).
 * @param {number|null} delta - Weight change vs previous entry.
 * @param {number|null} prev  - Previous entry weight.
 * @returns {HTMLElement}
 */
function buildWorkoutCard(entry, origIdx, delta, prev) {
  const li = document.createElement('div');
  li.className = 'workout-item';
  li.setAttribute('role', 'listitem');
  li.dataset.id = entry.id;

  // Progress badge HTML
  let badgeHTML = '';
  if (delta !== null) {
    if (delta > 0) {
      badgeHTML = `<span class="progress-badge progress-badge--up" title="Improvement vs previous session">▲ +${delta}kg</span>`;
    } else if (delta < 0) {
      badgeHTML = `<span class="progress-badge progress-badge--down" title="Decrease vs previous session">▼ ${delta}kg</span>`;
    } else {
      badgeHTML = `<span class="progress-badge progress-badge--same" title="Same as previous session">= Same</span>`;
    }
  }

  const prevNote = (prev !== null)
    ? `<span class="prev-note">Previous: ${prev}kg</span>`
    : '';

  li.innerHTML = `
    <div class="workout-main">
      <div class="workout-name-row">
        <span class="workout-name">${escapeHtml(entry.exercise)}</span>
        ${badgeHTML}
      </div>
      <div class="workout-meta">
        <div class="meta-chip">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M3 13h2M19 13h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <strong>${entry.weight}kg</strong>
        </div>
        <div class="meta-sep"></div>
        <div class="meta-chip">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <strong>${entry.reps}</strong> reps
        </div>
        ${prevNote}
      </div>
      <div class="workout-date">
        <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        ${formatDate(entry.date)}
      </div>
    </div>
    <button
      class="delete-btn"
      aria-label="Delete ${escapeHtml(entry.exercise)} workout"
      data-idx="${origIdx}"
      title="Delete this entry"
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `;

  // Attach delete listener
  li.querySelector('.delete-btn').addEventListener('click', () => {
    deleteWorkout(entry.id);
  });

  return li;
}

/** Update header chips and quick stats panel. */
function updateStats() {
  const total  = workouts.length;
  const unique = [...new Set(workouts.map(w => w.exercise.toLowerCase()))].length;

  // Header
  totalWorkoutsEl.textContent  = total;
  totalExercisesEl.textContent = unique;

  // Quick stats panel
  statTotalEl.textContent  = total;
  statUniqueEl.textContent = unique;

  // Most logged exercise
  if (total === 0) {
    statMostEl.textContent = '—';
    statLastEl.textContent = '—';
  } else {
    const freq = {};
    workouts.forEach(w => {
      const k = w.exercise.toLowerCase();
      freq[k] = (freq[k] || 0) + 1;
    });
    const mostEntry = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    statMostEl.textContent = capitalize(mostEntry[0]) + ` (×${mostEntry[1]})`;

    // Last workout date
    const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    statLastEl.textContent = formatDate(sorted[0].date);
  }
}

/** Refresh datalist suggestions for exercise name autocomplete. */
function updateDatalist() {
  const names = [...new Set(workouts.map(w => capitalize(w.exercise)))];
  datalistEl.innerHTML = names.map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
}

// ── CRUD ──────────────────────────────────────────────────

/** Handle form submission to add a workout. */
function handleAddWorkout(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const entry = {
    id:       generateId(),
    exercise: exNameInput.value.trim(),
    weight:   Number(weightInput.value),
    reps:     Number(repsInput.value),
    date:     dateInput.value || getTodayISO(),
  };

  workouts.unshift(entry);
  saveWorkouts(workouts);
  render();
  form.reset();
  dateInput.value = getTodayISO();
  showToast(`✅ "${capitalize(entry.exercise)}" added!`, 'success');
  exNameInput.focus();
}

/**
 * Delete a workout by its unique ID.
 * @param {string} id - Workout ID to remove.
 */
function deleteWorkout(id) {
  const idx = workouts.findIndex(w => w.id === id);
  if (idx === -1) return;
  const name = workouts[idx].exercise;
  workouts.splice(idx, 1);
  saveWorkouts(workouts);
  render();
  showToast(`🗑️ "${capitalize(name)}" deleted.`, 'info');
}

/** Clear all workouts after modal confirmation. */
function clearAllWorkouts() {
  workouts = [];
  saveWorkouts(workouts);
  render();
  closeModal();
  showToast('🔄 All workouts cleared.', 'info');
}

// ── FILTER & SORT ─────────────────────────────────────────

filterInput.addEventListener('input', () => {
  filterQuery = filterInput.value;
  clearFilterEl.classList.toggle('visible', filterQuery.length > 0);
  render();
});

clearFilterEl.addEventListener('click', () => {
  filterInput.value = '';
  filterQuery = '';
  clearFilterEl.classList.remove('visible');
  filterInput.focus();
  render();
});

sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  render();
});

// ── MODAL ─────────────────────────────────────────────────

function openModal() {
  modalBackdrop.hidden = false;
  modalConfirm.focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
}

clearAllBtn.addEventListener('click', () => {
  if (workouts.length === 0) {
    showToast('No workouts to clear.', 'info');
    return;
  }
  openModal();
});
modalCancel.addEventListener('click', closeModal);
modalConfirm.addEventListener('click', clearAllWorkouts);
modalBackdrop.addEventListener('click', e => {
  if (e.target === modalBackdrop) closeModal();
});

// Keyboard: Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal();
});

// ── TOAST NOTIFICATIONS ───────────────────────────────────

/**
 * Show a toast notification.
 * @param {string} msg  - Message text.
 * @param {'success'|'error'|'info'} type - Toast style.
 */
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span class="toast-dot"></span>${escapeHtml(msg)}`;
  toastContainer.appendChild(el);

  // Auto-remove after animation
  setTimeout(() => el.remove(), 3000);
}

// ── UTILITY ───────────────────────────────────────────────

/**
 * Generate a short unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Capitalize first letter of each word.
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ── INIT ──────────────────────────────────────────────────

/** Initialize the application on page load. */
function init() {
  workouts = loadWorkouts();
  dateInput.value = getTodayISO();
  form.addEventListener('submit', handleAddWorkout);
  render();
}

init();

const STORAGE_KEY = 'pieFractions.saveData.v1';

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Save data unavailable, starting fresh:', err.message);
    return null;
  }
}

export function saveProgress(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.warn('Could not save progress:', err.message);
    return false;
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear saved progress:', err.message);
  }
}

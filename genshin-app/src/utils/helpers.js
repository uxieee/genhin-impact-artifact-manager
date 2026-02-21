import { STAT_LABELS } from './constants';

/**
 * Format a stat value for display
 */
export function formatStat(key, value) {
    if (!key || value === undefined) return '';
    // Percentage stats
    if (key.endsWith('_')) {
        return `${(value).toFixed(1)}%`;
    }
    // Flat stats
    return Math.round(value).toLocaleString();
}

/**
 * Get display name for a stat key
 */
export function getStatLabel(key) {
    return STAT_LABELS[key] || key;
}

/**
 * Convert a set name slug to display name
 */
export function formatSetName(slug) {
    if (!slug) return '';
    return slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .replace(/S /g, "'s ");
}

/**
 * Generate a unique ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2, 11);
}

/**
 * Debounce helper
 */
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

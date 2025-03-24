/**
 * Calendula NPM Package Entry Point
 * 
 * This file serves as the main entry point for importing the Calendula component
 * when the package is installed via npm.
 * 
 * @version 1.0.3
 * @license MIT
 */

// Import the required modules
const Calendar = require('./calendar.js');
const Translations = require('./translations.js');

// Check if we're in a Node.js environment
if (typeof window === 'undefined') {
  // In Node.js, we can provide a simplified implementation for SSR
  global.window = global;
  global.document = {
    createElement: () => ({
      className: '',
      style: {},
      appendChild: () => {},
      addEventListener: () => {}
    }),
    querySelector: () => null,
    addEventListener: () => {}
  };
}

// Export everything needed for the component
module.exports = {
  Calendula: Calendar,
  TRANSLATIONS: Translations
};

// Also export Calendula as default for ES6 import
module.exports.default = Calendar;
# Simple DateTime Picker

A lightweight, customizable, and multilingual date and time picker component built with vanilla JavaScript. 
No dependencies required!

[Demo, examples ✿](https://isitup.github.io/calendula/)

![Calendar Preview](calendula.jpg)

## Features

- Pure JavaScript implementation - no dependencies
- Date and time selection with configurable time steps
- 18 languages supported out of the box
- Light and dark themes included
- Mobile-friendly design
- Customizable date formats
- Easy integration with any project

## Installation

### NPM

```bash
npm install calendular
```

### CDN (or self-hosted)

Include the necessary files in your HTML:

```html
<!-- Light Theme (default) -->
<link rel="stylesheet" href="https://isitup.github.io/calendula/styles.css">
<script src="https://isitup.github.io/calendula/translations.js"></script>
<script src="https://isitup.github.io/calendula/calendar.js"></script>
```

### Theme Options

The component comes with both light and dark themes using CSS variables. To use the dark theme, include both the base styles and the dark theme override:

```html
<!-- Light Theme (base styles) -->
<link rel="stylesheet" href="https://isitup.github.io/calendula/styles.css">
<!-- Dark Theme (overrides variables) -->
<!--<link rel="stylesheet" href="https://isitup.github.io/calendula/dark-theme.css">-->
<script src="https://isitup.github.io/calendula/translations.js"></script>
<script src="https://isitup.github.io/calendula/calendar.js"></script>
```

You can also create your own themes by overriding the CSS variables:

```css
:root {
  /* Base colors */
  --calendula-bg-primary: #your-color;
  --calendula-bg-secondary: #your-color;
  /* And other variables... */
}
```

## Usage

### With NPM/ES modules

```javascript
// Import the component
import { Calendula } from 'calendular';
// Import the light theme (required base styles)
import 'calendular/styles.css';
// Import the dark theme (optional override)
// import 'calendular/dark-theme.css';

// Initialize the component on an input element
document.addEventListener('DOMContentLoaded', function() {
  const picker = new Calendula(document.getElementById('myDateInput'), {
    showTime: true,
    language: 'en'
  });
});
```

### With script tags

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://isitup.github.io/calendula/styles.css">
</head>
<body>
  <form>
    <label for="birthdate">Date of Birth:</label>
    <input type="text" id="birthdate" name="birthdate" placeholder="DD.MM.YYYY">
    
    <label for="appointment">Appointment:</label>
    <input type="text" id="appointment" name="appointment" class="date-input" placeholder="DD.MM.YYYY HH:MM">
  </form>

  <script src="https://isitup.github.io/calendula/translations.js"></script>
  <script src="https://isitup.github.io/calendula/calendar.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize date picker on first input (date only)
      const datePicker = new Calendula(document.getElementById('birthdate'), {
        showTime: false
      });
      
      // Initialize date picker on second input (date and time)
      const dateTimePicker = new Calendula(document.getElementById('appointment'), {
        showTime: true,
        minuteStep: 5
      });
    });
  </script>
</body>
</html>
```

## Configuration Options

The component accepts the following options:

```javascript
// Pass an input element selector or DOM element as the first parameter
const picker = new Calendula(document.getElementById('dateInput'), {
  // Show time picker (default: false)
  showTime: true,
  
  // Show seconds in time picker (default: true)
  showSeconds: true,
  
  // Time step in minutes (default: 1)
  minuteStep: 5,
  
  // Initial date to display (default: current date)
  initialDate: new Date(),
  
  // Callback when date changes
  onChange: function(date) {
    console.log('Selected date:', date);
  },
  
  // Date format locale (default: based on browser locale)
  dateFormat: 'en-US',
  
  // UI language (default: based on browser language)
  language: 'en'
});
```

## Supported Languages

The component supports the following languages:

- English (en)
- German (de)
- French (fr)
- Spanish (es)
- Russian (ru)
- Ukrainian (uk)
- Serbian (sr)
- Turkish (tr)
- Arabic (ar)
- Chinese (zh)
- Hindi (hi)
- Japanese (ja)
- Korean (ko)
- Portuguese (pt)
- Italian (it)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)

## API Methods

```javascript
// Get the currently selected date
const selectedDate = picker.getSelectedDate();

// Set a new date programmatically
picker.setDate(new Date(2025, 0, 1));

// Update configuration options
picker.setConfig({
  showTime: true,
  language: 'fr'
});

// Show the date picker programmatically
picker.show();

// Hide the date picker programmatically
picker.hide();
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

MIT License - see LICENSE file for details.
/**
 * Calendula - Date and Time Picker Component
 * Creates an interactive calendar with time selection in the specified container
 * 
 * @version 1.0.3
 * @license MIT
 */

// Use IIFE pattern to avoid polluting global scope
(function(global) {

/**
 * Calendula class implementation
 */
class Calendula {
  /**
   * Creates an instance of Calendula
   * @param {string|HTMLElement} inputElement - Selector or DOM element of the input field
   * @param {Object} options - Configuration options
   */
  constructor(inputElement, options = {}) {
    // Get the input element
    const input = typeof inputElement === 'string'
      ? document.querySelector(inputElement)
      : inputElement;

    if (!input || !(input instanceof HTMLInputElement)) {
      throw new Error('Calendula: Input element not found or not an input element');
    }

    // Set the input as the inputField and its parent as the container
    this.container = input.parentNode;
    
    if (!this.container) {
      throw new Error('Calendula: Input element must have a parent node');
    }

    // Load translations from external file
    this.translations = typeof CALENDULA_TRANSLATIONS !== 'undefined' ? CALENDULA_TRANSLATIONS : {};

    // Default settings
    this.config = {
      showTime: options.showTime !== undefined ? options.showTime : false,
      showSeconds: options.showSeconds !== undefined ? options.showSeconds : true,
      minuteStep: options.minuteStep || 1,
      initialDate: options.initialDate || new Date(),
      inputField: input, // Use the provided input element directly
      onChange: options.onChange || null,
      dateFormat: options.dateFormat || null, // Date format (for example, 'YYYY-MM-DD')
      language: options.language || this.detectBrowserLanguage(), // Interface language
      timezone: options.timezone || null, // Timezone for displaying dates (e.g., 'Europe/London', 'America/New_York')
      allowEmpty: options.allowEmpty !== undefined ? options.allowEmpty : false // Allow empty input values
    };

    // Internal state
    this.state = {
      currentDate: new Date(this.config.initialDate),
      selectedDate: new Date(this.config.initialDate),
      selectedHour: this.config.initialDate.getHours(),
      selectedTenMinute: Math.floor(this.config.initialDate.getMinutes() / 10) * 10,
      selectedMinute: this.config.initialDate.getMinutes() % 10,
      selectedSecond: this.config.initialDate.getSeconds(),
      cursorPosition: 0
    };

    // Initialize month names and abbreviations from translations
    const lang = this.getLanguage();
    this.monthNames = this.translations[lang].monthNames;
    this.monthAbbreviations = this.translations[lang].monthAbbreviations;
    this.weekdayNames = this.translations[lang].weekdayNames;

    // Initialize component
    this.init();
  }

  /**
   * Detects the user's browser language
   * @returns {string} Language code
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    // Extract just the language code (e.g., "en-US" -> "en")
    const lang = browserLang.split('-')[0].toLowerCase();
    
    // Check if the language is supported
    if (this.isSupportedLanguage(lang)) {
      return lang;
    }
    
    // Default to English if language is not supported
    return 'en';
  }
  
  /**
   * Checks if a language is supported
   * @param {string} lang - Language code
   * @returns {boolean} True if supported
   */
  isSupportedLanguage(lang) {
    return typeof this.translations[lang] !== 'undefined';
  }
  
  /**
   * Gets the current language
   * @returns {string} Language code
   */
  getLanguage() {
    // Use the configured language or English as fallback
    return this.isSupportedLanguage(this.config.language) ? this.config.language : 'en';
  }
  

  /**
   * Gets translation for a specific key
   * @param {string} key - Translation key
   * @returns {string} Translated text
   */
  getTranslation(key) {
    const lang = this.getLanguage();
    const sections = key.split('.');
    
    let result = this.translations[lang];
    for (const section of sections) {
      if (result && result[section]) {
        result = result[section];
      } else {
        // Fallback to English if translation not found
        let fallback = this.translations['en'];
        for (const fbSection of sections) {
          if (fallback && fallback[fbSection]) {
            fallback = fallback[fbSection];
          } else {
            return key; // Return the key if translation not found even in English
          }
        }
        return fallback;
      }
    }
    
    return result;
  }

  /**
   * Initialize the component
   */
  init() {
    // Create DOM structure
    this.createElements();

    // Find DOM elements
    this.findElements();

    // Render components
    this.renderCalendarDays();
    this.renderHours();
    this.renderTenMinutes();
    this.renderMinutes();
    this.renderSeconds();

    // Apply configuration settings
    this.applyConfig();

    // Update input field
    this.updateDateInput();
    
    // Initialize clear button visibility
    this.updateClearButtonVisibility();

    // Bind event handlers
    this.bindEvents();
  }

  /**
   * Creates the calendar DOM structure
   */
  createElements() {
    // Since we're always working with an existing input, set dateInput
    this.dateInput = this.config.inputField;
    
    // Add class to input for styling consistency
    if (!this.dateInput.classList.contains('calendula-date-input')) {
      this.dateInput.classList.add('calendula-date-input');
    }

    // Main calendar container
    const dateTimePicker = document.createElement('div');
    dateTimePicker.className = 'calendula-date-time-picker';

    // Container for calendar
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendula-calendar-container';

    // Calendar header with month navigation
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendula-calendar-header';
    calendarHeader.innerHTML = `
      <div class="calendula-month-nav">
        <button class="calendula-prev-month" tabindex="-1"><span class="calendula-nav-arrow calendula-arrow-left"></span></button>
        <div class="calendula-month-year-selector">
          <span class="calendula-month-title"></span>
          <span class="calendula-year-title"></span>
        </div>
        <button class="calendula-next-month" tabindex="-1"><span class="calendula-nav-arrow calendula-arrow-right"></span></button>
      </div>
      <div class="calendula-month-selector" style="display: none;"></div>
      <div class="calendula-year-selector" style="display: none;"></div>
    `;
    
    // Add clear button if allowEmpty is enabled
    if (this.config.allowEmpty) {
      const clearButtonContainer = document.createElement('div');
      clearButtonContainer.className = 'calendula-clear-container';
      
      const clearButton = document.createElement('button');
      clearButton.className = 'calendula-clear-button';
      clearButton.textContent = this.getTranslation('buttons.clear') || 'Clear';
      clearButton.tabIndex = '-1';
      
      clearButtonContainer.appendChild(clearButton);
      calendarHeader.appendChild(clearButtonContainer);
    }

    // Grid for calendar days
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendula-calendar-grid';

    // Container for time
    const timeContainer = document.createElement('div');
    timeContainer.className = 'calendula-time-container';

    // Hours section
    const hoursSection = document.createElement('div');
    hoursSection.className = 'calendula-time-section';
    hoursSection.innerHTML = `
      <div class="calendula-time-title">${this.getTranslation('timeLabels.hours')}</div>
      <div class="calendula-time-grid calendula-hours-grid"></div>
    `;

    // Minutes section
    const minutesSection = document.createElement('div');
      minutesSection.className = 'calendula-time-section';
    minutesSection.innerHTML = `
      <div class="calendula-time-title">${this.getTranslation('timeLabels.minutes')}</div>
      <div class="calendula-time-section-container">
        <div class="calendula-time-title" style="font-size: 12px; margin-top: 8px;">${this.getTranslation('timeLabels.tens')}</div>
        <div class="calendula-time-grid calendula-ten-minutes-grid"></div>
        <div class="calendula-time-title" style="font-size: 12px; margin-top: 8px;">${this.getTranslation('timeLabels.units')}</div>
        <div class="calendula-time-grid calendula-minutes-grid"></div>
      </div>
    `;

    // Seconds section
    const secondsSection = document.createElement('div');
    secondsSection.className = 'calendula-time-section';
    secondsSection.innerHTML = `
      <div class="calendula-time-title">${this.getTranslation('timeLabels.seconds')}</div>
      <div class="calendula-time-grid calendula-seconds-grid"></div>
    `;

    // Assemble DOM structure
    calendarContainer.appendChild(calendarHeader);
    calendarContainer.appendChild(calendarGrid);

    timeContainer.appendChild(hoursSection);
    timeContainer.appendChild(minutesSection);
    timeContainer.appendChild(secondsSection);

    dateTimePicker.appendChild(calendarContainer);
    dateTimePicker.appendChild(timeContainer);

    // Create a wrapper div for positioning the date picker
    const pickerWrapper = document.createElement('div');
    pickerWrapper.className = 'calendula-date-picker-wrapper';
    
    // Create a wrapper around the input element to maintain relative positioning
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'calendula-date-input-wrapper';
    inputWrapper.style.position = 'relative';
    
    // Replace the input with the wrapper containing the input
    this.container.insertBefore(inputWrapper, this.dateInput);
    inputWrapper.appendChild(this.dateInput);
    
    // Add clear button if allowEmpty is enabled
    if (this.config.allowEmpty) {
      const clearInputButton = document.createElement('button');
      clearInputButton.className = 'calendula-clear-input';
      clearInputButton.innerHTML = '×';
      clearInputButton.setAttribute('type', 'button');
      clearInputButton.setAttribute('tabindex', '-1');
      clearInputButton.setAttribute('aria-label', this.getTranslation('buttons.clear') || 'Clear');
      
      // Add to the input wrapper
      inputWrapper.appendChild(clearInputButton);
    }
    
    // Append the picker wrapper to the input wrapper
    inputWrapper.appendChild(pickerWrapper);
    
    // Append the date picker to the wrapper
    pickerWrapper.appendChild(dateTimePicker);
    
    // Always ensure the date picker is initially hidden
    dateTimePicker.style.display = 'none';
    
    // Save references to created elements
    this.datePickerElement = dateTimePicker;
    this.pickerWrapper = pickerWrapper;
    this.inputWrapper = inputWrapper;
  }

  /**
   * Finds DOM elements
   */
  findElements() {
    this.elements = {
      dateInput: this.dateInput,
      monthTitle: this.inputWrapper.querySelector('.calendula-month-title'),
      yearTitle: this.inputWrapper.querySelector('.calendula-year-title'),
      prevMonthBtn: this.inputWrapper.querySelector('.calendula-prev-month'),
      nextMonthBtn: this.inputWrapper.querySelector('.calendula-next-month'),
      calendarGrid: this.inputWrapper.querySelector('.calendula-calendar-grid'),
      monthSelector: this.inputWrapper.querySelector('.calendula-month-selector'),
      yearSelector: this.inputWrapper.querySelector('.calendula-year-selector'),
      hoursGrid: this.inputWrapper.querySelector('.calendula-hours-grid'),
      tenMinutesGrid: this.inputWrapper.querySelector('.calendula-ten-minutes-grid'),
      minutesGrid: this.inputWrapper.querySelector('.calendula-minutes-grid'),
      secondsGrid: this.inputWrapper.querySelector('.calendula-seconds-grid'),
      clearButton: this.inputWrapper.querySelector('.calendula-clear-button'),
      clearInputButton: this.inputWrapper.querySelector('.calendula-clear-input')
    };
  }

  /**
   * Applies settings to the interface
   */
  applyConfig() {
    // Manage time container visibility
    const timeContainer = this.datePickerElement.querySelector('.calendula-time-container');
    if (timeContainer) {
      timeContainer.style.display = this.config.showTime ? 'block' : 'none';
    }

    // Manage seconds visibility
    const secondsSection = this.datePickerElement.querySelector('.calendula-time-section:last-child');
    if (secondsSection) {
      secondsSection.style.display = this.config.showSeconds ? 'block' : 'none';
    }

    // Manage minutes display
    const minuteStep = this.config.minuteStep;

    // Find minute elements
    const minutesSection = this.datePickerElement.querySelector('.calendula-time-section:nth-child(2)');
    if (!minutesSection) return;

    const minuteSectionContainer = minutesSection.querySelector('.calendula-time-section-container');
    if (!minuteSectionContainer) return;

    const minutesTitle = minutesSection.querySelector('.calendula-time-title');
    const tenMinutesTitle = minuteSectionContainer.querySelector('.calendula-time-title:nth-child(1)');
    const minutesSubtitle = minuteSectionContainer.querySelector('.calendula-time-title:nth-child(3)');

    const tenMinutesGrid = this.elements.tenMinutesGrid;
    const minutesGrid = this.elements.minutesGrid;

    if (minuteStep === 1) {
      // For standard step, show both minute blocks
      minutesTitle.textContent = 'Minutes';

      // Show all components
      tenMinutesTitle.style.display = 'block';
      tenMinutesGrid.style.display = 'grid';
      minutesSubtitle.style.display = 'block';

      // Grid configuration
      tenMinutesGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
      tenMinutesGrid.style.gridTemplateRows = 'repeat(1, 1fr)';
      minutesGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
      minutesGrid.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
      // For step 5 or 10, use one grid for all minutes
      minutesTitle.textContent = 'Minutes';

      // Hide tens components
      tenMinutesTitle.style.display = 'none';
      tenMinutesGrid.style.display = 'none';
      minutesSubtitle.style.display = 'none';

      // Configure grid based on step
      if (minuteStep === 5) {
        // Step 5 minutes: 12 buttons (0-55) in a 6x2 grid
        minutesGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
        minutesGrid.style.gridTemplateRows = 'repeat(2, 1fr)';
      } else if (minuteStep === 10) {
        // Step 10 minutes: 6 buttons (0-50) in a 6x1 grid
        minutesGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
        minutesGrid.style.gridTemplateRows = 'repeat(1, 1fr)';
      }
    }
  }

  /**
   * Binds event handlers
   */
  bindEvents() {
    // Calendar navigation
    this.elements.prevMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from reaching document
      this.changeMonth(-1);
    });
    this.elements.nextMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from reaching document
      this.changeMonth(1);
    });
    
    // Month and year selection dialogs
    this.elements.monthTitle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from reaching document
      this.showMonthSelector();
    });
    this.elements.yearTitle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from reaching document
      this.showYearSelector();
    });
    
    // Clear date button (if exists)
    if (this.elements.clearButton) {
      this.elements.clearButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from reaching document
        this.clearDate();
        this.hideDatePicker();
      });
    }

    // Show calendar when clicking on input field
    this.elements.dateInput.addEventListener('click', (e) => {
      this.state.cursorPosition = e.target.selectionStart;
      setTimeout(() => this.showDatePicker(), 0); // Delay to ensure the DOM is ready
      e.stopPropagation(); // Prevent immediate hiding
    });
    
    // Show calendar when focusing on input field
    this.elements.dateInput.addEventListener('focus', (e) => {
      if (!this.state.cursorPosition) {
        e.target.selectionStart = 0;
        e.target.selectionEnd = 0;
        this.state.cursorPosition = 0;
      }
      setTimeout(() => this.showDatePicker(), 0); // Delay to ensure the DOM is ready
    });

    // Handle key presses for digit overwrite on desktop
    this.elements.dateInput.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Handle input event for mobile devices and as a fallback
    this.elements.dateInput.addEventListener('input', (e) => {
      // Update clear button visibility whenever input changes
      this.updateClearButtonVisibility();
      
      // On mobile, especially Android, the input event will fire when text is entered
      if (this.isMobileDevice()) {
        // On mobile, handle input differently
        this.handleMobileInput(e);
      }
    });

    // Handle keyup events for cursor tracking and Enter key
    this.elements.dateInput.addEventListener('keyup', (e) => {
      // Update cursor position on any key
      this.state.cursorPosition = e.target.selectionStart;
      
      // Apply changes on Enter
      if (e.key === 'Enter') {
        this.handleInputChange();
        this.hideDatePicker();
      }
      
      // Hide on Escape
      if (e.key === 'Escape') {
        this.hideDatePicker();
      }
    });

    // Handle text selection with mouse
    this.elements.dateInput.addEventListener('mouseup', (e) => {
      setTimeout(() => {
        this.state.cursorPosition = e.target.selectionStart;
      }, 0);
      e.stopPropagation(); // Prevent immediate hiding
    });
    
    // Handle paste event
    this.elements.dateInput.addEventListener('paste', (e) => {
      // Prevent default paste behavior
      e.preventDefault();
      
      // Get pasted content
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text');
      
      // Filter out non-digits
      const onlyDigits = pastedText.replace(/\D/g, '');
      
      if (onlyDigits.length > 0) {
        // Handle digit replacement at cursor position
        this.overwriteDigitsAtCursor(onlyDigits);
      }
    });
    
    // Add event handler for clear input button
    if (this.elements.clearInputButton) {
      this.elements.clearInputButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from reaching document
        this.clearDate();
      });
    }
    
    // Hide datepicker when clicking outside
    document.addEventListener('click', () => {
      this.hideDatePicker();
    });
    
    // Prevent hiding when clicking inside the date picker
    this.datePickerElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent click from reaching document
    });
    
    // Update calendar layout on window resize
    window.addEventListener('resize', () => {
      if (this.isDatePickerVisible()) {
        this.updateDatePickerPosition();
      }
    });
  }

  /**
   * Detects if the user is on a mobile device
   * @returns {boolean} True if on mobile device
   */
  isMobileDevice() {
    // Check for touch capability (most reliable way to detect mobile devices)
    const hasTouchScreen = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    
    // Check for small screen size (max-width: 540px)
    const hasSmallScreen = window.matchMedia('(max-width: 540px)').matches;
    
    // Check for mobile user agent (less reliable but still useful)
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Return true if any of the above conditions are met
    return hasTouchScreen || (hasSmallScreen && mobileUserAgent);
  }

  /**
   * Handles input events for mobile devices
   * @param {Event} e - Input event
   */
  handleMobileInput(e) {
    const input = this.elements.dateInput;
    const value = input.value;
    const cursorPos = input.selectionStart;

    // Get the expected formatted length based on configuration
    const format = this.getFormatString();
    let expectedLength = format.length; // For example, length of DD.MM.YYYY

    // Calculate difference between actual length and expected length
    const lengthDiff = value.length - expectedLength;

    const signs = format.replace(/[^a-zA-Z]/g, '');

    // If no difference, or deletion occurred (negative difference), reset and handle normally
    if (lengthDiff <= 0) {
      // Get only the digits from the input value
      const digits = value.replace(/\D/g, '');

      // If there are no digits, reset to default
      if (digits.length === 0) {
        this.updateDateInput();
        return;
      }

      const actualDiff = signs.length - digits.length
      const zeros = '0'.repeat(actualDiff)
      const valueWithAddedZeros = value.substring(0, cursorPos) + zeros + value.substring(cursorPos)
      const digitsWithZeros = valueWithAddedZeros.replace(/\D/g, '');

      // Update input with the formatted version
      this.updateInputWithDigits(input, digitsWithZeros);
      
      // Restore cursor position
      setTimeout(() => {
        input.selectionStart = cursorPos;
        input.selectionEnd = cursorPos;
        this.state.cursorPosition = cursorPos;
      }, 0);
      
      return;
    }
    
    // There's extra content - extract the characters to be inserted
    // Calculate start position for extraction (before the cursor)
    const extractStart = Math.max(0, cursorPos - lengthDiff);
    
    // Extract the substring that contains the added characters
    const extractedChars = value.substring(extractStart, cursorPos);
    
    // Get only digits from the extracted characters
    const digitsToInsert = extractedChars.replace(/\D/g, '');
    
    // If no digits to insert, exit early
    if (!digitsToInsert) {
      // Reset to the properly formatted value
      const digits = value.replace(/\D/g, '');
      this.updateInputWithDigits(input, digits);
      
      // Restore cursor position
      setTimeout(() => {
        input.selectionStart = cursorPos;
        input.selectionEnd = cursorPos;
        this.state.cursorPosition = cursorPos;
      }, 0);
      
      return;
    }
    
    // Get the value from the current value (without the extra characters)
    const originalValue = value.substring(0, cursorPos-lengthDiff) + value.substring(cursorPos)
    // Get the original digits from the original value (without the extra characters)
    const originalDigitsWithoutInserted = originalValue.replace(/\D/g, '');
    
    // Get a clean formatted template
    let cleanTemplate = '';
    if (originalDigitsWithoutInserted.length === 0) {
      // If no digits, use the default template
      cleanTemplate = this.getDefaultFormattedDate();
    } else {
      // Otherwise, format the existing digits
      cleanTemplate = this.formatDigitsToDateString(originalDigitsWithoutInserted);
    }
    
    // Start cursor at the current position, adjusted for the clean template
    let newCursorPos = extractStart;
    
    // Create the result by overwriting digits one by one at cursor position
    let result = cleanTemplate;

    // Iterate through each digit to insert
    for (let i = 0; i < digitsToInsert.length; i++) {
      const digit = digitsToInsert[i];
      
      // Skip non-digits (shouldn't happen since we filtered them out, but just in case)
      if (!/\d/.test(digit)) continue;
      
      // Find the next digit position at or after the cursor
      while (newCursorPos < result.length && !/\d/.test(result[newCursorPos])) {
        newCursorPos++;
      }
      
      // If we've reached the end, break
      if (newCursorPos >= result.length) break;
      
      // Replace the digit at the current position
      result = 
        result.substring(0, newCursorPos) + 
        digit + 
        result.substring(newCursorPos + 1);
      
      // Move cursor to next position
      newCursorPos++;
      
      // Skip over delimiters
      while (newCursorPos < result.length && !/\d/.test(result[newCursorPos])) {
        newCursorPos++;
      }
    }
    
    // Update the input with the new value
    input.value = result;
    
    // Update the calendar with the new date
    this.handleInputChange(false);
    
    // Set the cursor position after the last inserted digit
    setTimeout(() => {
      input.selectionStart = newCursorPos;
      input.selectionEnd = newCursorPos;
      this.state.cursorPosition = newCursorPos;
    }, 0);
    
    // Prevent default handling
    e.preventDefault();
  }
  
  /**
   * Updates input field with formatted date string from digits
   * @param {HTMLInputElement} input - The input element
   * @param {string} digits - String of digits to format
   */
  updateInputWithDigits(input, digits) {
    // Format the digits to a date string
    const formattedValue = this.formatDigitsToDateString(digits);
    
    // Update the input value
    input.value = formattedValue;
    
    // Update the calendar with the new date
    this.handleInputChange(false);
  }
  
  /**
   * Formats digits into a date string
   * @param {string} digits - String of digits to format
   * @returns {string} Formatted date string
   */
  formatDigitsToDateString(digits) {
    const format = this.getFormatString()
    let digitIndex = 0;
    let formattedValue = '';
    for (let i = 0; i < format.length; i++) {
      const symbol = format.charAt(i);
      if ('YMDHmS'.includes(symbol)) {
        formattedValue += digits[digitIndex];
        digitIndex++;
      } else {
        formattedValue += symbol;
      }
    }

    return formattedValue;
  }
  
  /**
   * Gets a default formatted date with zeros
   * @returns {string} Default formatted date
   */
  getDefaultFormattedDate() {
    let formattedValue = '00.00.0000';
    if (this.config.showTime) {
      formattedValue += ' 00:00';
      if (this.config.showSeconds) {
        formattedValue += ':00';
      }
    }
    return formattedValue;
  }

  /**
   * Key press handler for the input field
   */
  handleKeyDown(e) {
    // Process only printable characters and Backspace/Delete
    const isPrintableChar = e.key.length === 1;
    const isDeleteOrBackspace = e.key === 'Delete' || e.key === 'Backspace';
    
    // List of navigation keys we want to allow default behavior for
    const isNavigationKey = ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key);
    
    // Allow default behavior for navigation keys
    if (isNavigationKey) {
      // We'll update cursor position in the keyup handler
      return;
    }

    // Ignore non-printable characters except Backspace/Delete
    if (!isPrintableChar && !isDeleteOrBackspace) {
      return;
    }

    // Allow combinations with modifiers like Ctrl+Home, Ctrl+A, etc.
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    e.preventDefault(); // Cancel default behavior

    const input = this.elements.dateInput;
    // Always get the current cursor position directly from the input element
    const cursorPos = input.selectionStart;
    // Update our internal state to match
    this.state.cursorPosition = cursorPos;
    const currentValue = input.value;

    // Handle Backspace
    if (e.key === 'Backspace') {
      let prevDigitPos = cursorPos - 1;
      while (prevDigitPos >= 0 && !/\d/.test(currentValue[prevDigitPos])) {
        prevDigitPos--;
      }

      if (prevDigitPos >= 0) {
        const newValue =
          currentValue.substring(0, prevDigitPos) +
          '0' +
          currentValue.substring(prevDigitPos + 1);

        input.value = newValue;
        input.selectionStart = prevDigitPos;
        input.selectionEnd = prevDigitPos;
        this.state.cursorPosition = prevDigitPos;

        this.handleInputChange(false);
      }
      return;
    }

    // Handle Delete
    if (e.key === 'Delete') {
      let nextDigitPos = cursorPos;
      while (nextDigitPos < currentValue.length && !/\d/.test(currentValue[nextDigitPos])) {
        nextDigitPos++;
      }

      if (nextDigitPos < currentValue.length) {
        const newValue =
          currentValue.substring(0, nextDigitPos) +
          '0' +
          currentValue.substring(nextDigitPos + 1);

        input.value = newValue;
        input.selectionStart = cursorPos;
        input.selectionEnd = cursorPos;
        this.state.cursorPosition = cursorPos;

        this.handleInputChange(false);
      }
      return;
    }

    // Handle digit keys
    if (/^\d$/.test(e.key)) {
      let nextDigitPos = cursorPos;
      while (nextDigitPos < currentValue.length && !/\d/.test(currentValue[nextDigitPos])) {
        nextDigitPos++;
      }

      if (nextDigitPos < currentValue.length) {
        const newValue =
          currentValue.substring(0, nextDigitPos) +
          e.key +
          currentValue.substring(nextDigitPos + 1);

        input.value = newValue;
        input.selectionStart = nextDigitPos + 1;
        input.selectionEnd = nextDigitPos + 1;
        this.state.cursorPosition = nextDigitPos + 1;

        this.handleInputChange(false);
      }
    } else {
      // Handle non-digit keys
      if (cursorPos < currentValue.length) {
        if (!/\d/.test(currentValue[cursorPos])) {
          // Just move cursor for non-digit characters
          input.selectionStart = cursorPos + 1;
          input.selectionEnd = cursorPos + 1;
          this.state.cursorPosition = cursorPos + 1;
        } else {
          // Find the next non-digit character
          let nextPos = cursorPos;
          while (nextPos < currentValue.length && /\d/.test(currentValue[nextPos])) {
            nextPos++;
          }
          if (nextPos < currentValue.length) {
            nextPos++;
          }
          input.selectionStart = nextPos;
          input.selectionEnd = nextPos;
          this.state.cursorPosition = nextPos;
        }
      }
    }
  }

  /**
   * Updates the month and year titles
   */
  updateMonthTitle() {
    // Use full month name in the title
    this.elements.monthTitle.textContent = this.monthNames[this.state.currentDate.getMonth()];
    this.elements.yearTitle.textContent = this.state.currentDate.getFullYear();
  }
  
  /**
   * Shows the month selector dialog
   */
  showMonthSelector() {
    // Hide year selector if it's open
    this.elements.yearSelector.style.display = 'none';
    
    // Create month grid (4x3)
    this.elements.monthSelector.innerHTML = '';
    this.elements.monthSelector.style.display = 'grid';
    this.elements.monthSelector.style.gridTemplateColumns = 'repeat(4, 1fr)';
    this.elements.monthSelector.style.gridTemplateRows = 'repeat(3, 1fr)';
    
    // Add month buttons using abbreviated names
    this.monthAbbreviations.forEach((monthAbbr, index) => {
      const monthElement = document.createElement('div');
      monthElement.className = 'calendula-month-item';
      monthElement.textContent = monthAbbr;
      
      // Store full month name for accessibility
      monthElement.title = this.monthNames[index];
      
      // Highlight the current month
      if (index === this.state.currentDate.getMonth()) {
        monthElement.classList.add('calendula-selected');
      }
      
      // Add click handler
      monthElement.addEventListener('click', () => {
        this.selectMonth(index);
        this.elements.monthSelector.style.display = 'none';
      });
      
      this.elements.monthSelector.appendChild(monthElement);
    });
    
    // Close when clicking outside
    setTimeout(() => {
      const closeMonthSelector = (e) => {
        if (!this.elements.monthSelector.contains(e.target) && 
            e.target !== this.elements.monthTitle) {
          this.elements.monthSelector.style.display = 'none';
          document.removeEventListener('click', closeMonthSelector);
        }
      };
      document.addEventListener('click', closeMonthSelector);
    }, 0);
  }
  
  /**
   * Shows the year selector dialog
   */
  showYearSelector() {
    // Hide month selector if it's open
    this.elements.monthSelector.style.display = 'none';
    
    // Create year grid (5 columns)
    this.elements.yearSelector.innerHTML = '';
    this.elements.yearSelector.style.display = 'grid';
    this.elements.yearSelector.style.gridTemplateColumns = 'repeat(5, 1fr)';
    this.elements.yearSelector.style.maxHeight = '200px';
    this.elements.yearSelector.style.overflowY = 'auto';
    
    const currentYear = this.state.currentDate.getFullYear();
    const startYear = 1900;
    const endYear = 2100;
    
    // Add year buttons
    for (let year = startYear; year <= endYear; year++) {
      const yearElement = document.createElement('div');
      yearElement.className = 'calendula-year-item';
      yearElement.textContent = year;
      
      // Highlight the current year
      if (year === currentYear) {
        yearElement.classList.add('calendula-selected');
        
        // Scroll to the selected year
        setTimeout(() => {
          yearElement.scrollIntoView({ block: 'center' });
        }, 0);
      }
      
      // Add click handler
      yearElement.addEventListener('click', () => {
        this.selectYear(year);
        this.elements.yearSelector.style.display = 'none';
      });
      
      this.elements.yearSelector.appendChild(yearElement);
    }
    
    // Close when clicking outside
    setTimeout(() => {
      const closeYearSelector = (e) => {
        if (!this.elements.yearSelector.contains(e.target) && 
            e.target !== this.elements.yearTitle) {
          this.elements.yearSelector.style.display = 'none';
          document.removeEventListener('click', closeYearSelector);
        }
      };
      document.addEventListener('click', closeYearSelector);
    }, 0);
  }
  
  /**
   * Selects a month
   * @param {number} month - Month index (0-11)
   */
  selectMonth(month) {
    this.state.currentDate.setMonth(month);
    this.updateMonthTitle();
    this.renderCalendarDays();
    
    // Check if we're on mobile
    const isMobile = this.isMobileDevice();
    
    // Update month in the input field
    const monthString = (month + 1).toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('MM');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, monthString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, monthString);
    }
    
    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }
  
  /**
   * Selects a year
   * @param {number} year - Year value
   */
  selectYear(year) {
    this.state.currentDate.setFullYear(year);
    this.updateMonthTitle();
    this.renderCalendarDays();
    
    // Check if we're on mobile
    const isMobile = this.isMobileDevice();
    
    // Update year in the input field
    const yearString = year.toString();
    const format = this.getFormatString()
    let pos = format.indexOf('YYYY');
    if (-1 === pos) {
      pos = format.indexOf('YY');
    }
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, yearString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, yearString);
    }
    
    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Switches the month
   * @param {number} delta - Direction of change (-1 - previous, +1 - next)
   */
  changeMonth(delta) {
    this.state.currentDate.setMonth(this.state.currentDate.getMonth() + delta);
    this.updateMonthTitle();
    this.renderCalendarDays();

    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    // Update month in the input field
    const month = (this.state.currentDate.getMonth() + 1).toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('MM');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, month);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, month);
    }
  }
  
  /**
   * Shows the date picker dropdown
   */
  showDatePicker() {
    if (this.isDatePickerVisible()) return;
    
    // Make sure the date picker is visible
    this.datePickerElement.style.display = 'flex';
    void this.datePickerElement.style.inset;

    // For Safari: force a reflow to ensure proper dimensions before calculating position
    void this.datePickerElement.offsetHeight;
    
    // Calculate and set position
    this.updateDatePickerPosition();

    // Fix behavior in Chrome - do not let set strange inset
    this.datePickerElement.style.inset = '';

    // Trigger a callback if defined
    if (typeof this.config.onOpen === 'function') {
      this.config.onOpen();
    }
  }
  
  /**
   * Hides the date picker dropdown
   */
  hideDatePicker() {
    if (!this.isDatePickerVisible()) return;
    
    // Hide date picker
    this.datePickerElement.style.display = 'none';
    
    // Also hide selectors
    if (this.elements.monthSelector) {
      this.elements.monthSelector.style.display = 'none';
    }
    if (this.elements.yearSelector) {
      this.elements.yearSelector.style.display = 'none';
    }
    
    // Trigger a callback if defined
    if (typeof this.config.onClose === 'function') {
      this.config.onClose();
    }
  }
  
  /**
   * Checks if date picker is currently visible
   * @returns {boolean} True if visible
   */
  isDatePickerVisible() {
    return this.datePickerElement && 
           this.datePickerElement.style.display !== 'none';
  }
  
  /**
   * Updates date picker position based on input field
   */
  updateDatePickerPosition() {
    const inputField = this.elements.dateInput;
    if (!inputField) return;
    
    // Get the input's dimensions and position
    const inputRect = inputField.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Make sure the date picker is visible before measuring it
    const wasHidden = this.datePickerElement.style.display === 'none';
    if (wasHidden) {
      // Temporarily make it visible but invisible to measure it
      this.datePickerElement.style.visibility = 'hidden';
      this.datePickerElement.style.display = 'flex';
    }
    
    // Get the date picker's dimensions
    const pickerHeight = this.datePickerElement.offsetHeight;
    const pickerWidth = this.datePickerElement.offsetWidth;
    
    // Calculate space below and above the input
    const spaceBelow = windowHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    // Reset visibility if it was hidden
    if (wasHidden) {
      this.datePickerElement.style.visibility = '';
      if (!this.isDatePickerVisible()) {
        this.datePickerElement.style.display = 'none';
      }
    }
    
    // Position vertically
    if (spaceBelow >= pickerHeight || spaceBelow > spaceAbove) {
      // Position below input
      this.datePickerElement.style.top = `${inputRect.height}px`;
      this.datePickerElement.style.bottom = 'auto';
    } else {
      // Position above input
      this.datePickerElement.style.bottom = `${inputRect.height + inputRect.height}px`;
      this.datePickerElement.style.top = 'auto';
    }
    
    // Center horizontally if there is enough space
    this.datePickerElement.style.left = '0px';
    this.datePickerElement.style.right = 'auto';
    
    // Add a small delay to make sure the picker is fully rendered and positioned
    setTimeout(() => {
      // This triggers a reflow and ensures the picker is fully rendered
      void this.datePickerElement.offsetHeight;
    }, 0);
  }

  /**
   * Renders calendar days
   */
  renderCalendarDays() {
    // Clear calendar
    this.elements.calendarGrid.innerHTML = '';

    // Add weekdays using localized names
    this.weekdayNames.forEach(day => {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendula-weekday';
      dayElement.textContent = day;
      this.elements.calendarGrid.appendChild(dayElement);
    });

    // Get month data
    const year = this.state.currentDate.getFullYear();
    const month = this.state.currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Get day of the week (0-6, where 0 is Sunday)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to format where 0 is Monday, 6 is Sunday
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days from the previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendula-calendar-day calendula-empty-day';
      this.elements.calendarGrid.appendChild(emptyDay);
    }

    // Add days of the current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendula-calendar-day';
      dayElement.textContent = day;

      // Highlight today
      if (day === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear()) {
        dayElement.classList.add('calendula-today');
      }

      // Highlight selected day
      if (day === this.state.selectedDate.getDate() &&
          month === this.state.selectedDate.getMonth() &&
          year === this.state.selectedDate.getFullYear()) {
        dayElement.classList.add('calendula-selected');
      }

      // Click handler
      dayElement.addEventListener('click', () => {
        this.selectDate(day);
      });

      this.elements.calendarGrid.appendChild(dayElement);
    }

    this.updateMonthTitle();
  }

  /**
   * Selects the day of the month
   * @param {number} day - Day of the month
   */
  selectDate(day) {
    // Update selected date
    this.state.selectedDate = new Date(
      this.state.currentDate.getFullYear(),
      this.state.currentDate.getMonth(),
      day,
      this.state.selectedHour,
      this.state.selectedMinute,
      this.state.selectedSecond
    );

    // Redraw calendar
    this.renderCalendarDays();

    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    // Update day in the input field without focusing if on mobile
    const dayString = day.toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('DD');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, dayString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, dayString);
    }

    // Hide calendar after date selection (only if time is not shown)
    if (!this.config.showTime) {
      this.hideDatePicker();
    }

    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Renders the hours section
   */
  renderHours() {
    this.elements.hoursGrid.innerHTML = '';

    // Create buttons for hours (0-23)
    for (let hour = 0; hour < 24; hour++) {
      const hourElement = document.createElement('div');
      hourElement.className = 'calendula-time-item';
      hourElement.textContent = hour.toString().padStart(2, '0');

      if (hour === this.state.selectedHour) {
        hourElement.classList.add('calendula-selected');
      }

      hourElement.addEventListener('click', () => {
        this.selectHour(hour);
      });

      this.elements.hoursGrid.appendChild(hourElement);
    }
  }

  /**
   * Selects an hour
   * @param {number} hour - Hour (0-23)
   */
  selectHour(hour) {
    this.state.selectedHour = hour;

    // Update selected time
    this.state.selectedDate.setHours(hour);

    // Redraw hours
    this.renderHours();

    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    // Update hours in the input field
    const hourString = hour.toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('HH');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, hourString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, hourString);
    }

    // Call the callback if specified
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Renders the tens of minutes section
   */
  renderTenMinutes() {
    this.elements.tenMinutesGrid.innerHTML = '';

    // Create buttons for tens of minutes (0, 10, 20, 30, 40, 50)
    const tenMinutes = [0, 10, 20, 30, 40, 50];

    tenMinutes.forEach(minute => {
      const minuteElement = document.createElement('div');
      minuteElement.className = 'calendula-time-item';
      minuteElement.textContent = minute.toString().padStart(2, '0');

      if (minute === this.state.selectedTenMinute) {
        minuteElement.classList.add('calendula-selected');
      }

      minuteElement.addEventListener('click', () => {
        this.selectTenMinute(minute);
      });

      this.elements.tenMinutesGrid.appendChild(minuteElement);
    });
  }

  /**
   * Selects tens of minutes
   * @param {number} minute - Tens of minutes (0, 10, 20, 30, 40, 50)
   */
  selectTenMinute(minute) {
    this.state.selectedTenMinute = minute;

    // Update the selected time
    this.state.selectedDate.setMinutes(minute + this.state.selectedMinute);

    // Redraw tens of minutes
    this.renderTenMinutes();

    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    // Update minutes in the input field
    const minuteString = (minute + this.state.selectedMinute).toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('mm');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, minuteString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, minuteString);
    }

    // Call the callback if specified
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Renders the minutes section
   */
  renderMinutes() {
    this.elements.minutesGrid.innerHTML = '';

    if (this.config.minuteStep === 1) {
      // Standard mode - create buttons for minute units (0-9)
      for (let minute = 0; minute < 10; minute++) {
        const minuteElement = document.createElement('div');
        minuteElement.className = 'calendula-time-item';
        minuteElement.textContent = minute.toString();

        if (minute === this.state.selectedMinute) {
          minuteElement.classList.add('calendula-selected');
        }

        minuteElement.addEventListener('click', () => {
          this.selectMinute(minute);
        });

        this.elements.minutesGrid.appendChild(minuteElement);
      }
    } else {
      // Step mode (5 or 10) - create buttons for minutes with specified step
      const step = this.config.minuteStep;
      const currentMinutes = this.state.selectedDate.getMinutes();

      // Calculate maximum value
      const maxMinutes = 60 - step;

      for (let minute = 0; minute <= maxMinutes; minute += step) {
        const minuteElement = document.createElement('div');
        minuteElement.className = 'calendula-time-item';
        minuteElement.textContent = minute.toString().padStart(2, '0');

        // Check if this minute button should be selected
        const isSelected = minute <= currentMinutes && currentMinutes < minute + step;
        if (isSelected) {
          minuteElement.classList.add('calendula-selected');
        }

        minuteElement.addEventListener('click', () => {
          this.selectMinute(minute);
        });

        this.elements.minutesGrid.appendChild(minuteElement);
      }
    }
  }

  /**
   * Selects minutes
   * @param {number} minute - Minutes (0-9 for step=1, 0-59 for other steps)
   */
  selectMinute(minute) {
    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    const format = this.getFormatString()
    const pos = format.indexOf('mm');
    if (this.config.minuteStep === 1) {
      // Standard mode - store tens and units separately
      this.state.selectedMinute = minute;

      // Update the selected time
      this.state.selectedDate.setMinutes(this.state.selectedTenMinute + minute);

      // Redrawing the minutes
      this.renderMinutes();

      // Update the minutes in the input field
      const minuteString = (this.state.selectedTenMinute + minute).toString().padStart(2, '0');
      if (isMobile) {
        // For mobile, update value without changing focus
        this.overwriteDigitsInInputWithoutFocus(pos, minuteString);
      } else {
        // For desktop, use normal behavior with focus
        this.overwriteDigitsInInput(pos, minuteString);
      }
    } else {
      // Step mode - set minutes directly
      this.state.selectedDate.setMinutes(minute);

      // For convenience, update state properties too
      this.state.selectedTenMinute = Math.floor(minute / 10) * 10;
      this.state.selectedMinute = minute % 10;

      // Redrawing the minutes
      this.renderMinutes();

      // Update the minutes in the input field
      const minuteString = minute.toString().padStart(2, '0');
      if (isMobile) {
        // For mobile, update value without changing focus
        this.overwriteDigitsInInputWithoutFocus(pos, minuteString);
      } else {
        // For desktop, use normal behavior with focus
        this.overwriteDigitsInInput(pos, minuteString);
      }
    }

    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Renders the seconds section
   */
  renderSeconds() {
    this.elements.secondsGrid.innerHTML = '';

    // Create buttons for seconds (0-59, with step 5)
    for (let second = 0; second < 60; second += 5) {
      const secondElement = document.createElement('div');
      secondElement.className = 'calendula-time-item';
      secondElement.textContent = second.toString().padStart(2, '0');

      if (second <= this.state.selectedSecond && this.state.selectedSecond < second + 5) {
        secondElement.classList.add('calendula-selected');
      }

      secondElement.addEventListener('click', () => {
        this.selectSecond(second);
      });

      this.elements.secondsGrid.appendChild(secondElement);
    }
  }

  /**
   * Selects seconds
   * @param {number} second - Seconds (0-59)
   */
  selectSecond(second) {
    this.state.selectedSecond = second;

    // Update selected time
    this.state.selectedDate.setSeconds(second);

    // Redraw seconds
    this.renderSeconds();

    // Check if we're on mobile
    const isMobile = this.isMobileDevice();

    // Update seconds in the input field
    const secondString = second.toString().padStart(2, '0');
    const format = this.getFormatString()
    const pos = format.indexOf('SS');
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(pos, secondString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(pos, secondString);
    }

    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Replaces digits in the input field
   * @param {number} startPosition - Start position
   * @param {string} newValue - New value
   */
  overwriteDigitsInInput(startPosition, newValue) {
    const input = this.elements.dateInput;
    const currentValue = input.value;

    // If the field is empty
    if (!currentValue) {
      // Allow empty value if configured
      if (this.config.allowEmpty) {
        return;
      }
      // Otherwise update with full date value (default behavior)
      this.updateDateInput();
      return;
    }

    let newInputValue = '';
    let valueIndex = 0;

    // We build a new string, replacing only the numbers at the specified positions
    for (let i = 0; i < currentValue.length; i++) {
      if (i >= startPosition && valueIndex < newValue.length) {
        // If we are at the position of the number to replace
        if (/\d/.test(currentValue[i])) {
          // We replace the number
          newInputValue += newValue[valueIndex];
          valueIndex++;
        } else {
          // Preserve non-numeric characters (dots, colons, spaces)
          newInputValue += currentValue[i];
        }
      } else {
        // Keep characters out of replacement range
        newInputValue += currentValue[i];
      }
    }

    // Updating the value of the input field
    input.value = newInputValue;

    // Update the calendar according to the new value
    this.handleInputChange(false);

    // Set the cursor position after the last inserted digit
    input.focus();
    const newPosition = startPosition + newValue.length +
                        (currentValue[startPosition + 1] === '.' ||
                        currentValue[startPosition + 1] === ':' ||
                        currentValue[startPosition + 1] === ' ' ? 1 : 0);
    input.selectionStart = newPosition;
    input.selectionEnd = newPosition;
    this.state.cursorPosition = newPosition;
  }

  /**
   * Replaces digits in the input field without setting focus
   * @param {number} startPosition - Start position
   * @param {string} newValue - New value
   */
  overwriteDigitsInInputWithoutFocus(startPosition, newValue) {
    const input = this.elements.dateInput;
    const currentValue = input.value;

    // If field is empty
    if (!currentValue) {
      // Allow empty value if configured
      if (this.config.allowEmpty) {
        return;
      }
      // Otherwise update with full date value (default behavior)
      this.updateDateInput();
      return;
    }

    let newInputValue = '';
    let valueIndex = 0;

    // Build a new string, replacing only digits at specified positions
    for (let i = 0; i < currentValue.length; i++) {
      if (i >= startPosition && valueIndex < newValue.length) {
        // If we're at a digit position to replace
        if (/\d/.test(currentValue[i])) {
          // Replace the digit
          newInputValue += newValue[valueIndex];
          valueIndex++;
        } else {
          // Preserve non-digit characters (dots, colons, spaces)
          newInputValue += currentValue[i];
        }
      } else {
        // Preserve characters outside the replacement range
        newInputValue += currentValue[i];
      }
    }

    // Update input field value
    input.value = newInputValue;

    // Update calendar based on new value
    this.handleInputChange(false);
    
    // Calculate new cursor position
    const newPosition = startPosition + newValue.length +
                      (currentValue[startPosition + 1] === '.' ||
                      currentValue[startPosition + 1] === ':' ||
                      currentValue[startPosition + 1] === ' ' ? 1 : 0);
    
    // Update state cursor position
    this.state.cursorPosition = newPosition;
    
    // Restore cursor position without focusing
    // We use setTimeout to ensure this runs after the browser's default handling
    setTimeout(() => {
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  }

  /**
   * Overwrites digits at cursor position with pasted digits
   * @param {string} digits - String of digits to paste
   */
  overwriteDigitsAtCursor(digits) {
    const input = this.elements.dateInput;
    const currentValue = input.value;
    
    // Always get the current cursor position from the input element
    // This ensures we have the most up-to-date position even after navigation keys
    const cursorPos = input.selectionStart;
    
    // Update our internal state to match
    this.state.cursorPosition = cursorPos;

    // If the field is empty
    if (!currentValue) {
      // Allow empty value if configured
      if (this.config.allowEmpty) {
        return;
      }
      // Otherwise update with full date value (default behavior)
      this.updateDateInput();
      return;
    }

    let newInputValue = currentValue;
    let currentPos = cursorPos;
    let digitsReplaced = 0;

    // For each digit in the pasted content
    for (let i = 0; i < digits.length; i++) {
      // Find next digit position in the input field from current position
      while (currentPos < newInputValue.length && !/\d/.test(newInputValue[currentPos])) {
        currentPos++;
      }

      // If end of input field is reached, stop
      if (currentPos >= newInputValue.length) {
        break;
      }

      // Replace digit at current position
      newInputValue =
        newInputValue.substring(0, currentPos) +
        digits[i] +
        newInputValue.substring(currentPos + 1);

      digitsReplaced++;
      currentPos++;
    }

    // Update input field value
    input.value = newInputValue;

    // Update calendar
    this.handleInputChange(false);

    // Set cursor after last replaced digit
    input.focus();
    input.selectionStart = currentPos;
    input.selectionEnd = currentPos;
    this.state.cursorPosition = currentPos;
  }
  
  /**
   * Legacy method for backward compatibility
   * @deprecated Use overwriteDigitsAtCursor instead
   */
  overwriteMultipleDigits(startPosition, digits) {
    this.overwriteDigitsAtCursor(digits);
  }

  /**
   * Updates the input field value based on the selected date
   */
  updateDateInput() {
    try {
      // Get appropriate format string
      let formatString = this.getFormatString();
      
      // Get the date potentially adjusted for timezone
      const dateToFormat = this.config.timezone ? 
        this.getTimezoneAdjustedDate() : 
        this.state.selectedDate;

      // Format the date using our pattern
      this.elements.dateInput.value = this.formatDateWithPattern(dateToFormat, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      
      // Fall back to default formatting
      let dateToUse = this.state.selectedDate;
      
      // Adjust for timezone if necessary
      if (this.config.timezone) {
        dateToUse = this.getTimezoneAdjustedDate();
      }
      
      const day = dateToUse.getDate().toString().padStart(2, '0');
      const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0');
      const year = dateToUse.getFullYear();
      const hours = dateToUse.getHours().toString().padStart(2, '0');
      const minutes = dateToUse.getMinutes().toString().padStart(2, '0');

      // Format with or without time depending on the settings
      if (this.config.showTime) {
        // Format with or without seconds depending on the settings
        if (this.config.showSeconds) {
          // Format with seconds (DD.MM.YYYY HH:mm:SS)
          const seconds = dateToUse.getSeconds().toString().padStart(2, '0');
          this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
        } else {
          // Format without seconds (DD.MM.YYYY HH:mm)
          this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}`;
        }
      } else {
        // Format without seconds (DD.MM.YYYY)
        this.elements.dateInput.value = `${day}.${month}.${year}`;
      }
    }
    
    // Update visibility of the clear input button
    this.updateClearButtonVisibility();
  }
  
  /**
   * Updates the visibility of the clear input button
   * Shows the button when the input has a value and hides it when empty
   */
  updateClearButtonVisibility() {
    if (this.elements.clearInputButton) {
      if (this.elements.dateInput.value) {
        this.elements.clearInputButton.style.display = 'flex';
      } else {
        this.elements.clearInputButton.style.display = 'none';
      }
    }
  }
  
  /**
   * Gets the appropriate format string based on config
   * @returns {string} Format string
   */
  getFormatString() {
    // If custom format specified, use it
    if (this.config.dateFormat) {
      return this.config.dateFormat;
    }
    
    // Otherwise, create default format pattern based on settings
    let format = 'DD.MM.YYYY';
    if (this.config.showTime) {
      format += ' HH:mm';
      if (this.config.showSeconds) {
        format += ':SS';
      }
    }
    
    return format;
  }
  
  /**
   * Converts a date to the specified timezone
   * @param {Date} date - Date to convert
   * @param {string} timezone - Target timezone (e.g., 'Europe/London')
   * @returns {Date} Converted date
   */
  convertToTimezone(date, timezone) {
    if (!timezone) {
      return new Date(date);
    }
    
    try {
      // Create a formatter with the target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      
      // Get the parts of the formatted date
      const parts = formatter.formatToParts(date);
      const dateParts = {};
      
      // Extract date parts
      parts.forEach(part => {
        if (part.type !== 'literal') {
          dateParts[part.type] = parseInt(part.value, 10);
        }
      });
      
      // Create a new date with the timezone-adjusted values
      // Note: Month is 0-indexed in JavaScript Date
      return new Date(
        dateParts.year,
        dateParts.month - 1,
        dateParts.day,
        dateParts.hour,
        dateParts.minute,
        dateParts.second
      );
    } catch (error) {
      console.error('Error converting to timezone:', error);
      return new Date(date);
    }
  }
  
  /**
   * Converts a date from the specified timezone to local time
   * @param {Date} date - Date in the specified timezone
   * @param {string} timezone - Source timezone (e.g., 'Europe/London')
   * @returns {Date} Date in local time
   */
  convertFromTimezone(date, timezone) {
    if (!timezone) {
      return new Date(date);
    }
    
    try {
      // Get the local time components
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      
      // Create a formatter to get the source timezone's current offset
      const sourceTZ = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      const localTZ = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short'
      });
      
      // Create a date string in ISO format to specify the timezone
      const sourceTZDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      
      // Calculate the offset between source timezone and local timezone
      const sourceOffset = this.getTimezoneOffset(timezone, sourceTZDate);
      const localOffset = new Date().getTimezoneOffset();
      const offsetDiff = sourceOffset + localOffset;
      
      // Apply the offset difference to the date
      const localDate = new Date(sourceTZDate.getTime() + offsetDiff * 60 * 1000);
      return localDate;
    } catch (error) {
      console.error('Error converting from timezone:', error);
      return new Date(date);
    }
  }
  
  /**
   * Gets the timezone offset in minutes for a specific timezone and date
   * @param {string} timezone - Timezone (e.g., 'Europe/London')
   * @param {Date} date - Date to get offset for
   * @returns {number} Offset in minutes
   */
  getTimezoneOffset(timezone, date) {
    try {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
      return (utcDate.getTime() - tzDate.getTime()) / 60000;
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 0;
    }
  }
  
  /**
   * Gets the date adjusted for the configured timezone
   * @returns {Date} Timezone-adjusted date
   */
  getTimezoneAdjustedDate() {
    if (!this.config.timezone) {
      return new Date(this.state.selectedDate);
    }
    
    return this.convertToTimezone(this.state.selectedDate, this.config.timezone);
  }
  
  /**
   * Clears the date input value
   * This will only work if allowEmpty is set to true
   */
  clearDate() {
    if (this.config.allowEmpty) {
      this.elements.dateInput.value = '';
      
      // Update clear button visibility
      this.updateClearButtonVisibility();
      
      // Notify of the change
      if (typeof this.config.onChange === 'function') {
        this.config.onChange(null);
      }
    }
  }

  /**
   * Formats a date according to the specified format string
   * @param {Date} date - The date to format
   * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'DD.MM.YYYY')
   * @returns {string} Formatted date string
   */
  formatDateWithPattern(date, format) {
    if (!date || !(date instanceof Date)) {
      return '';
    }
    
    // Get date components with proper padding
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    // Replace patterns in format string
    let result = format
      .replace(/YYYY/g, year)
      .replace(/YY/g, year.slice(-2))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/SS/g, seconds);
    
    return result;
  }
  
  /**
   * Parses a date string according to the specified format
   * @param {string} dateStr - The date string to parse
   * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'DD.MM.YYYY')
   * @returns {Date|null} A Date object or null if parsing fails
   */
  parseDateFromPattern(dateStr, format) {
    // Return null for empty strings, allowing empty values to be processed properly
    if (!dateStr || !format) {
      return null;
    }
    
    // Create a map of format parts to regex patterns
    const patterns = {
      'YYYY': '(\\d{4})',
      'YY': '(\\d{2})',
      'MM': '(\\d{1,2})',
      'DD': '(\\d{1,2})',
      'HH': '(\\d{1,2})',
      'mm': '(\\d{1,2})',
      'SS': '(\\d{1,2})'
    };
    
    // Escape special RegExp characters in the format
    let escapedFormat = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace format patterns with capture groups
    Object.keys(patterns).forEach(pattern => {
      escapedFormat = escapedFormat.replace(new RegExp(pattern, 'g'), patterns[pattern]);
    });
    
    // Create regex from format
    const regex = new RegExp(`^${escapedFormat}$`);
    const match = dateStr.match(regex);
    if (!match) {
      return null;
    }
    
    // Extract values using original format as a guide
    let year = new Date().getFullYear();
    let month = 0;
    let day = 1;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    
    // Find positions of patterns in format
    let valueIndex = 1; // Start from index 1 (regex group 0 is the full match)
    
    // Check for each pattern and extract accordingly
    if (format.includes('YYYY')) {
      const pos = format.indexOf('YYYY');
      year = parseInt(dateStr.substring(pos, pos + 'YYYY'.length), 10)
    } else if (format.includes('YY')) {
      const pos = format.indexOf('YY');
      const twoDigitYear = parseInt(dateStr.substring(pos, pos + 'YY'.length))
      const currentYear = new Date().getFullYear().toString();
      const century = parseInt(currentYear.slice(0, 2), 10) * 100;
      year = century + twoDigitYear;
    }
    
    if (format.includes('MM')) {
      const pos = format.indexOf('MM');
      month = parseInt(dateStr.substring(pos, pos + 'MM'.length), 10) - 1
    }
    
    if (format.includes('DD')) {
      const pos = format.indexOf('DD');
      day = parseInt(dateStr.substring(pos, pos + 'DD'.length), 10)
    }
    
    if (format.includes('HH')) {
      const pos = format.indexOf('HH');
      hours = parseInt(dateStr.substring(pos, pos + 'HH'.length), 10)
    }
    
    if (format.includes('mm')) {
      const pos = format.indexOf('mm');
      minutes = parseInt(dateStr.substring(pos, pos + 'mm'.length), 10)
    }
    
    if (format.includes('SS')) {
      const pos = format.indexOf('SS');
      seconds = parseInt(dateStr.substring(pos, pos + 'SS'.length), 10)
    }

    // Create and return the date
    return new Date(year, month, day, hours, minutes, seconds);
  }

  /**
   * Gets the default format pattern based on configuration
   * @returns {string} Format pattern
   */
  getDefaultFormatPattern() {
    if (this.config.dateFormat) {
      return this.config.dateFormat;
    }
    
    let format = 'DD.MM.YYYY';
    if (this.config.showTime) {
      format += ' HH:mm';
      if (this.config.showSeconds) {
        format += ':SS';
      }
    }
    
    return format;
  }

  getTimezoneOffset(timeZoneName) {
    // Create a date object
    const date = new Date();

    // Use Intl.DateTimeFormat to get a formatted date in a specified time zone
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timeZoneName,
      timeZoneName: 'short'
    });

    // Getting parts of a formatted date
    const formattedParts = formatter.formatToParts(date);

    // Find the part containing information about the time zone
    const timeZonePart = formattedParts.find(part => part.type === 'timeZoneName');

    // Returning the time zone offset
    const gmtOffset = timeZonePart ? timeZonePart.value : null;
    const numberOffset = gmtOffset.replace('GMT', '');
    let sign = '+'
    if (numberOffset.length > 0) {
      sign = numberOffset[0]
    }
    const valueOffset = numberOffset.substring(1)
    const parts = valueOffset.split(":")
    if (parts.length < 2) {
      return sign + valueOffset.padStart(2, '0') + ':00';
    } else {
      return sign + parts[0].padStart(2, '0') + ':' + parts[1];
    }
  }

  /**
   * Handles value change in the input field
   * @param {boolean} updateInput - Whether to update the input field after processing
   * @returns {boolean} Processing success
   */
  handleInputChange(updateInput = true) {
    // Get the value from the input field
    const inputValue = this.elements.dateInput.value;
    
    // Handle empty value if allowed
    if (!inputValue && this.config.allowEmpty) {
      // Call the callback with null to indicate empty value
      if (typeof this.config.onChange === 'function') {
        this.config.onChange(null);
      }
      
      return true;
    }
    
    // Let's try to parse the date from the format
    let newDate;
    
    // Get the current format string to use for parsing
    const formatString = this.getFormatString();

    try {
      // Try to parse using our new pattern-based parser
      newDate = this.parseDateFromPattern(inputValue, formatString);

      // If that fails, fall back to standard format
      if (!newDate) {
        newDate = this.parseDateFromStandardFormat(inputValue);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      // Try standard formats as a last resort
      newDate = this.parseDateFromStandardFormat(inputValue);
    }

    // Check that the date is correct
    if (newDate && !isNaN(newDate.getTime())) {
      // We update all states
      this.state.currentDate = new Date(newDate);

      let dateInTZ = newDate;
      if (this.config.timezone) {
        const formattedOffset = this.getTimezoneOffset(this.config.timezone);
        dateInTZ = this.formatDateWithPattern(newDate, 'YYYY-MM-DD HH:mm:SS')+formattedOffset;
      }

      this.state.selectedDate = new Date(dateInTZ);
      this.state.selectedHour = newDate.getHours();
      this.state.selectedTenMinute = Math.floor(newDate.getMinutes() / 10) * 10;
      this.state.selectedMinute = newDate.getMinutes() % 10;
      this.state.selectedSecond = newDate.getSeconds();

      // Redraw all components
      this.renderCalendarDays();
      this.renderHours();
      this.renderTenMinutes();
      this.renderMinutes();

      // Draw seconds only if they are displayed
      if (this.config.showTime && this.config.showSeconds) {
        this.renderSeconds();
      }

      // Update the input field only if requested (to avoid loops)
      if (updateInput) {
        this.updateDateInput();
      }

      // Call the callback if specified
      if (typeof this.config.onChange === 'function') {
        this.config.onChange(this.state.selectedDate);
      }

      return true;
    } else {
      // If the date is incorrect but we allow empty values and the input is empty
      if (this.config.allowEmpty && !inputValue) {
        // Call the callback with null to indicate empty value
        if (typeof this.config.onChange === 'function') {
          this.config.onChange(null);
        }
        return true;
      }
      
      // Otherwise restore the current value
      if (updateInput) {
        this.updateDateInput();
      }
      return false;
    }
  }
  
  /**
   * Parses date from standard format DD.MM.YYYY [HH:mm[:SS]]
   * @param {string} inputValue - Date string
   * @returns {Date|null} A Date object or null if parsing fails
   */
  parseDateFromStandardFormat(inputValue) {
    // Templates for formats with and without seconds
    const regexWithSeconds = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const regexWithoutSeconds = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
    const regexWithoutTime = /^(\d{2})\.(\d{2})\.(\d{4})$/;

    // We try to match with the appropriate format depending on the settings
    let match;
    let seconds = 0;

    if (!this.config.showTime) {
      match = inputValue.match(regexWithoutTime);
      seconds = 0;
    }
    else if (this.config.showSeconds) {
      match = inputValue.match(regexWithSeconds);
      if (match) {
        const [_, day, month, year, hours, minutes, secs] = match;
        seconds = parseInt(secs);
      }
    } else {
      match = inputValue.match(regexWithoutSeconds);
    }

    if (match) {
      let [_, day, month, year, hours, minutes] = match;
      if (!this.config.showTime) {
        hours = "0";
        minutes = "0";
      }

      // Create a new date from the entered value
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        seconds
      );
    }
    
    return null;
  }

  /**
   * Gets the selected date
   * @param {Object} options - Options for date retrieval
   * @param {boolean} options.useLocalTimezone - Whether to convert from calendar timezone to local timezone
   * @returns {Date} Selected date
   */
  getDate(options = {}) {
    // Get a copy of the selected date
    const date = new Date(this.state.selectedDate);
    
    // If we have a timezone configured and need to convert to local time
    if (this.config.timezone && options.useLocalTimezone) {
      return this.convertFromTimezone(date, this.config.timezone);
    }
    
    return date;
  }

  /**
   * Sets the date
   * @param {Date|null} date - New date (in local timezone unless specified otherwise) or null to clear
   * @param {Object} options - Additional options
   * @param {boolean} options.isTimezoneDate - Whether the date is already in the configured timezone
   */
  setDate(date, options = {}) {
    // Handle null date (clear the input if allowEmpty is true)
    if (date === null) {
      if (this.config.allowEmpty) {
        this.clearDate();
        return;
      } else {
        throw new Error('Calendula: Null date requires allowEmpty option to be true');
      }
    }
    
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Calendula: Invalid date');
    }
    
    let adjustedDate = date;
    
    // If we have a timezone configured and the provided date is not already in that timezone
    if (this.config.timezone && !options.isTimezoneDate) {
      // Convert the provided date to the configured timezone
      adjustedDate = this.convertToTimezone(date, this.config.timezone);
    }

    this.state.currentDate = new Date(adjustedDate);
    this.state.selectedDate = new Date(date);
    this.state.selectedHour = adjustedDate.getHours();
    this.state.selectedTenMinute = Math.floor(adjustedDate.getMinutes() / 10) * 10;
    this.state.selectedMinute = adjustedDate.getMinutes() % 10;
    this.state.selectedSecond = adjustedDate.getSeconds();

    // Redraw all components
    this.renderCalendarDays();
    this.renderHours();
    this.renderTenMinutes();
    this.renderMinutes();

    if (this.config.showTime && this.config.showSeconds) {
      this.renderSeconds();
    }

    this.updateDateInput();

    // Call the callback if provided
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(this.state.selectedDate);
    }
  }

  /**
   * Sets the component configuration
   * @param {Object} config - New configuration parameters
   */
  setConfig(config) {
    let languageChanged = false;
    let timezoneChanged = false;
    
    if (config.showTime !== undefined) {
      this.config.showTime = config.showTime;
    }

    if (config.showSeconds !== undefined) {
      this.config.showSeconds = config.showSeconds;
    }

    if (config.minuteStep !== undefined) {
      this.config.minuteStep = config.minuteStep;
    }

    if (config.onChange !== undefined) {
      this.config.onChange = config.onChange;
    }
    
    if (config.dateFormat !== undefined) {
      this.config.dateFormat = config.dateFormat;
    }
    
    if (config.language !== undefined) {
      // Check if language has actually changed
      if (this.config.language !== config.language) {
        this.config.language = config.language;
        languageChanged = true;
      }
    }
    
    if (config.timezone !== undefined) {
      // Update timezone
      this.config.timezone = config.timezone;
    }
    
    if (config.allowEmpty !== undefined && this.config.allowEmpty !== config.allowEmpty) {
      // Update allowEmpty setting
      this.config.allowEmpty = config.allowEmpty;
      
      // Add or remove clear input button based on new setting
      const existingClearButton = this.inputWrapper.querySelector('.calendula-clear-input');
      
      if (this.config.allowEmpty && !existingClearButton) {
        // Add clear button if it doesn't exist
        const clearInputButton = document.createElement('button');
        clearInputButton.className = 'calendula-clear-input';
        clearInputButton.innerHTML = '×';
        clearInputButton.setAttribute('type', 'button');
        clearInputButton.setAttribute('tabindex', '-1');
        clearInputButton.setAttribute('aria-label', this.getTranslation('buttons.clear') || 'Clear');
        
        // Add to the input wrapper
        this.inputWrapper.appendChild(clearInputButton);
        
        // Add event handler
        clearInputButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent event from reaching document
          this.clearDate();
        });
        
        // Update DOM elements reference
        this.elements.clearInputButton = clearInputButton;
      } else if (!this.config.allowEmpty && existingClearButton) {
        // Remove clear button if it exists
        existingClearButton.remove();
        this.elements.clearInputButton = null;
      }
    }

    // Apply new configuration
    this.applyConfig();

    // If language has changed, update translations and re-render everything
    if (languageChanged) {
      const lang = this.getLanguage();
      this.monthNames = this.translations[lang].monthNames;
      this.monthAbbreviations = this.translations[lang].monthAbbreviations;
      this.weekdayNames = this.translations[lang].weekdayNames;
      
      // Recreate all elements with new translations
      this.container.innerHTML = '';
      this.createElements();
      this.findElements();
      this.renderCalendarDays();
      this.renderHours();
      this.renderTenMinutes();
      this.renderMinutes();
      this.renderSeconds();
      this.bindEvents();
    } else {
      // Otherwise just update minutes rendering
      this.renderMinutes();
    }
    
    this.updateDateInput();
  }
}

// Export Calendula to make it available globally
global.Calendula = Calendula;

// Support CommonJS/Node.js module exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calendula;
}

})(typeof window !== 'undefined' ? window : global);
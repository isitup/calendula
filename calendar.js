/**
 * Calendula - Date and Time Picker Component
 * Creates an interactive calendar with time selection in the specified container
 * 
 * @version 1.0.0
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
   * @param {string|HTMLElement} container - Selector or DOM element of the container
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('Calendula: Container not found');
    }

    // Load translations from external file
    this.translations = typeof CALENDULA_TRANSLATIONS !== 'undefined' ? CALENDULA_TRANSLATIONS : {};

    // Default settings
    this.config = {
      showTime: options.showTime !== undefined ? options.showTime : false,
      showSeconds: options.showSeconds !== undefined ? options.showSeconds : true,
      minuteStep: options.minuteStep || 1,
      initialDate: options.initialDate || new Date(),
      inputField: options.inputField || null,
      onChange: options.onChange || null,
      dateFormat: options.dateFormat || null, // Date format (for example, 'dd.MM.yyyy')
      language: options.language || this.detectBrowserLanguage() // Interface language
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

    // Bind event handlers
    this.bindEvents();
  }

  /**
   * Creates the calendar DOM structure
   */
  createElements() {
    // Create container for input field
    const inputContainer = document.createElement('div');
    inputContainer.className = 'calendula-input-container';

    // Create date input field (if not provided externally)
    if (!this.config.inputField) {
      this.dateInput = document.createElement('input');
      this.dateInput.type = 'text';
      this.dateInput.className = 'calendula-date-input';
      this.dateInput.placeholder = 'DD.MM.YYYY HH:MM:SS';
      inputContainer.appendChild(this.dateInput);
    } else {
      this.dateInput = this.config.inputField;
      // Add class to external input for styling consistency
      if (!this.dateInput.classList.contains('calendula-date-input')) {
        this.dateInput.classList.add('calendula-date-input');
      }
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

    // Create a wrapper div to hold both the input and the dropdown
    const pickerWrapper = document.createElement('div');
    pickerWrapper.className = 'calendula-date-picker-wrapper';
    
    // If using external input field, reference it, otherwise append our input
    if (!this.config.inputField) {
      pickerWrapper.appendChild(inputContainer);
    } else {
      // If external input field is provided, we need to position our dropdown near it
      const inputParent = this.config.inputField.parentNode;
      
      // Insert wrapper after the input field
      if (inputParent) {
        // Add a small wrapper div around the external input to maintain relative positioning
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'calendula-date-input-wrapper';
        inputWrapper.style.position = 'relative';
        
        // Replace the input with the wrapper containing the input
        inputParent.insertBefore(inputWrapper, this.config.inputField);
        inputWrapper.appendChild(this.config.inputField);
        
        // Append the picker wrapper after the input wrapper
        inputWrapper.appendChild(pickerWrapper);
      }
    }
    
    // Append the date picker to the wrapper
    pickerWrapper.appendChild(dateTimePicker);
    
    // Add the wrapper to the container if we're not using an external input
    if (!this.config.inputField) {
      this.container.appendChild(pickerWrapper);
    }
    
    // Always ensure the date picker is initially hidden
    dateTimePicker.style.display = 'none';
    
    // Save references to created elements
    this.datePickerElement = dateTimePicker;
    this.pickerWrapper = pickerWrapper;
  }

  /**
   * Finds DOM elements
   */
  findElements() {
    this.elements = {
      dateInput: this.dateInput,
      monthTitle: this.container.querySelector('.calendula-month-title'),
      yearTitle: this.container.querySelector('.calendula-year-title'),
      prevMonthBtn: this.container.querySelector('.calendula-prev-month'),
      nextMonthBtn: this.container.querySelector('.calendula-next-month'),
      calendarGrid: this.container.querySelector('.calendula-calendar-grid'),
      monthSelector: this.container.querySelector('.calendula-month-selector'),
      yearSelector: this.container.querySelector('.calendula-year-selector'),
      hoursGrid: this.container.querySelector('.calendula-hours-grid'),
      tenMinutesGrid: this.container.querySelector('.calendula-ten-minutes-grid'),
      minutesGrid: this.container.querySelector('.calendula-minutes-grid'),
      secondsGrid: this.container.querySelector('.calendula-seconds-grid')
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

    // Get the template format
    let template = this.getFormattedDateTemplate();
    
    // Get the expected formatted length based on configuration
    let expectedLength = 10; // DD.MM.YYYY
    if (this.config.showTime) {
      expectedLength += 6; // + HH:MM
      if (this.config.showSeconds) {
        expectedLength += 3; // + :SS
      }
    }
    
    // Calculate difference between actual length and expected length
    const lengthDiff = value.length - expectedLength;

    // If no difference, or deletion occurred (negative difference), reset and handle normally
    if (lengthDiff <= 0) {
      // Get only the digits from the input value
      const digits = value.replace(/\D/g, '');
      
      // If there are no digits, reset to default
      if (digits.length === 0) {
        this.updateDateInput();
        return;
      }
      
      // Update input with the formatted version
      this.updateInputWithDigits(input, digits);
      
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
    // Create a properly formatted template
    let day = '00', month = '00', year = '0000';
    let hours = '00', minutes = '00', seconds = '00';
    
    // Apply digits to template slots
    if (digits.length >= 1) day = (digits[0] + '0').substring(0, 2);
    if (digits.length >= 2) day = digits.substring(0, 2);
    if (digits.length >= 3) month = (digits.substring(2, 3) + '0').substring(0, 2);
    if (digits.length >= 4) month = digits.substring(2, 4);
    if (digits.length >= 5) year = (digits.substring(4, 8) + '0000').substring(0, 4);
    
    // Handle time components if needed
    if (this.config.showTime) {
      if (digits.length >= 9) hours = (digits.substring(8, 10) + '00').substring(0, 2);
      if (digits.length >= 11) minutes = (digits.substring(10, 12) + '00').substring(0, 2);
      
      if (this.config.showSeconds && digits.length >= 13) {
        seconds = (digits.substring(12, 14) + '00').substring(0, 2);
      }
    }
    
    // Build the formatted date string
    let formattedValue = `${day}.${month}.${year}`;
    if (this.config.showTime) {
      formattedValue += ` ${hours}:${minutes}`;
      if (this.config.showSeconds) {
        formattedValue += `:${seconds}`;
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
   * Returns a formatted date template based on configuration
   * @returns {string} Date template (e.g., "DD.MM.YYYY HH:MM:SS")
   */
  getFormattedDateTemplate() {
    let template = 'DD.MM.YYYY';
    if (this.config.showTime) {
      template += ' HH:MM';
      if (this.config.showSeconds) {
        template += ':SS';
      }
    }
    return template;
  }
  
  /**
   * Calculate cursor position after mobile input
   * @param {number} digitCount - Number of digits entered
   * @param {boolean} showTime - Whether time is displayed
   * @param {boolean} showSeconds - Whether seconds are displayed
   * @returns {number} New cursor position
   */
  calculateNewCursorPosition(digitCount, showTime, showSeconds) {
    // Positions based on DD.MM.YYYY HH:MM:SS format
    const posMap = {
      1: 1,  // After first digit of day
      2: 3,  // After dot following day
      3: 4,  // After first digit of month
      4: 6,  // After dot following month
      5: 7,  // After first digit of year
      6: 8,  // After second digit of year
      7: 9,  // After third digit of year
      8: 10, // After fourth digit of year
    };
    
    if (showTime) {
      posMap[9] = 12;  // After first digit of hour
      posMap[10] = 13; // After second digit of hour
      posMap[11] = 15; // After first digit of minute
      posMap[12] = 16; // After second digit of minute
      
      if (showSeconds) {
        posMap[13] = 18; // After first digit of second
        posMap[14] = 19; // After second digit of second
      }
    }
    
    // Get the position based on digit count
    return posMap[Math.min(digitCount, Object.keys(posMap).length)] || 0;
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(3, monthString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(3, monthString);
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(6, yearString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(6, yearString);
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(3, month);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(3, month);
    }
  }
  
  /**
   * Shows the date picker dropdown
   */
  showDatePicker() {
    if (this.isDatePickerVisible()) return;
    
    // Make sure the date picker is visible
    this.datePickerElement.style.display = 'flex';
    
    // For Safari: force a reflow to ensure proper dimensions before calculating position
    void this.datePickerElement.offsetHeight;
    
    // Calculate and set position
    this.updateDatePickerPosition();
    
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(0, dayString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(0, dayString);
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(11, hourString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(11, hourString);
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(14, minuteString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(14, minuteString);
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
        this.overwriteDigitsInInputWithoutFocus(14, minuteString);
      } else {
        // For desktop, use normal behavior with focus
        this.overwriteDigitsInInput(14, minuteString);
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
        this.overwriteDigitsInInputWithoutFocus(14, minuteString);
      } else {
        // For desktop, use normal behavior with focus
        this.overwriteDigitsInInput(14, minuteString);
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
    if (isMobile) {
      // For mobile, update value without changing focus
      this.overwriteDigitsInInputWithoutFocus(17, secondString);
    } else {
      // For desktop, use normal behavior with focus
      this.overwriteDigitsInInput(17, secondString);
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

    // If the field is empty, update it with the full date value.
    if (!currentValue) {
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

    // If field is empty, update with full date value
    if (!currentValue) {
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

    // If the field is empty, update with full date value
    if (!currentValue) {
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
    // If a custom format is specified, use it
    if (this.config.dateFormat) {
      try {
        // Use custom format (implementation would depend on specific formatting library)
        // For now, we'll use the Intl.DateTimeFormat API as a simple example
        const dateTimeFormat = this.createDateTimeFormatter();
        this.elements.dateInput.value = dateTimeFormat.format(this.state.selectedDate);
        return;
      } catch (error) {
        console.error('Error formatting date with custom format:', error);
        // Fall back to default formatting
      }
    }
    
    // Default formatting (DD.MM.YYYY HH:MM:SS)
    // Formatting Basic Date and Time Components
    const day = this.state.selectedDate.getDate().toString().padStart(2, '0');
    const month = (this.state.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.state.selectedDate.getFullYear();
    const hours = this.state.selectedDate.getHours().toString().padStart(2, '0');
    const minutes = this.state.selectedDate.getMinutes().toString().padStart(2, '0');

    // Format with or without time depending on the settings
    if (this.config.showTime) {
      // Format with or without seconds depending on the settings
      if (this.config.showSeconds) {
        // Format with seconds (DD.MM.YYYY HH:MM:SS)
        const seconds = this.state.selectedDate.getSeconds().toString().padStart(2, '0');
        this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      } else {
        // Format without seconds (DD.MM.YYYY HH:MM)
        this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}`;
      }
    } else {
      // Format without seconds (DD.MM.YYYY)
      this.elements.dateInput.value = `${day}.${month}.${year}`;
    }
  }
  
  /**
   * Creates a date-time formatter based on current configuration
   * @returns {Intl.DateTimeFormat} DateTimeFormat object
   */
  createDateTimeFormatter() {
    const options = {};
    
    // Always include day, month, year for date part
    options.day = '2-digit';
    options.month = '2-digit';
    options.year = 'numeric';
    
    // Add time components if enabled
    if (this.config.showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      
      // Add seconds if enabled
      if (this.config.showSeconds) {
        options.second = '2-digit';
      }
      
      // Use 24-hour format
      options.hour12 = false;
    }
    
    // Create formatter using specified locale or browser default
    return new Intl.DateTimeFormat(this.config.dateFormat, options);
  }

  /**
   * Handles value change in the input field
   * @param {boolean} updateInput - Whether to update the input field after processing
   * @returns {boolean} Processing success
   */
  handleInputChange(updateInput = true) {
    // Get the value from the input field
    const inputValue = this.elements.dateInput.value;
    
    // Let's try to parse the date from the format
    let newDate;
    
    // If a custom format is specified, let's try to use it for parsing
    if (this.config.dateFormat) {
      try {
        // For simplicity, we use the Date constructor taking into account the user's locale.
        newDate = new Date(inputValue);
      } catch (error) {
        console.error('Error parsing date with custom format:', error);
        // If it doesn't work, try standard formats
        newDate = this.parseDateFromStandardFormat(inputValue);
      }
    } else {
      // We use standard formats
      newDate = this.parseDateFromStandardFormat(inputValue);
    }
    
    // Check that the date is correct
    if (newDate && !isNaN(newDate.getTime())) {
      // We update all states
      this.state.currentDate = new Date(newDate);
      this.state.selectedDate = new Date(newDate);
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
      // If the date is incorrect, restore the current value
      if (updateInput) {
        this.updateDateInput();
      }
      return false;
    }
  }
  
  /**
   * Parses date from standard format DD.MM.YYYY [HH:MM[:SS]]
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
   * @returns {Date} Selected date
   */
  getDate() {
    return new Date(this.state.selectedDate);
  }

  /**
   * Sets the date
   * @param {Date} date - New date
   */
  setDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Calendula: Invalid date');
    }

    this.state.currentDate = new Date(date);
    this.state.selectedDate = new Date(date);
    this.state.selectedHour = date.getHours();
    this.state.selectedTenMinute = Math.floor(date.getMinutes() / 10) * 10;
    this.state.selectedMinute = date.getMinutes() % 10;
    this.state.selectedSecond = date.getSeconds();

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
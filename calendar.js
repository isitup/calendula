/**
 * DateTimePicker - Date and Time Picker Component
 * Creates an interactive calendar with time selection in the specified container
 */
class DateTimePicker {
  /**
   * Creates an instance of DateTimePicker
   * @param {string|HTMLElement} container - Selector or DOM element of the container
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('DateTimePicker: Container not found');
    }

    // Default settings
    this.config = {
      showSeconds: options.showSeconds !== undefined ? options.showSeconds : true,
      minuteStep: options.minuteStep || 1,
      initialDate: options.initialDate || new Date(),
      inputField: options.inputField || null,
      onChange: options.onChange || null
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

    // Initialize component
    this.init();
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
    inputContainer.className = 'input-container';

    // Create date input field (if not provided externally)
    if (!this.config.inputField) {
      this.dateInput = document.createElement('input');
      this.dateInput.type = 'text';
      this.dateInput.className = 'date-input';
      this.dateInput.placeholder = 'DD.MM.YYYY HH:MM:SS';
      inputContainer.appendChild(this.dateInput);
    } else {
      this.dateInput = this.config.inputField;
    }

    // Main calendar container
    const dateTimePicker = document.createElement('div');
    dateTimePicker.className = 'date-time-picker';

    // Container for calendar
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';

    // Calendar header with month navigation
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'calendar-header';
    calendarHeader.innerHTML = `
      <div class="month-nav">
        <button id="prevMonth">&lt;</button>
        <div class="month-title" id="monthTitle"></div>
        <button id="nextMonth">&gt;</button>
      </div>
    `;

    // Grid for calendar days
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    calendarGrid.id = 'calendarGrid';

    // Container for time
    const timeContainer = document.createElement('div');
    timeContainer.className = 'time-container';

    // Hours section
    const hoursSection = document.createElement('div');
    hoursSection.className = 'time-section';
    hoursSection.innerHTML = `
      <div class="time-title">Hours</div>
      <div class="time-grid hours-grid" id="hoursGrid"></div>
    `;

    // Minutes section
    const minutesSection = document.createElement('div');
    minutesSection.className = 'time-section';
    minutesSection.innerHTML = `
      <div class="time-title">Minutes</div>
      <div class="time-section-container">
        <div class="time-title" style="font-size: 12px; margin-top: 8px;">Tens</div>
        <div class="time-grid ten-minutes-grid" id="tenMinutesGrid"></div>
        <div class="time-title" style="font-size: 12px; margin-top: 8px;">Minutes</div>
        <div class="time-grid minutes-grid" id="minutesGrid"></div>
      </div>
    `;

    // Seconds section
    const secondsSection = document.createElement('div');
    secondsSection.className = 'time-section';
    secondsSection.innerHTML = `
      <div class="time-title">Seconds</div>
      <div class="time-grid seconds-grid" id="secondsGrid"></div>
    `;

    // Assemble DOM structure
    calendarContainer.appendChild(calendarHeader);
    calendarContainer.appendChild(calendarGrid);

    timeContainer.appendChild(hoursSection);
    timeContainer.appendChild(minutesSection);
    timeContainer.appendChild(secondsSection);

    dateTimePicker.appendChild(calendarContainer);
    dateTimePicker.appendChild(timeContainer);

    // If using external input field, don't add inputContainer
    if (!this.config.inputField) {
      this.container.appendChild(inputContainer);
    }

    this.container.appendChild(dateTimePicker);

    // Save references to created elements
    this.datePickerElement = dateTimePicker;
  }

  /**
   * Finds DOM elements
   */
  findElements() {
    this.elements = {
      dateInput: this.dateInput,
      monthTitle: this.container.querySelector('#monthTitle'),
      prevMonthBtn: this.container.querySelector('#prevMonth'),
      nextMonthBtn: this.container.querySelector('#nextMonth'),
      calendarGrid: this.container.querySelector('#calendarGrid'),
      hoursGrid: this.container.querySelector('#hoursGrid'),
      tenMinutesGrid: this.container.querySelector('#tenMinutesGrid'),
      minutesGrid: this.container.querySelector('#minutesGrid'),
      secondsGrid: this.container.querySelector('#secondsGrid')
    };
  }

  /**
   * Applies settings to the interface
   */
  applyConfig() {
    // Manage seconds visibility
    const secondsSection = this.datePickerElement.querySelector('.time-section:last-child');
    if (secondsSection) {
      secondsSection.style.display = this.config.showSeconds ? 'block' : 'none';
    }

    // Manage minutes display
    const minuteStep = this.config.minuteStep;

    // Find minute elements
    const minutesSection = this.datePickerElement.querySelector('.time-section:nth-child(2)');
    if (!minutesSection) return;

    const minuteSectionContainer = minutesSection.querySelector('.time-section-container');
    if (!minuteSectionContainer) return;

    const minutesTitle = minutesSection.querySelector('.time-title');
    const tenMinutesTitle = minuteSectionContainer.querySelector('.time-title:nth-child(1)');
    const minutesSubtitle = minuteSectionContainer.querySelector('.time-title:nth-child(3)');

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
    this.elements.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.elements.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    // Track cursor position in input field
    this.elements.dateInput.addEventListener('click', (e) => {
      this.state.cursorPosition = e.target.selectionStart;
    });

    // Handle key presses for digit overwrite
    this.elements.dateInput.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Handle Enter to apply changes
    this.elements.dateInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.handleInputChange();
      }
    });

    // Handle text selection with mouse
    this.elements.dateInput.addEventListener('mouseup', (e) => {
      setTimeout(() => {
        this.state.cursorPosition = e.target.selectionStart;
      }, 0);
    });

    // Handle focus on input field
    this.elements.dateInput.addEventListener('focus', (e) => {
      if (!this.state.cursorPosition) {
        e.target.selectionStart = 0;
        e.target.selectionEnd = 0;
        this.state.cursorPosition = 0;
      }
    });
  }

  /**
   * Key press handler for the input field
   */
  handleKeyDown(e) {
    // Process only printable characters and Backspace/Delete
    const isPrintableChar = e.key.length === 1;
    const isDeleteOrBackspace = e.key === 'Delete' || e.key === 'Backspace';

    // Ignore non-printable characters except Backspace/Delete
    if (!isPrintableChar && !isDeleteOrBackspace) {
      return;
    }

    // Ignore combinations with modifiers
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    e.preventDefault(); // Cancel default behavior

    const input = this.elements.dateInput;
    const cursorPos = input.selectionStart;
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
   * Updates the month title
   */
  updateMonthTitle() {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.elements.monthTitle.textContent = `${months[this.state.currentDate.getMonth()]} ${this.state.currentDate.getFullYear()}`;
  }

  /**
   * Switches the month
   * @param {number} delta - Direction of change (-1 - previous, +1 - next)
   */
  changeMonth(delta) {
    this.state.currentDate.setMonth(this.state.currentDate.getMonth() + delta);
    this.updateMonthTitle();
    this.renderCalendarDays();

    // Update month in the input field
    const month = (this.state.currentDate.getMonth() + 1).toString().padStart(2, '0');
    this.overwriteDigitsInInput(3, month);
  }

  /**
   * Renders calendar days
   */
  renderCalendarDays() {
    // Clear calendar
    this.elements.calendarGrid.innerHTML = '';

    // Add weekdays
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekdays.forEach(day => {
      const dayElement = document.createElement('div');
      dayElement.className = 'weekday';
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
      emptyDay.className = 'calendar-day empty-day';
      this.elements.calendarGrid.appendChild(emptyDay);
    }

    // Add days of the current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = day;

      // Highlight today
      if (day === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear()) {
        dayElement.classList.add('today');
      }

      // Highlight selected day
      if (day === this.state.selectedDate.getDate() &&
          month === this.state.selectedDate.getMonth() &&
          year === this.state.selectedDate.getFullYear()) {
        dayElement.classList.add('selected');
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

    // Update day in the input field
    const dayString = day.toString().padStart(2, '0');
    this.overwriteDigitsInInput(0, dayString);

    // Вызываем колбэк, если задан
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
      hourElement.className = 'time-item';
      hourElement.textContent = hour.toString().padStart(2, '0');

      if (hour === this.state.selectedHour) {
        hourElement.classList.add('selected');
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

    // Update hours in the input field
    const hourString = hour.toString().padStart(2, '0');
    this.overwriteDigitsInInput(11, hourString);

    // Вызываем колбэк, если задан
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
      minuteElement.className = 'time-item';
      minuteElement.textContent = minute.toString().padStart(2, '0');

      if (minute === this.state.selectedTenMinute) {
        minuteElement.classList.add('selected');
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

    // Обновляем выбранное время
    this.state.selectedDate.setMinutes(minute + this.state.selectedMinute);

    // Redraw tens of minutes
    this.renderTenMinutes();

    // Update minutes in the input field
    const minuteString = (minute + this.state.selectedMinute).toString().padStart(2, '0');
    this.overwriteDigitsInInput(14, minuteString);

    // Вызываем колбэк, если задан
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
        minuteElement.className = 'time-item';
        minuteElement.textContent = minute.toString();

        if (minute === this.state.selectedMinute) {
          minuteElement.classList.add('selected');
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
        minuteElement.className = 'time-item';
        minuteElement.textContent = minute.toString().padStart(2, '0');

        // Check if this minute button should be selected
        const isSelected = minute <= currentMinutes && currentMinutes < minute + step;
        if (isSelected) {
          minuteElement.classList.add('selected');
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
    if (this.config.minuteStep === 1) {
      // Standard mode - store tens and units separately
      this.state.selectedMinute = minute;

      // Обновляем выбранное время
      this.state.selectedDate.setMinutes(this.state.selectedTenMinute + minute);

      // Перерисовываем минуты
      this.renderMinutes();

      // Обновляем минуты в поле ввода
      const minuteString = (this.state.selectedTenMinute + minute).toString().padStart(2, '0');
      this.overwriteDigitsInInput(14, minuteString);
    } else {
      // Step mode - set minutes directly
      this.state.selectedDate.setMinutes(minute);

      // For convenience, update state properties too
      this.state.selectedTenMinute = Math.floor(minute / 10) * 10;
      this.state.selectedMinute = minute % 10;

      // Перерисовываем минуты
      this.renderMinutes();

      // Обновляем минуты в поле ввода
      const minuteString = minute.toString().padStart(2, '0');
      this.overwriteDigitsInInput(14, minuteString);
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
      secondElement.className = 'time-item';
      secondElement.textContent = second.toString().padStart(2, '0');

      if (second <= this.state.selectedSecond && this.state.selectedSecond < second + 5) {
        secondElement.classList.add('selected');
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

    // Update seconds in the input field
    const secondString = second.toString().padStart(2, '0');
    this.overwriteDigitsInInput(17, secondString);

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

    // Если поле пустое, обновляем его полным значением даты
    if (!currentValue) {
      this.updateDateInput();
      return;
    }

    let newInputValue = '';
    let valueIndex = 0;

    // Строим новую строку, заменяя только цифры на указанных позициях
    for (let i = 0; i < currentValue.length; i++) {
      if (i >= startPosition && valueIndex < newValue.length) {
        // Если мы находимся на позиции цифры для замены
        if (/\d/.test(currentValue[i])) {
          // Заменяем цифру
          newInputValue += newValue[valueIndex];
          valueIndex++;
        } else {
          // Сохраняем нецифровые символы (точки, двоеточия, пробелы)
          newInputValue += currentValue[i];
        }
      } else {
        // Сохраняем символы вне диапазона замены
        newInputValue += currentValue[i];
      }
    }

    // Обновляем значение поля ввода
    input.value = newInputValue;

    // Обновляем календарь в соответствии с новым значением
    this.handleInputChange(false);

    // Устанавливаем позицию курсора после последней вставленной цифры
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
   * Replaces multiple digits in the input field (for pasting)
   * @param {number} startPosition - Initial cursor position
   * @param {string} digits - String of digits to paste
   */
  overwriteMultipleDigits(startPosition, digits) {
    const input = this.elements.dateInput;
    const currentValue = input.value;

    // Если поле пустое, обновляем полным значением даты
    if (!currentValue) {
      this.updateDateInput();
      return;
    }

    let newInputValue = currentValue;
    let currentPos = startPosition;
    let digitsReplaced = 0;

    // Для каждой цифры во вставляемом содержимом
    for (let i = 0; i < digits.length; i++) {
      // Находим следующую позицию цифры в поле ввода от текущей позиции
      while (currentPos < newInputValue.length && !/\d/.test(newInputValue[currentPos])) {
        currentPos++;
      }

      // Если достигнут конец поля ввода, останавливаемся
      if (currentPos >= newInputValue.length) {
        break;
      }

      // Заменяем цифру на текущей позиции
      newInputValue =
        newInputValue.substring(0, currentPos) +
        digits[i] +
        newInputValue.substring(currentPos + 1);

      digitsReplaced++;
      currentPos++;
    }

    // Обновляем значение поля ввода
    input.value = newInputValue;

    // Обновляем календарь
    this.handleInputChange(false);

    // Устанавливаем курсор после последней замененной цифры
    input.focus();

    // Находим хорошую позицию курсора после вставленного содержимого
    let newPosition = startPosition;
    let digitsFound = 0;

    // Перемещаемся по строке, подсчитывая цифры, пока не найдем все, что мы заменили
    while (newPosition < newInputValue.length && digitsFound < digitsReplaced) {
      if (/\d/.test(newInputValue[newPosition])) {
        digitsFound++;
      }
      newPosition++;
    }

    input.selectionStart = newPosition;
    input.selectionEnd = newPosition;
    this.state.cursorPosition = newPosition;
  }

  /**
   * Updates the input field value based on the selected date
   */
  updateDateInput() {
    // Форматируем базовые компоненты даты и времени
    const day = this.state.selectedDate.getDate().toString().padStart(2, '0');
    const month = (this.state.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.state.selectedDate.getFullYear();
    const hours = this.state.selectedDate.getHours().toString().padStart(2, '0');
    const minutes = this.state.selectedDate.getMinutes().toString().padStart(2, '0');

    // Форматируем с секундами или без в зависимости от настроек
    if (this.config.showSeconds) {
      // Формат с секундами (DD.MM.YYYY HH:MM:SS)
      const seconds = this.state.selectedDate.getSeconds().toString().padStart(2, '0');
      this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    } else {
      // Формат без секунд (DD.MM.YYYY HH:MM)
      this.elements.dateInput.value = `${day}.${month}.${year} ${hours}:${minutes}`;
    }
  }

  /**
   * Handles value change in the input field
   * @param {boolean} updateInput - Whether to update the input field after processing
   * @returns {boolean} Processing success
   */
  handleInputChange(updateInput = true) {
    // Получаем значение из поля ввода
    const inputValue = this.elements.dateInput.value;

    // Шаблоны для форматов с секундами и без
    const regexWithSeconds = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    const regexWithoutSeconds = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;

    // Пытаемся сопоставить с подходящим форматом в зависимости от настроек
    let match;
    let seconds = 0;

    if (this.config.showSeconds) {
      match = inputValue.match(regexWithSeconds);
      if (match) {
        const [_, day, month, year, hours, minutes, secs] = match;
        seconds = parseInt(secs);
      }
    } else {
      match = inputValue.match(regexWithoutSeconds);
    }

    if (match) {
      const [_, day, month, year, hours, minutes] = match;

      // Создаем новую дату из введенного значения
      const newDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        seconds
      );

      // Проверяем, что дата корректна
      if (!isNaN(newDate.getTime())) {
        // Обновляем все состояния
        this.state.currentDate = new Date(newDate);
        this.state.selectedDate = new Date(newDate);
        this.state.selectedHour = newDate.getHours();
        this.state.selectedTenMinute = Math.floor(newDate.getMinutes() / 10) * 10;
        this.state.selectedMinute = newDate.getMinutes() % 10;
        this.state.selectedSecond = newDate.getSeconds();

        // Перерисовываем все компоненты
        this.renderCalendarDays();
        this.renderHours();
        this.renderTenMinutes();
        this.renderMinutes();

        // Отрисовываем секунды только если они отображаются
        if (this.config.showSeconds) {
          this.renderSeconds();
        }

        // Обновляем поле ввода только если запрошено (чтобы избежать циклов)
        if (updateInput) {
          this.updateDateInput();
        }

        // Вызываем колбэк, если задан
        if (typeof this.config.onChange === 'function') {
          this.config.onChange(this.state.selectedDate);
        }

        return true;
      } else {
        // Если дата некорректна, восстанавливаем текущее значение
        if (updateInput) {
          this.updateDateInput();
        }
        return false;
      }
    } else {
      // Если формат некорректен, восстанавливаем текущее значение
      if (updateInput) {
          this.updateDateInput();
      }
      return false;
    }
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
      throw new Error('DateTimePicker: Invalid date');
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

    if (this.config.showSeconds) {
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
    if (config.showSeconds !== undefined) {
      this.config.showSeconds = config.showSeconds;
    }

    if (config.minuteStep !== undefined) {
      this.config.minuteStep = config.minuteStep;
    }

    if (config.onChange !== undefined) {
      this.config.onChange = config.onChange;
    }

    // Apply new configuration
    this.applyConfig();
    this.renderMinutes();
    this.updateDateInput();
  }
}
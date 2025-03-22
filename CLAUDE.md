# Calendar Component Guidelines

## Project Structure
- Single-page calendar date/time picker component
- Core files: calendar.js, styles.css, index.html
- Pure JavaScript implementation (no framework dependencies)

## Commands
- Open index.html in a browser to view and test the component
- No specific build process required as this is native JS
- Testing can be done by manually checking UI interactions

## Code Style Guidelines
- **Formatting**: 2-space indentation, semicolons required
- **Naming**: camelCase for variables/methods, PascalCase for classes
- **Organization**: Group related methods together (UI, events, state management)
- **Documentation**: JSDoc comments for all public methods and classes
- **Error Handling**: Use try/catch for parsing operations, show errors in console
- **Mobile Support**: Check `window.matchMedia('(max-width: 540px)').matches` for mobile detection
- **Language**: Comments and interface must be in english by default

## State Management
- Use the `state` and `config` objects for storing component state
- Always update UI after state changes with appropriate render methods

## DOM Manipulation
- Create UI elements programmatically in createElements()
- Use event delegation where possible
- Focus management: use overwriteDigitsInInputWithoutFocus() on mobile
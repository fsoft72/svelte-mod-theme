# CSS3 Theme Components

This directory contains Web Components for the CSS3 theme system.

## Components

### Color Picker Component

A modern Web Component for live color editing with CSS custom properties.

## Features

- **Live Color Updates**: Real-time modification of CSS custom properties
- **Persistent Storage**: Automatically saves color preferences to localStorage
- **Modern CSS**: Uses OKLCH color space for better color representation
- **Responsive Design**: Works on desktop and mobile devices
- **Accessible**: Keyboard navigation and screen reader friendly
- **Custom Events**: Dispatches events for external integration

## Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="components/color-picker.js"></script>
  </head>
  <body>
    <color-picker></color-picker>
  </body>
</html>
```

### Programmatic Control

```javascript
// Get reference to the component
const colorPicker = document.querySelector("color-picker");

// Listen for color changes
colorPicker.addEventListener("colors-changed", function (event) {
  console.log("New colors:", event.detail);
});

// Set colors programmatically
colorPicker.setColors({
  mode1: "#4f46e5" /* Primary color */,
  mode2: "#059669" /* Secondary color */,
  mode3: "#ea580c" /* Tertiary color */,
  mode4: "#9333ea" /* Accent color */,
});

// Get current colors
const currentColors = colorPicker.getColors();

// Show/hide the panel
colorPicker.show();
colorPicker.hide();
```

## CSS Custom Properties

The component updates these CSS custom properties on the document root:

- `--liwe3-color-mode1`: mode1 color in OKLCH format
- `--liwe3-color-mode2`: mode2 color in OKLCH format
- `--liwe3-color-mode3`: mode3 color in OKLCH format
- `--liwe3-color-mode4`: mode4 color in OKLCH format

## Events

### `colors-changed`

Fired whenever colors are updated.

```javascript
colorPicker.addEventListener("colors-changed", function (event) {
  const colors = event.detail; // { mode1: '#...', mode2: '#...', ... }
});
```

## Public Methods

### `setColors(colors)`

Set all or specific colors programmatically.

```javascript
colorPicker.setColors({
  mode1: "#ff0000",
  mode2: "#00ff00",
  // Other colors remain unchanged
});
```

### `getColors()`

Get current color values as hex strings.

```javascript
const colors = colorPicker.getColors();
// Returns: { mode1: '#4f46e5', mode2: '#059669', ... }
```

### `show()`

Show the color picker panel.

### `hide()`

Hide the color picker panel.

## Customization

The component uses CSS custom properties that can be overridden:

```css
color-picker {
  --liwe3-mode1-500: #your-color;
  --liwe3-surface-raised: #your-background;
  --liwe3-text-mode1: #your-text-color;
  /* ... and many more */
}
```

## Browser Support

- Chrome 91+
- Firefox 90+
- Safari 14+
- Edge 91+

Requires support for:

- Web Components (Custom Elements v1)
- ES6 Classes
- CSS Custom Properties
- Shadow DOM

---

## Theme Switcher Component

A self-contained Web Component for dark/light theme switching with automatic system preference detection.

### Features

- 🌙 Dark/Light mode toggle
- 🔄 Automatic system preference detection
- 💾 Persistent theme preference storage
- ♿ Full accessibility support (ARIA labels, keyboard navigation, screen reader announcements)
- 📱 Responsive design with mobile positioning
- ✨ Smooth animations and hover effects
- 🎯 Triple-click for auto mode (follows system preference)
- 🎨 Integrates with CSS custom properties theme system

### Usage

#### Basic Usage

Simply add the component to your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module" src="components/theme-switcher.js"></script>
  </head>
  <body>
    <!-- Your content -->

    <!-- Theme Switcher -->
    <theme-switcher></theme-switcher>
  </body>
</html>
```

#### CSS Theme Variables

The component works with CSS custom properties using the `data-theme` attribute on the `<html>` element. Define your theme variables like this:

```css
/* Light theme (default) */
:root {
  --liwe3-surface-raised: #ffffff;
  --liwe3-border-default: #d1d5db;
  --liwe3-mode1-500: #4f46e5;
  /* ... other variables */
}

/* Dark theme */
[data-theme="dark"] {
  --liwe3-surface-raised: #1f2937;
  --liwe3-border-default: #374151;
  --liwe3-mode1-500: #6366f1;
  /* ... other variables */
}
```

### JavaScript API

```javascript
// Get reference to the theme switcher
const themeSwitcher = document.querySelector("theme-switcher");

// Programmatically set theme
themeSwitcher.setTheme("dark"); // or 'light'

// Get current theme
const currentTheme = themeSwitcher.getTheme();

// Toggle theme programmatically
themeSwitcher.toggle();

// Listen for theme changes
themeSwitcher.addEventListener("theme-changed", (event) => {
  console.log("Theme changed to:", event.detail.theme);
});
```

### Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support (Enter/Space to toggle)
- **Screen Reader Announcements**: Announces theme changes
- **Focus Management**: Visible focus indicators
- **High Contrast**: Works with system high contrast modes

### Advanced Features

#### Auto Mode

Triple-click the theme switcher to enable auto mode, which follows the system color scheme preference and doesn't save a manual preference.

#### System Preference Detection

The component automatically detects the user's system color scheme preference using `prefers-color-scheme` media query and updates the theme accordingly (when no manual preference is set).

### Events

The component dispatches the following events:

- `theme-changed`: Fired when theme changes
  - `event.detail.theme`: The new theme ('light' or 'dark')

## License

MIT License

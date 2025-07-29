/**
 * Color Picker Web Component
 *
 * A customizable color picker component that allows users to modify CSS custom properties
 * for mode1, mode2, mode3, and mode4 colors in real-time.
 *
 * Usage:
 *   <color-picker></color-picker>
 *
 * Events:
 *   - colors-changed: Fired when colors are updated, with detail containing current colors
 *
 * Public Methods:
 *   - setThemeMode(mode): Set the theme mode (light or dark)
 *   - setColors(colors): Set colors programmatically for current theme mode
 *   - getColors(): Get current theme mode color values
 *   - show(): Show the color picker panel
 *   - hide(): Hide the color picker panel
 *
 * Features:
 *   - Automatic localStorage persistence
 *   - OKLCH color conversion for modern CSS
 *   - Responsive design with mobile support
 *   - Accessible keyboard navigation
 */

class ColorPicker extends HTMLElement {
	constructor() {
		super();
		this.attachShadow( { mode: 'open' } );

		// Default colors (matching CSS defaults)
		this.defaultColors = {
			light: {
				mode1: '#4f46e5',    // Approximation of oklch(0.65 0.2 220)
				mode2: '#059669',  // Approximation of oklch(0.6 0.15 160)
				mode3: '#ea580c',   // Approximation of oklch(0.55 0.18 30)
				mode4: '#9333ea'      // Approximation of oklch(0.65 0.25 320)
			},
			dark: {
				mode1: '#a78bfa',    // Approximation of oklch(0.75 0.3 240)
				mode2: '#34d399',  // Approximation of oklch(0.7 0.2 180)
				mode3: '#fb923c',   // Approximation of oklch(0.65 0.25 40)
				mode4: '#c084fc'      // Approximation of oklch(0.75 0.35 300)
			}
		};

		this.themeMode = 'light'; // Default theme
		this.isVisible = false;
	}

	LS_MODE_KEY = 'liwe3-theme-mode';
	LS_DARK_THEME_KEY = 'liwe3-dark-theme';
	LS_LIGHT_THEME_KEY = 'liwe3-light-theme';

	connectedCallback () {
		this.render();
		this.setupEventListeners();
		this.loadColors();
		this.updateColors();
	}

	render () {
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1001;
                }

                .toggle-panel {
                    background: var(--liwe3-mode1-500, #4f46e5);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .toggle-panel:hover {
                    transform: scale(1.1);
                    background: var(--liwe3-mode1-600, #4338ca);
                }

                .color-picker-panel {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--liwe3-surface-raised, #ffffff);
                    border: 2px solid var(--liwe3-border-default, #d1d5db);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    min-width: 280px;
                    backdrop-filter: blur(10px);
                    display: none;
                    color: var(--liwe3-text-mode1, #111827);
                }

                .color-picker-panel.visible {
                    display: block;
                }

                .color-picker-panel h3 {
                    margin: 0 0 1rem 0;
                    color: var(--liwe3-text-mode1, #111827);
                    font-size: 1.1rem;
                    text-align: center;
                }

                .color-picker-group {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1rem;
                    gap: 1rem;
                }

                .color-picker-group:last-of-type {
                    margin-bottom: 0;
                }

                .color-picker-label {
                    flex: 1;
                    font-weight: 600;
                    color: var(--liwe3-text-mode1, #111827);
                    font-size: 0.9rem;
                }

                .color-picker {
                    width: 50px;
                    height: 35px;
                    border: 2px solid var(--liwe3-border-default, #d1d5db);
                    border-radius: 6px;
                    cursor: pointer;
                    background: none;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .color-picker:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .color-picker:focus {
                    outline: 2px solid var(--liwe3-mode1-500, #4f46e5);
                    outline-offset: 2px;
                }

                .color-value-display {
                    font-family: 'Courier New', monospace;
                    font-size: 0.75rem;
                    color: var(--liwe3-text-mode3, #6b7280);
                    margin-left: 0.5rem;
                    min-width: 80px;
                }

                .reset-button {
                    width: 100%;
                    padding: 0.5rem;
                    margin-top: 1rem;
                    background: var(--liwe3-gray-200, #f3f4f6);
                    color: var(--liwe3-text-mode1, #111827);
                    border: 1px solid var(--liwe3-border-default, #d1d5db);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }

                .reset-button:hover {
                    background: var(--liwe3-gray-300, #e5e7eb);
                }

                @media (max-width: 768px) {
                    :host {
                        bottom: 20px;
                        top: auto;
                        right: 20px;
                        left: 20px;
                    }

                    .color-picker-panel {
                        position: fixed;
                        top: auto;
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                        max-width: none;
                    }

                    .toggle-panel {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        top: auto;
                    }
                }
            </style>

            <button class="toggle-panel" title="Toggle Color Picker">🎨</button>

            <div class="color-picker-panel">
                <h3>🎨 Live Color Editor</h3>
				<p>Current theme mode: <strong>${ this.themeMode }</strong></p>

                <div class="color-picker-group">
                    <label class="color-picker-label">mode1:</label>
                    <input type="color" class="color-picker" data-color="mode1" value="${ this.defaultColors[ this.themeMode ].mode1 }">
                    <span class="color-value-display">${ this.defaultColors[ this.themeMode ].mode1 }</span>
                </div>

                <div class="color-picker-group">
                    <label class="color-picker-label">mode2:</label>
                    <input type="color" class="color-picker" data-color="mode2" value="${ this.defaultColors[ this.themeMode ].mode2 }">
                    <span class="color-value-display">${ this.defaultColors[ this.themeMode ].mode2 }</span>
                </div>

                <div class="color-picker-group">
                    <label class="color-picker-label">mode3:</label>
                    <input type="color" class="color-picker" data-color="mode3" value="${ this.defaultColors[ this.themeMode ].mode3 }">
                    <span class="color-value-display">${ this.defaultColors[ this.themeMode ].mode3 }</span>
                </div>

                <div class="color-picker-group">
                    <label class="color-picker-label">mode4:</label>
                    <input type="color" class="color-picker" data-color="mode4" value="${ this.defaultColors[ this.themeMode ].mode4 }">
                    <span class="color-value-display">${ this.defaultColors[ this.themeMode ].mode4 }</span>
                </div>

                <button class="reset-button">Reset to Default</button>
            </div>
        `;
	}

	setupEventListeners () {
		const toggleBtn = this.shadowRoot.querySelector( '.toggle-panel' );
		const panel = this.shadowRoot.querySelector( '.color-picker-panel' );
		const resetBtn = this.shadowRoot.querySelector( '.reset-button' );
		const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );

		// Toggle panel visibility
		toggleBtn.addEventListener( 'click', ( e ) => {
			e.stopPropagation();
			this.togglePanel();
		} );

		// Update colors when picker values change
		colorPickers.forEach( picker => {
			picker.addEventListener( 'input', () => this.updateColors() );
			picker.addEventListener( 'change', () => this.saveColors() );
		} );

		// Reset to default colors
		resetBtn.addEventListener( 'click', () => this.resetColors() );

		// Close panel when clicking outside
		document.addEventListener( 'click', ( event ) => {
			if ( !this.contains( event.target ) ) {
				this.hidePanel();
			}
		} );
	}

	togglePanel () {
		const toggleBtn = this.shadowRoot.querySelector( '.toggle-panel' );
		const panel = this.shadowRoot.querySelector( '.color-picker-panel' );

		this.isVisible = !this.isVisible;

		if ( this.isVisible ) {
			panel.classList.add( 'visible' );
			toggleBtn.textContent = '✕';
		} else {
			panel.classList.remove( 'visible' );
			toggleBtn.textContent = '🎨';
		}
	}

	hidePanel () {
		const toggleBtn = this.shadowRoot.querySelector( '.toggle-panel' );
		const panel = this.shadowRoot.querySelector( '.color-picker-panel' );

		if ( this.isVisible ) {
			this.isVisible = false;
			panel.classList.remove( 'visible' );
			toggleBtn.textContent = '🎨';
		}
	}

	updateColors () {
		const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );
		const colorValues = this.shadowRoot.querySelectorAll( '.color-value-display' );
		const { mode } = this.getCurrentTheme();

		colorPickers.forEach( ( picker, index ) => {
			const colorType = picker.dataset.color;
			const colorValue = picker.value;
			const oklchValue = this.hexToOklch( colorValue );
			const varName = `--liwe3-${ mode }-${ colorType }`;
			console.log( `Setting ${ varName } to ${ oklchValue }` );

			// Update CSS custom property on document root
			document.documentElement.style.setProperty( varName, oklchValue );

			// Update value display
			colorValues[ index ].textContent = colorValue;
		} );

		// Dispatch custom event for external listeners
		this.dispatchEvent( new CustomEvent( 'colors-changed', {
			detail: this.getCurrentColors(),
			bubbles: true
		} ) );
	}

	getCurrentColors () {
		const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );
		const colors = {};

		colorPickers.forEach( picker => {
			colors[ picker.dataset.color ] = picker.value;
		} );

		return colors;
	}

	getCurrentTheme () {
		const currentMode = localStorage.getItem( this.LS_MODE_KEY ) || 'light';
		const currentTheme = currentMode === 'dark' ? this.LS_DARK_THEME_KEY : this.LS_LIGHT_THEME_KEY;
		const saved = localStorage.getItem( currentTheme );
		return { colors: saved ? JSON.parse( saved ) : this.defaultColors[ currentMode ], mode: currentMode };
	}

	resetColors () {
		const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );

		colorPickers.forEach( picker => {
			const colorType = picker.dataset.color;
			picker.value = this.defaultColors[ this.themeMode ][ colorType ];
		} );

		this.updateColors();
		this.saveColors();
	}

	saveColors () {
		const colors = this.getCurrentColors();
		const { colors: saved, mode } = this.getCurrentTheme();
		const currentColors = { ...saved, ...colors };
		const lsKey = mode === 'dark' ? this.LS_DARK_THEME_KEY : this.LS_LIGHT_THEME_KEY;
		localStorage.setItem( lsKey, JSON.stringify( currentColors ) );
	}

	loadColors () {
		const { colors } = this.getCurrentTheme();
		console.log( 'Loading colors:', colors );
		if ( colors ) {
			try {
				const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );

				colorPickers.forEach( picker => {
					const colorType = picker.dataset.color;
					if ( colors[ colorType ] ) {
						picker.value = colors[ colorType ];
					}
				} );
			} catch ( e ) {
				console.warn( 'Failed to load saved colors:', e );
			}
		}
	}

	// Color conversion utility - Convert hex to OKLCH
	hexToOklch ( hex ) {
		// Convert hex to RGB
		const r = parseInt( hex.slice( 1, 3 ), 16 ) / 255;
		const g = parseInt( hex.slice( 3, 5 ), 16 ) / 255;
		const b = parseInt( hex.slice( 5, 7 ), 16 ) / 255;

		// Convert RGB to linear RGB
		const toLinear = ( c ) => c <= 0.04045 ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
		const rLin = toLinear( r );
		const gLin = toLinear( g );
		const bLin = toLinear( b );

		// Convert linear RGB to XYZ (D65 illuminant)
		const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
		const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.0721750 * bLin;
		const z = 0.0193339 * rLin + 0.1191920 * gLin + 0.9503041 * bLin;

		// Convert XYZ to Lab
		const fx = x > 0.008856 ? Math.pow( x, 1 / 3 ) : ( 7.787 * x + 16 / 116 );
		const fy = y > 0.008856 ? Math.pow( y, 1 / 3 ) : ( 7.787 * y + 16 / 116 );
		const fz = z > 0.008856 ? Math.pow( z, 1 / 3 ) : ( 7.787 * z + 16 / 116 );

		const L = 116 * fy - 16;
		const a = 500 * ( fx - fy );
		const bVal = 200 * ( fy - fz );

		// Convert Lab to LCH
		const C = Math.sqrt( a * a + bVal * bVal );
		let H = Math.atan2( bVal, a ) * 180 / Math.PI;
		if ( H < 0 ) H += 360;

		// Approximate conversion to OKLCH (simplified)
		const lightness = Math.max( 0, Math.min( 1, L / 100 ) );
		const chroma = Math.max( 0, Math.min( 0.4, C / 150 ) );
		const hue = H;

		return `oklch(${ lightness.toFixed( 3 ) } ${ chroma.toFixed( 3 ) } ${ hue.toFixed( 0 ) })`;
	}

	// Public API methods
	setThemeMode ( mode ) {
		if ( [ 'light', 'dark' ].includes( mode ) ) {
			this.themeMode = mode;
			localStorage.setItem( this.LS_MODE_KEY, mode );
			this.loadColors();
			this.updateColors();
		}
	}

	setColors ( colors ) {
		if ( !colors || typeof colors !== 'object' ) {
			console.warn( 'Invalid colors object provided.' );
			return;
		}
		const colorPickers = this.shadowRoot.querySelectorAll( '.color-picker' );

		colorPickers.forEach( picker => {
			const colorType = picker.dataset.color;
			if ( colors?.[ colorType ] ) {
				picker.value = colors[ colorType ];
			}
		} );

		this.updateColors();
	}

	getColors () {
		return this.getCurrentColors();
	}

	show () {
		if ( !this.isVisible ) {
			this.togglePanel();
		}
	}

	hide () {
		if ( this.isVisible ) {
			this.togglePanel();
		}
	}
}

// Define the custom element
customElements.define( 'color-picker', ColorPicker );

// Export for ES modules
export default ColorPicker;

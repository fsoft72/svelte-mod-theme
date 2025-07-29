/**
 * ThemeSwitcher Web Component
 * A customizable theme switcher for dark/light mode with auto detection
 */
class ThemeSwitcher extends HTMLElement {
	constructor() {
		super();
		this.attachShadow( { mode: 'open' } );

		// Theme icons
		this.icons = {
			light: '🌙',  // Moon for switching to dark
			dark: '☀️',   // Sun for switching to light
			auto: '🌓'    // Half moon for auto mode
		};

		// State
		this.currentTheme = null;
		this.clickCount = 0;
		this.clickTimer = null;
	}

	LS_MODE_KEY = 'liwe3-theme-mode';

	connectedCallback () {
		this.render();
		this.setupEventListeners();
		this.initializeTheme();
		this.setupSystemThemeListener();
		this.setupInitialAnimation();
	}

	render () {
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 1000;
                }

                .theme-switcher {
                    width: 50px;
                    height: 50px;
                    border: 2px solid var(--liwe3-border-default, #d1d5db);
                    border-radius: 50%;
                    background: var(--liwe3-surface-raised, #ffffff);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    backdrop-filter: blur(10px);
                    appearance: none;
                    outline: none;
                }

                .theme-switcher:hover {
                    transform: scale(1.1) rotate(15deg);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                    border-color: var(--liwe3-mode1-500, #4f46e5);
                }

                .theme-switcher:active {
                    transform: scale(0.95);
                }

                .theme-switcher:focus-visible {
                    outline: 2px solid var(--liwe3-mode1-500, #4f46e5);
                    outline-offset: 2px;
                }

                /* Icon animations */
                .theme-icon {
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .theme-switcher:hover .theme-icon {
                    transform: rotate(-15deg);
                }

                /* Mobile positioning adjustment */
                @media (max-width: 768px) {
                    :host {
                        bottom: 80px;
                        top: auto;
                        right: 20px;
                    }
                }

                /* Screen reader only class */
                .sr-only {
                    position: absolute;
                    left: -10000px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                }
            </style>

            <button class="theme-switcher" title="Toggle Dark/Light Mode" aria-label="Toggle theme">
                <span class="theme-icon" aria-hidden="true">${ this.icons.light }</span>
            </button>
        `;
	}

	setupEventListeners () {
		const button = this.shadowRoot.querySelector( '.theme-switcher' );

		// Main click handler
		button.addEventListener( 'click', () => this.handleClick() );

		// Keyboard accessibility
		button.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Enter' || e.key === ' ' ) {
				e.preventDefault();
				this.handleClick();
			}
		} );
	}

	handleClick () {
		// Handle triple-click for auto mode
		this.clickCount++;

		if ( this.clickTimer ) {
			clearTimeout( this.clickTimer );
		}

		this.clickTimer = setTimeout( () => {
			if ( this.clickCount === 3 ) {
				this.enableAutoMode();
			} else {
				this.toggleTheme();
			}
			this.clickCount = 0;
		}, 500 );
	}

	toggleTheme () {
		this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
		this.applyTheme( this.currentTheme );
		this.addClickAnimation();
	}

	enableAutoMode () {
		localStorage.removeItem( this.LS_MODE_KEY );
		this.currentTheme = window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? 'dark' : 'light';
		this.applyTheme( this.currentTheme );

		// Show auto icon temporarily
		const icon = this.shadowRoot.querySelector( '.theme-icon' );
		icon.textContent = this.icons.auto;
		this.announceToScreenReader( 'Auto theme mode enabled' );

		setTimeout( () => {
			this.applyTheme( this.currentTheme ); // Reset icon
		}, 1500 );
	}

	addClickAnimation () {
		const button = this.shadowRoot.querySelector( '.theme-switcher' );
		button.style.transform = 'scale(0.9) rotate(180deg)';
		setTimeout( () => {
			button.style.transform = '';
		}, 200 );
	}

	getInitialTheme () {
		const savedTheme = localStorage.getItem( this.LS_MODE_KEY );
		if ( savedTheme ) {
			return savedTheme;
		}

		// Check system preference
		if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) {
			return 'dark';
		}

		return 'light';
	}

	applyTheme ( theme ) {
		const html = document.documentElement;
		const icon = this.shadowRoot.querySelector( '.theme-icon' );

		html.setAttribute( 'data-theme', theme );
		icon.textContent = theme === 'dark' ? this.icons.dark : this.icons.light;
		localStorage.setItem( this.LS_MODE_KEY, theme );

		// Update color picker panel styling if it exists
		this.updateColorPickerTheme( theme );

		// Announce theme change for accessibility
		const announcement = theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
		this.announceToScreenReader( announcement );

		// Dispatch custom event for external listeners
		this.dispatchEvent( new CustomEvent( 'theme-changed', {
			detail: { theme },
			bubbles: true
		} ) );
	}

	updateColorPickerTheme ( theme ) {
		const colorPanel = document.getElementById( 'colorPickerPanel' );
		if ( colorPanel ) {
			colorPanel.style.backdropFilter = 'blur(10px)';
			colorPanel.style.background = 'var(--liwe3-surface-raised)';
		}
	}

	announceToScreenReader ( message ) {
		const announcement = document.createElement( 'div' );
		announcement.setAttribute( 'aria-live', 'polite' );
		announcement.setAttribute( 'aria-atomic', 'true' );
		announcement.className = 'sr-only';
		announcement.style.position = 'absolute';
		announcement.style.left = '-10000px';
		announcement.style.width = '1px';
		announcement.style.height = '1px';
		announcement.style.overflow = 'hidden';
		announcement.textContent = message;

		document.body.appendChild( announcement );
		setTimeout( () => document.body.removeChild( announcement ), 1000 );
	}

	initializeTheme () {
		this.currentTheme = this.getInitialTheme();
		this.applyTheme( this.currentTheme );
	}

	setupSystemThemeListener () {
		if ( window.matchMedia ) {
			const mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
			mediaQuery.addEventListener( 'change', ( e ) => {
				// Only auto-switch if user hasn't manually set a preference
				const hasUserPreference = localStorage.getItem( this.LS_MODE_KEY );
				if ( !hasUserPreference ) {
					this.currentTheme = e.matches ? 'dark' : 'light';
					this.applyTheme( this.currentTheme );
				}
			} );
		}
	}

	setupInitialAnimation () {
		const button = this.shadowRoot.querySelector( '.theme-switcher' );
		button.style.opacity = '0';
		button.style.transform = 'scale(0.8)';

		// Smooth reveal animation on page load
		setTimeout( () => {
			button.style.opacity = '1';
			button.style.transform = 'scale(1)';
		}, 300 );
	}

	// Public API methods
	setTheme ( theme ) {
		if ( [ 'light', 'dark' ].includes( theme ) ) {
			this.currentTheme = theme;
			this.applyTheme( theme );
		}
	}

	getTheme () {
		return this.currentTheme;
	}

	// Method to manually trigger theme toggle
	toggle () {
		this.toggleTheme();
	}
}

// Define the custom element
customElements.define( 'theme-switcher', ThemeSwitcher );

// Export for module systems
export default ThemeSwitcher;

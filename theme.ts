import { rgbHexToInt } from '$liwe3/utils/utils';
import chroma from 'chroma-js';
//import { theme, themeModeSet, themeSetModeColors, themeSetLayoutVars } from './theme_store';
import { storeTheme } from './store.svelte';
import { browser } from '$app/environment';

const CSS_ID_PREFIX = 'liwe3-colors-';
const ranges_up = [ 900, 800, 700, 600 ];
const ranges_down = [ 500, 400, 300, 200, 100, 50 ];
const ranges = [ ranges_up, ranges_down ];

type ThemeColorsDefinitions = Record<string, Record<string, string>>;

type ThemeModeType = 'light' | 'dark';

type ThemeDataType = {
	light?: Record<string, string>;
	dark?: Record<string, string>;
	vars?: Record<string, string>;
	mode?: ThemeModeType;
};

const calculateColors = ( name: string, r: number, g: number, b: number ) => {
	const colors = {
		[ `${ name }` ]: chroma( r, g, b ).css(),
		[ `${ name }-900` ]: chroma( r, g, b ).css()
	};
	ranges.forEach( ( range: number[], idx: number ) => {
		const factor: number = ( idx === 0 ) ? 1 : -1;
		range.forEach( ( val ) => {
			const col = chroma( r, g, b ).brighten( ( 500 - val ) / 300 );

			colors[ `${ name }-${ val }` ] = col.css();

			// also calculate the right text color for the background
			colors[ `${ name }-${ val }-text` ] = col.luminance() > 0.7 ? chroma( 48, 48, 48 ).darken( ( 700 + ( val * factor ) ) / 300 ).css()
				: col.luminance() < 0.3 ? chroma( 242, 242, 242 ).brighten( ( 300 + ( val * factor ) ) / 200 ).css()
					: chroma( 48, 48, 48 ).darken( ( 600 + ( val * factor ) ) / 300 ).css(); // intermediate color

			// calculate the border color
			colors[ `${ name }-${ val }-border` ] = chroma( r, g, b )
				.darken( ( 700 + ( val * factor ) ) / 300 )
				.css();

			// calculate the hover color
			colors[ `${ name }-${ val }-hover` ] = chroma( r, g, b )
				.brighten( ( 300 + ( val * factor ) ) / 200 )
				.css();

			// calculate the clicked color
			colors[ `${ name }-${ val }-active` ] = chroma( r, g, b )
				.darken( ( 600 + ( val * factor ) ) / 200 )
				.css();

			// calculate the disabled color
			colors[ `${ name }-${ val }-disabled` ] = chroma( r, g, b )
				.brighten( ( 800 + ( val * factor ) ) / 100 )
				.css();

			// calculate the disabled text color
			colors[ `${ name }-${ val }-disabled-text` ] = '#ccc';
		} );
	} );

	colors[ `${ name }-variant` ] = colors[ `${ name }-700` ];
	colors[ `${ name }-accent` ] = colors[ `${ name }-500` ];

	return colors;
};

// this function takes the name of the color and the object returned by calculateColors
// and injects the css variables in the document
const injectColors = ( name: string, colors: Record<string, string> ) => {
	let style = document.getElementById( CSS_ID_PREFIX + name );
	let is_new = false;

	if ( !style ) {
		style = document.createElement( 'style' );
		style.id = CSS_ID_PREFIX + name;
		is_new = true;
	}

	style.innerHTML =
		`:root {\n` +
		Object.entries( colors )
			.map( ( [ key, value ] ) => `--${ key }: ${ value };` )
			.join( '\n' ) +
		'\n}\n';
	// Inject light and dark theme variables assignements
	// Inject liwe3-form variables assignements. NOTE: mode3 is used as default forms color set
	if ( [ 'light', 'dark' ].includes( name ) ) {
		style.innerHTML += `.liwe3-${ name }-theme {\n` +
			Object.entries( colors )
				.map( ( keyVal ) => `--${ keyVal[ 0 ].replace( `-${ name }`, '' ) }: var(--${ keyVal[ 0 ] });` )
				.join( '\n' ) +
			`
				--liwe3-form-border-width-focus: calc(var(--liwe3-border-width)*2);
				--liwe3-form-bg: var(--liwe3-${ name }-mode3);
				--liwe3-form-text-color: var(--liwe3-${ name }-mode3-500-text);
				--liwe3-form-accent: var(--liwe3-${ name }-mode4);
				--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-700);
				--liwe3-form-border-color: var(--liwe3-${ name }-mode3-200-border);
				--liwe3-form-focus-bg: var(--liwe3-${ name }-mode3-500-hover);
				--liwe3-form-error: var(--liwe3-${ name }-error-500);
				.mode1 {
					--liwe3-form-bg: var(--liwe3-${ name }-mode1);
					--liwe3-form-text-color: var(--liwe3-${ name }-mode1-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-mode1-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-mode1-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-mode1-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-mode1-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-mode1);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode1-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-mode4-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-500-text);
					}
				}
				.mode2 {
					--liwe3-form-bg: var(--liwe3-${ name }-mode2);
					--liwe3-form-text-color: var(--liwe3-${ name }-mode2-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-mode2-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-mode2-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-mode2-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-mode2-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-mode2);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode2-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-mode4-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-500-text);
					}
				}
				.mode3 {
					--liwe3-form-bg: var(--liwe3-${ name }-mode3);
					--liwe3-form-text-color: var(--liwe3-${ name }-mode3-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-mode3-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-mode3-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-mode3-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-mode3-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-mode3);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode3-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-mode4-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-500-text);
					}
				}
				.mode4 {
					--liwe3-form-bg: var(--liwe3-${ name }-mode4);
					--liwe3-form-text-color: var(--liwe3-${ name }-mode4-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-mode4-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-mode4-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-mode4-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-mode4-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-mode4);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-mode4-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-mode4-500-text);
					}
				}
				.link {
					--liwe3-form-bg: var(--liwe3-${ name }-link);
					--liwe3-form-text-color: var(--liwe3-${ name }-link-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-link-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-link-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-link-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-link-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-link);
						--liwe3-form-accent-color: var(--liwe3-${ name }-link-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-link-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-link-500-text);
					}
				}
				.info {
					--liwe3-form-bg: var(--liwe3-${ name }-info);
					--liwe3-form-text-color: var(--liwe3-${ name }-info-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-info-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-info-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-info-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-info-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-info);
						--liwe3-form-accent-color: var(--liwe3-${ name }-info-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-info-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-info-500-text);
					}
				}
				.success {
					--liwe3-form-bg: var(--liwe3-${ name }-success);
					--liwe3-form-text-color: var(--liwe3-${ name }-success-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-success-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-success-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-success-500-text) !important;
						--liwe3-form-legend: var(--liwe3-${ name }-success-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-success);
						--liwe3-form-accent-color: var(--liwe3-${ name }-success-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-success-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-success-500-text);
					}
				}
				.warning {
					--liwe3-form-bg: var(--liwe3-${ name }-warning);
					--liwe3-form-text-color: var(--liwe3-${ name }-warning-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-warning-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-warning-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-warning-500-text);
						--liwe3-form-legend: var(--liwe3-${ name }-warning-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-warning);
						--liwe3-form-accent-color: var(--liwe3-${ name }-warning-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-warning-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-warning-500-text);
					}
				}
				.error {
					--liwe3-form-bg: var(--liwe3-${ name }-error);
					--liwe3-form-text-color: var(--liwe3-${ name }-error-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-error-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-error-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-error-500-text);
						--liwe3-form-legend: var(--liwe3-${ name }-error-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-error);
						--liwe3-form-accent-color: var(--liwe3-${ name }-error-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-error-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-error-500-text);
					}
				}
				.dark {
					--liwe3-form-bg: var(--liwe3-${ name }-background);
					--liwe3-form-text-color: var(--liwe3-${ name }-background-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-background-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-background-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-background-500-text);
						--liwe3-form-legend: var(--liwe3-${ name }-background-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-background);
						--liwe3-form-accent-color: var(--liwe3-${ name }-background-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-background-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-background-500-text);
					}
				}
				.background {
					--liwe3-form-bg: var(--liwe3-${ name }-background);
					--liwe3-form-text-color: var(--liwe3-${ name }-background-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-background-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-background-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-background-500-text);
						--liwe3-form-legend: var(--liwe3-${ name }-background-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-background);
						--liwe3-form-accent-color: var(--liwe3-${ name }-background-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-background-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-background-500-text);
					}
				}
				.color {
					--liwe3-form-bg: var(--liwe3-${ name }-text);
					--liwe3-form-text-color: var(--liwe3-${ name }-text-500-text);
					--liwe3-form-border-color: var(--liwe3-${ name }-text-200-border);
					--liwe3-form-focus-bg: var(--liwe3-${ name }-text-500-hover);
					&.liwe3-form-custom-input {
						--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-text-500-text);
						--liwe3-form-legend: var(--liwe3-${ name }-text-200-border);
					}
					&.liwe3-form-custom-checkbox-radio {
						--liwe3-form-accent: var(--liwe3-${ name }-text);
						--liwe3-form-accent-color: var(--liwe3-${ name }-text-500-text);
					}
					&.liwe3-form-radio-group input[type=radio]:checked+label {
						--liwe3-form-accent: var(--liwe3-${ name }-text-500-hover);
						--liwe3-form-accent-color: var(--liwe3-${ name }-text-500-text);
					}
				}
				.liwe3-form-custom-switch {
					--liwe3-form-text-placeholder-color: var(--liwe3-${ name }-mode3-700-text);
					--liwe3-form-radius: var(--liwe3-border-radius);
				}
				.liwe3-form-custom-btn {
					--liwe3-form-btn-primary: var(--liwe3-${ name }-mode3);
					--liwe3-form-btn-default-text: var(--liwe3-${ name }-mode3-500-text);
					--liwe3-form-radius: var(--liwe3-border-radius);
				}
				.liwe3-form-radio-group {
					max-width: fit-content;
				}
				.svelte-select {
					--font-size: var(--liwe3-font-size);
					--height: calc(var(--font-size) + calc(var(--liwe3-input-padding-y) * 8));
					--max-height: calc(var(--height) + .2rem);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-mode3-200-border);
					--input-padding: var(--liwe3-input-padding-y);
					--value-container-padding: var(--liwe3-input-padding-y) var(--liwe3-input-padding-y);
					.value-container > input {
						padding-block: clamp(1px,var(--input-padding) * 2.5,15px);
						padding-inline: clamp(5px,var(--input-padding) * 4,20px);
					}
					&.xxs {
						padding: 0.12rem 0.2rem !important;
						font-size: 0.75rem;
						min-width: calc(var(--liwe3-input-w-unit) * 4);
					}
					&.xs {
						padding: 0.15rem 0.22rem !important;
						font-size: 0.75rem;
						min-width: calc(var(--liwe3-input-w-unit) * 5);
					}
					&.sm {
						padding: 0.18rem 0.24rem !important;
						font-size: 0.875rem;
						min-width: calc(var(--liwe3-input-w-unit) * 6);
					}
					&.md {
						/* padding is the default value defined in css variables */
						font-size: 1rem;
						min-width: calc(var(--liwe3-input-w-unit) * 7);
					}
					&.lg {
						padding: 0.22rem 0.28rem !important;
						font-size: 1.12rem;
						min-width: calc(var(--liwe3-input-w-unit) * 8);
					}
					&.xl {
						padding: 0.24rem 0.4rem !important;
						font-size: 1.25rem;
						min-width: calc(var(--liwe3-input-w-unit) * 9);
					}
					&.xxl {
						padding: 0.28rem 0.45rem !important;
						font-size: 1.5rem;
						min-width: calc(var(--liwe3-input-w-unit) * 10);
					}
				}
				.svelte-select.mode1 {
					--background: var(--liwe3-${ name }-mode1);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-mode1-200-border);
					--placeholder-color: var(--liwe3-${ name }-mode1-500-text);
					--item-color: var(--liwe3-${ name }-mode1-500-text);
					--item-hover-color: var(--liwe3-${ name }-mode1-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-mode1-700-hover);
					--list-background: var(--liwe3-${ name }-mode1);
				}
				.svelte-select.mode2 {
					--background: var(--liwe3-${ name }-mode2);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-mode2-200-border);
					--placeholder-color: var(--liwe3-${ name }-mode2-500-text);
					--item-color: var(--liwe3-${ name }-mode2-500-text);
					--item-hover-color: var(--liwe3-${ name }-mode2-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-mode2-700-hover);
					--list-background: var(--liwe3-${ name }-mode2);
				}
				.svelte-select.mode3 {
					--background: var(--liwe3-${ name }-mode3);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-mode3-200-border);
					--placeholder-color: var(--liwe3-${ name }-mode3-500-text);
					--item-color: var(--liwe3-${ name }-mode3-500-text);
					--item-hover-color: var(--liwe3-${ name }-mode3-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-mode3-700-hover);
					--list-background: var(--liwe3-${ name }-mode3);
				}
				.svelte-select.mode4 {
					--background: var(--liwe3-${ name }-mode4);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-mode4-200-border);
					--placeholder-color: var(--liwe3-${ name }-mode4-500-text);
					--item-color: var(--liwe3-${ name }-mode4-500-text);
					--item-hover-color: var(--liwe3-${ name }-mode4-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-mode4-700-hover);
					--list-background: var(--liwe3-${ name }-mode4);
				}
				.svelte-select.link {
					--background: var(--liwe3-${ name }-link);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-link-200-border);
					--placeholder-color: var(--liwe3-${ name }-link-500-text);
					--item-color: var(--liwe3-${ name }-link-500-text);
					--item-hover-color: var(--liwe3-${ name }-link-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-link-700-hover);
					--list-background: var(--liwe3-${ name }-link);
				}
				.svelte-select.info {
					--background: var(--liwe3-${ name }-info);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-info-200-border);
					--placeholder-color: var(--liwe3-${ name }-info-500-text);
					--item-color: var(--liwe3-${ name }-info-500-text);
					--item-hover-color: var(--liwe3-${ name }-info-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-info-700-hover);
					--list-background: var(--liwe3-${ name }-info);
				}
				.svelte-select.success {
					--background: var(--liwe3-${ name }-success);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-success-200-border);
					--placeholder-color: var(--liwe3-${ name }-success-500-text);
					--item-color: var(--liwe3-${ name }-success-500-text);
					--item-hover-color: var(--liwe3-${ name }-success-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-success-700-hover);
					--list-background: var(--liwe3-${ name }-success);
				}
				.svelte-select.warning {
					--background: var(--liwe3-${ name }-warning);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-warning-200-border);
					--placeholder-color: var(--liwe3-${ name }-warning-500-text);
					--item-color: var(--liwe3-${ name }-warning-500-text);
					--item-hover-color: var(--liwe3-${ name }-warning-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-warning-700-hover);
					--list-background: var(--liwe3-${ name }-warning);
				}
				.svelte-select.error {
					--background: var(--liwe3-${ name }-error);
					--border-radius: var(--liwe3-border-radius);
					--border: var(--liwe3-border-width) solid var(--liwe3-${ name }-error-200-border);
					--placeholder-color: var(--liwe3-${ name }-error-500-text);
					--item-color: var(--liwe3-${ name }-error-500-text);
					--item-hover-color: var(--liwe3-${ name }-error-500-hover);
					--item-hover-bg: var(--liwe3-${ name }-error-700-hover);
					--list-background: var(--liwe3-${ name }-error);
				}
				\n\n`;
	}

	if ( is_new ) document.head.appendChild( style );
};

const injectVars = ( values: Record<string, string> ) => {
	const name = CSS_ID_PREFIX + 'layout';
	let style = document.getElementById( name );
	let is_new = false;

	if ( !style ) {
		style = document.createElement( 'style' );
		style.id = name;
		is_new = true;
	}

	style.innerHTML =
		`:root {\n` +
		Object.entries( values )
			.map( ( [ key, value ] ) => `--liwe3-${ key }: ${ value };` )
			.join( '\n' ) +
		'\n}\n';
	if ( is_new ) document.head.appendChild( style );
};

export const exportThemeCss = () => {
	const exp: string[] = [];

	const main = document.querySelector( 'style[data-vite-dev-id$="liwe3-styles.css"]' );

	if ( !main )
		console.warn( `Style 'liwe3-styles.css' not found` );
	// NOTE: main must be before layout to override default css vars
	[ 'light', 'dark', 'main', 'layout' ].forEach( ( name ) => {
		if ( name === 'main' ) {
			main && exp.push( main.innerHTML );
			return;
		}
		const style = document.getElementById( CSS_ID_PREFIX + name );
		if ( !style ) {
			console.warn( `Style ${ CSS_ID_PREFIX + name } not found` );
			return;
		}
		exp.push( style.innerHTML );
	} );
	console.log( exp.join( '\n\n' ) );
	return exp.join( '\n\n' );
};

export const themeCreate = ( colorsDefinitions: ThemeColorsDefinitions ) => {
	let modes: Record<string, string> = {};
	let colors: Record<string, string> = {};

	Object.keys( colorsDefinitions ).forEach( ( name ) => {
		if ( name === 'vars' ) {
			injectVars( colorsDefinitions[ name ] );
			return;
		}
		colors = colorsDefinitions[ name ];
		Object.entries( colors ).forEach( ( [ mode, col ] ) => {
			const values = rgbHexToInt( col );
			const mode_colors = calculateColors( `liwe3-${ name }-${ mode }`, values[ 0 ], values[ 1 ], values[ 2 ] );
			modes = { ...modes, ...mode_colors };
		} );

		injectColors( name, modes );
		modes = {};
	} );
};

export const themeCreateDefault = ( themeData: ThemeDataType ) => {
	const themeStore = storeTheme.theme;

	if ( browser ) {
		// check if the user has saved a theme in local storage
		const lightTheme = localStorage.getItem( `liwe3-light-theme` );
		if ( lightTheme )
			storeTheme.setModeColors( 'light', JSON.parse( lightTheme ) );
		else if ( themeData.light ) storeTheme.setModeColors( 'light', themeData.light );

		const darkTheme = localStorage.getItem( `liwe3-dark-theme` );
		if ( darkTheme )
			storeTheme.setModeColors( 'dark', JSON.parse( darkTheme ) );
		else if ( themeData.dark ) storeTheme.setModeColors( 'dark', themeData.dark );

		const layoutVars = localStorage.getItem( `liwe3-layout-vars` );
		if ( layoutVars )
			storeTheme.setLayoutVars( JSON.parse( layoutVars ) );
		else if ( themeData.vars ) storeTheme.setLayoutVars( themeData.vars );

		let themeMode = localStorage.getItem( `liwe3-theme-mode` );
		if ( !themeMode ) themeMode = themeData.mode || 'light';
		themeSetMode( themeMode == 'dark' ? 'dark' : 'light' );

		themeCreate( {
			light: themeStore.light,
			dark: themeStore.dark,
			vars: themeStore.vars
		} );
	}
};

export const themeSetMode = ( mode: 'light' | 'dark' ) => {
	if ( browser ) {
		// remove 'liwe3-dark|light-theme' class
		document.body.classList.remove( `liwe3-light-theme` );
		document.body.classList.remove( `liwe3-dark-theme` );

		document.body.classList.add( `liwe3-${ mode }-theme` );

		localStorage.setItem( `liwe3-theme-mode`, mode );

		storeTheme.modeSet( mode );
	}
};

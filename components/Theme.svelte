<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { PUBLIC_PROJECT_KEY } from '$env/static/public';
	import {
		THEME_PARTS,
		type ThemeDataType,
		type ThemeModeType,
		type ThemePartsType,
		type ColorsType,
		type ThemeDataArg,

		type ColorModeType

	} from '$modules/theme/types';

	import themeStore from '$modules/theme/store.svelte';
	import { runeDebug } from '$liwe3/utils/runes.svelte';

	type ThemePropsType = {
		themeMode?: ThemeModeType;												// Theme mode (light/dark)
		themeData?: ThemeDataType | undefined;									// Colors by theme mode
		onColorsChanged?: (mode: ThemeModeType, colors: ColorsType, save?: boolean) => void;	// Callback for color changes
		injection?: boolean;													// Whether to inject styles
	};

	const prefix = PUBLIC_PROJECT_KEY ? `${PUBLIC_PROJECT_KEY}-` : '';
	const lsKey = 'theme';

	let { themeMode = 'light', themeData, onColorsChanged, injection = true }: ThemePropsType = $props();

	const defaultThemeParts: ThemePartsType[] = THEME_PARTS;

	let themeParts: ThemePartsType[] = $state(
		Array.isArray(themeData?.parts) && themeData.parts.length > 0
			? themeData.parts
			: defaultThemeParts
	);

	function _hexToRgb(hex:string): { r: number; g: number; b: number } {
		if (hex.length === 4) {
			return {
				r: parseInt(hex[1] + hex[1], 16),
				g: parseInt(hex[2] + hex[2], 16),
				b: parseInt(hex[3] + hex[3], 16),
			};
		} else if (hex.length === 7) {
			return {
				r: parseInt(hex[1] + hex[2], 16),
				g: parseInt(hex[3] + hex[4], 16),
				b: parseInt(hex[5] + hex[6], 16),
			};
		}
		return { r: 0, g: 0, b: 0 };
	}

	function _rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
		r /= 255;
		g /= 255;
		b /= 255;

		// Gamma correction
		r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
		g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
		b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

		// Convert to Oklab
		const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
		const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
		const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
		const l_ = Math.cbrt(l);
		const m_ = Math.cbrt(m);
		const s_ = Math.cbrt(s);

		const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
		const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
		const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

		// Then convert Oklab to OKLCH
		const C = Math.sqrt(a * a + b_ * b_);
		let H = Math.atan2(b_, a) * (180 / Math.PI);
		if (H < 0) H += 360;

		return { l: L, c: C, h: H };
	}

	function _setCssVariable(colorType: ColorModeType, value: string): void {
		if (!browser) return;

		const oklchValue = hexToOklch(value);
		const varName = `--liwe3-${themeStore.getMode()}-${colorType}`;
		//console.log(`Setting CSS variable ${varName} to ${oklchValue}`);
		document.documentElement.style.setProperty(varName, oklchValue);
	}

	/**
	 * Convert hex color to OKLCH format
	 * @param hex - Hex color string (e.g., '#ff0000')
	 * @returns OKLCH color string (e.g., 'oklch(0.628 0.225 29)')
	 */
	const hexToOklch = (hex: string): string => {
		const { r, g, b } = _hexToRgb(hex);
		const { l, c, h } = _rgbToOklch(r, g, b);
		return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(0)})`;
	};

	/**
	 * Update CSS custom properties
	 */
	const applyThemeColors = (): void => {
		if (!browser) return;

		Object.entries(themeStore.getColors()).forEach(([colorType, colorValue]) => {
			_setCssVariable(colorType, colorValue);
		});
	};

	const toLocalStorage = ( value: ThemeDataArg) => {
		if (!browser) return;

		if (!prefix || prefix.length === 0)
			console.warn('No prefix set for localStorage, this may cause conflicts with other projects.');

		const stringValue = JSON.stringify(value);
		localStorage.setItem(prefix + lsKey, stringValue);
		return value;
	};

	const getFromLocalStorage = (key: string): ThemeDataArg | null => {
		if (!browser) return null;
		const value = localStorage.getItem(prefix + key);
		if (value === null) return null;
		try {
			return JSON.parse(value) as ThemeDataArg;
		} catch (e) {
			console.error(`Error parsing localStorage value for key "${key}":`, e);
			return null;
		}
	};

	const getStoredValues = ( updateOnly:boolean) => {
		if(updateOnly) return { tmpMode: null, tmpLight: null, tmpDark: null, tmpParts: null };

		const localStorageValues = getFromLocalStorage( lsKey );

		const tmpMode = localStorageValues?.mode || null;
		const tmpLight = localStorageValues?.light || null;
		const tmpDark = localStorageValues?.dark || null;
		const tmpParts = localStorageValues?.parts || null;
		return { tmpMode, tmpLight, tmpDark, tmpParts };
	};

	const _updateValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined, updateOnly: boolean = false) => {
		if (!browser || !injection) return false;

		console.log('=== Theme updating values:', { mode, data, updateOnly });

		const { tmpMode, tmpLight, tmpDark, tmpParts } = getStoredValues(updateOnly);

		if( tmpMode || mode ){
			themeStore.setMode ( tmpMode && Object.keys(tmpMode).length > 0
				? (tmpMode as ThemeModeType)
				: mode as ThemeModeType);
		}
		if( tmpDark || data?.dark ){
			console.log('=== Theme updating dark values:', { tmpDark, data });
			themeStore.setDark (tmpDark && Object.keys(tmpDark).length > 0
				? (tmpDark as ThemeDataType['dark'])
				: data?.dark as ThemeDataType['dark']);
		}
		if( tmpLight || data?.light ){
			console.log('=== Theme updating light values:', { tmpLight, data });
			themeStore.setLight ( tmpLight && Object.keys(tmpLight).length > 0
				? (tmpLight as ThemeDataType['light'])
				: data?.light as ThemeDataType['light']);
		}
		if( tmpParts || data?.parts ){
			themeParts = tmpParts && Array.isArray(tmpParts) && tmpParts.length > 0
				? (tmpParts as ThemePartsType[])
				: data?.parts as ThemePartsType[];
		}

		applyThemeColors();
	};

	export const saveToLocalStorage = (): void => {
		if (!browser) return;

		const localStorageData: ThemeDataArg = {
			mode: themeStore.getMode(),
			dark: themeStore.getDark(),
			light: themeStore.getLight(),
			parts: themeParts
		};
		//console.log('=== Theme setting localStorage data:', localStorageData);
		toLocalStorage(localStorageData);
	};

	export const getCurrentValues = (): ThemeDataArg | undefined => {
		return {
			mode: themeStore.getMode(),
			light: themeStore.getLight(),
			dark: themeStore.getDark()
		};
	}

	/** Read values from localStorage and update it if key is not found
	 * @param mode ThemeModeType
	 * @param data ThemeDataType
	 */
	export const setBaseValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined) => {
		_updateValues(mode, data);
	};

	/** Use this with ColorPicker onColorsConfirmed callback to update the theme dynamically.
	 */
	export const updateBaseValues = () => {
		_updateValues(themeStore.getMode(), themeStore.getColors(), true);
	};

	/** Use this with ColorPicker onColorsConfirmed callback to update the theme dynamically.
	 * 	Write values to localStorage overwriting existing ones.
	 */
	export const confirmBaseValues = () => {
		_updateValues(themeStore.getMode(), themeStore.getColors(), true);
		saveToLocalStorage();
	};

	export const setColor = (colorType: ColorModeType, value: string): void => {
		if (!browser) return;
		themeStore.setColor(colorType, value);
		_setCssVariable(colorType, value);
	};

	export const setTheme = (mode: ThemeModeType) => {
		if (!browser) return;
		themeStore.setMode(mode);
	};

	onMount(() => {
		if (!browser) return;
		console.log('=== Theme mounted with data:', themeData);
		if(themeMode)
			themeStore.setMode(themeMode);
		else
			themeMode = themeStore.getMode();

		setBaseValues(themeStore.getMode(), themeData);
		saveToLocalStorage();
	});
</script>

<svelte:head>
	{#each THEME_PARTS as part}
		{#if themeParts.includes(part)}
			<link rel="stylesheet" href={`/theme/${part}.css`} />
		{/if}
	{/each}
</svelte:head>
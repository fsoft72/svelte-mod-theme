import type { Color } from '$liwe3/types/types';
import { browser } from '$app/environment';

export const THEME_PARTS = [ 'fonts', 'theme', 'styles', 'typography', 'grid', 'forms', 'buttons', 'colors', 'colors-preset', 'forms-preset', 'buttons-preset', 'svelte-select-preset' ] as const;

export type ThemePartsType = typeof THEME_PARTS[ number ];
export type ThemeModeType = 'light' | 'dark';
export type ThemeDataType = {
	light: Record<string, string>;
	dark: Record<string, string>;
	parts?: ThemePartsType[];
};
export type ThemeDataArg = ThemeDataType & { mode?: ThemeModeType; };
type StoreThemeType = {
	mode: ThemeModeType;
	theme: ThemeDataType;
	modesAvailable: () => Color[];
	get: ( mode: ThemeModeType ) => Record<string, string>;
	setDarkMode: ( dark: boolean ) => void;
	modeSet: ( mode: ThemeModeType ) => void;
	setModeColors: ( mode: ThemeModeType, color: Record<string, string> ) => void;
	setModeColor: ( type: ThemeModeType, mode: string, color: string ) => void;
	setThemeParts: ( parts: ThemePartsType[] ) => void;
	getThemeParts: () => ThemePartsType[];
};

const defaultThemeParts: ThemePartsType[] = [ 'fonts', 'theme', 'styles', 'typography' ];
// define default modes
const themeModes: Color[] = [
	'mode1',
	'mode2',
	'mode3',
	'mode4',
	'info',
	'error',
	'warning',
	'success',
	'dark',
	'background',
	'color',
	'link'
];

const toLocalStorage = ( key: string, value: Record<string, string> | string[] | string ) => {
	if ( !browser )
		return;
	const stringValue = JSON.stringify( value );
	localStorage.setItem( key, stringValue );
};

export const storeTheme: StoreThemeType = $state( {
	mode: 'light',
	theme: {
		light: {
			mode1: '#a3c8ff',
			mode2: '#c8d7e4',
			mode3: '#e8e8e8',
			mode4: '#b9c6da',
			info: '#94bdff',
			error: '#fb5228',
			warning: '#feaa34',
			success: '#19d29a',
			dark: '#000000',
			background: '#f0f0f0',
			color: '#202122',
			link: '#74a5d2'
		},
		dark: {
			mode1: '#6b6b6b',
			mode2: '#363636',
			mode3: '#404040',
			mode4: '#764baa',
			info: '#8888dd',
			error: '#e73104',
			warning: '#ff990a',
			success: '#6dc06d',
			dark: '#000000',
			background: '#404040',
			color: '#d9d9d9',
			link: '#f0f0ff'
		},
		parts: defaultThemeParts
	},
	modesAvailable: () => themeModes,
	get: ( mode: ThemeModeType ) => {
		return storeTheme.theme[ mode ];
	},
	setDarkMode: ( dark: boolean ) => {
		storeTheme.mode = dark ? 'dark' : 'light';
	},
	modeSet: ( mode: ThemeModeType ) => {
		storeTheme.mode = mode;
	},
	setModeColors: ( mode: ThemeModeType, color: Record<string, string> ) => {
		storeTheme.theme[ mode ] = color;
		toLocalStorage( `liwe3-${ mode }-theme`, color );
	},
	setModeColor: ( type: ThemeModeType, mode: string, color: string ) => {
		if ( !storeTheme.theme[ type ][ mode ] ) {
			console.warn( `Color ${ mode } not found in ${ type } theme` );
			return;
		}
		storeTheme.theme[ type ][ mode ] = color;
		toLocalStorage( `liwe3-${ type }-theme`, storeTheme.theme[ type ] );
	},
	setThemeParts: ( parts: ThemePartsType[] ) => {
		storeTheme.theme.parts = parts;
		toLocalStorage( 'liwe3-theme-parts', parts );
	},
	getThemeParts: () => {
		return storeTheme.theme.parts || [];
	}
} );
import type { Color } from '$liwe3/types/types';
import { themeCreate } from './theme';
import { browser } from '$app/environment';

type ThemeModeType = 'light' | 'dark';

type ThemeStore = {
	light: Record<string, string>;
	dark: Record<string, string>;
	vars: Record<string, string>;
};

type StoreThemeType = {
	mode: ThemeModeType;
	theme: ThemeStore;
	modesAvailable: () => Color[];
	defaultLayoutVars: () => Record<string, string>;
	layoutUnits: () => Record<string, string>;
	get: ( mode: ThemeModeType ) => Record<string, string>;
	setDarkMode: ( dark: boolean ) => void;
	modeSet: ( mode: ThemeModeType ) => void;
	setModeColors: ( mode: ThemeModeType, color: Record<string, string> ) => void;
	setModeColor: ( type: ThemeModeType, mode: string, color: string ) => void;
	setLayoutVars: ( vars: Record<string, string> ) => void;
	setLayoutVar: ( name: string, value: string ) => void;
	resetLayoutVars: () => void;
};

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

const defaultLayoutVars: Record<string, string> = {
	'font-size': '20px',
	'font-weight': '400',
	'line-height': '1.2rem',
	'border-radius': '0.15rem',
	'border-width': '1px',
	'border-style': 'solid',
	'button-padding-y': '0.35rem',
	'button-padding-x': '0.5rem',
	'input-padding-y': '0.15rem',
	'input-padding-x': '0.15rem'
};

const themeLayoutUnits: Record<string, string> = {
	'font-size': 'px',
	'font-weight': 'number',
	'line-height': 'rem',
	'border-radius': 'rem',
	'border-width': 'px',
	'border-style': 'string',
	'button-padding-y': 'rem',
	'button-padding-x': 'rem',
	'input-padding-y': 'rem',
	'input-padding-x': 'rem'
};

const toLocaleStorage = ( key: string, value: Record<string, string> | string ) => {
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
		vars: { ...defaultLayoutVars }
	},
	modesAvailable: () => themeModes,
	defaultLayoutVars: () => defaultLayoutVars,
	layoutUnits: () => themeLayoutUnits,
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
		toLocaleStorage( `liwe3-${ mode }-theme`, color );
	},
	setModeColor: ( type: ThemeModeType, mode: string, color: string ) => {
		if ( !storeTheme.theme[ type ][ mode ] ) {
			console.warn( `Color ${ mode } not found in ${ type } theme` );
			return;
		}
		storeTheme.theme[ type ][ mode ] = color;
		themeCreate( { [ type ]: storeTheme.theme[ type ] } );
		toLocaleStorage( `liwe3-${ type }-theme`, storeTheme.theme[ type ] );
	},
	setLayoutVars: ( vars: Record<string, string> ) => {
		if ( !storeTheme.theme.vars ) {
			console.warn( 'Layout vars not found' );
			return;
		}
		storeTheme.theme.vars = vars;
		toLocaleStorage( 'liwe3-layout-vars', storeTheme.theme.vars );
	},
	setLayoutVar: ( name: string, value: string ) => {
		if ( !storeTheme.theme.vars[ name ] ) {
			console.warn( `Layout var ${ name } not found` );
			return;
		}
		storeTheme.theme.vars[ name ] = value;
		themeCreate( { vars: storeTheme.theme.vars } );
		toLocaleStorage( 'liwe3-layout-vars', storeTheme.theme.vars );
	},
	resetLayoutVars: () => {
		const vars = { ...defaultLayoutVars };
		storeTheme.theme.vars = vars;
		themeCreate( { vars: vars } );
		toLocaleStorage( 'liwe3-layout-vars', vars );
	}
} );
import type { Color } from '$liwe3/types/types';
import { get, writable } from 'svelte/store';
import { themeCreate } from './theme';
import { browser } from '$app/environment';

type ThemeStore = {
	theme: 'light' | 'dark';
	light: Record<string, string>;
	dark: Record<string, string>;
	vars: Record<string, string>;
};

// define default modes
export const themeModes: Color[] = [
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

export const themeLayoutUnits: Record<string, string> = {
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

// create a writable store for the LiWEUser
export const theme = writable<ThemeStore>( {
	theme: 'light',
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
} );

export const themeGet = ( mode: 'light' | 'dark' ) => {
	const store = get( theme );
	if ( !store ) return {};

	return store[ mode ];
};

export const themeSetDarkMode = ( dark: boolean ) => {
	const store = get( theme );
	if ( !store ) return;

	store.theme = dark ? 'dark' : 'light';
	theme.set( store );
};

export const themeModeGet = () => {
	const store = get( theme );
	if ( !store ) return 'light';

	return store.theme;
};

export const themeModeSet = ( mode: 'light' | 'dark' ) => {
	const store = get( theme );
	if ( !store ) return;

	store.theme = mode;
	theme.set( store );
};

export const themeSetModeColors = ( mode: 'light' | 'dark', color: Record<string, string> ) => {
	const store = get( theme );
	if ( !store ) return;

	store[ mode ] = color;
	theme.set( store );
};

export const themeSetModeColor = ( type: 'light' | 'dark', mode: string, color: string ) => {
	const store = get( theme );
	if ( !store ) return;

	store[ type ][ mode ] = color;
	theme.set( store );

	themeCreate( { [ type ]: store[ type ] } );

	if ( browser ) {
		// save the theme to local storage
		localStorage.setItem( `liwe3-${ store.theme }-theme`, JSON.stringify( store[ store.theme ] ) );
	}
};

export const themeSetLayoutVars = ( vars: Record<string, string> ) => {
	const store = get( theme );
	if ( !store ) return;

	store.vars = vars;
	theme.set( store );
};

export const themeSetLayoutVar = ( name: string, value: string ) => {
	const store = get( theme );
	if ( !store ) return;

	store.vars[ name ] = value;
	theme.set( store );

	themeCreate( { vars: store.vars } );
	if ( browser ) {
		localStorage.setItem( 'liwe3-layout-vars', JSON.stringify( store.vars ) );
	}
};

export const themeResetLayoutVars = () => {
	const vars = { ...defaultLayoutVars };
	themeSetLayoutVars( vars );
	themeCreate( { vars: vars } );
	if ( browser ) {
		localStorage.setItem( 'liwe3-layout-vars', JSON.stringify( vars ) );
	}
};
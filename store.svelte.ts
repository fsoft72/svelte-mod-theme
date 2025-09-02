import { THEME_PARTS } from './types';

import type {
	ThemeDataType,
	ThemeModeType,
	ColorsType,
	DefaultColorsType,
	ColorModeType,
	ThemeDataArg
} from '$modules/theme/types';

export const DEFAULT_COLORS: DefaultColorsType = {
	light: {
		mode1: '#4f46e5',
		mode2: '#059669',
		mode3: '#ea580c',
		mode4: '#9333ea',
		background: '#f3f4f6',
		color: '#111827',
		success: '#10b981',
		warning: '#eab308',
		error: '#ef4444'
	},
	dark: {
		mode1: '#a78bfa',
		mode2: '#34d399',
		mode3: '#fb923c',
		mode4: '#c084fc',
		background: '#1f2937',
		color: '#f3f4f6',
		success: '#10b981',
		warning: '#eab308',
		error: '#ef4444'
	}
};

const themeObject: ThemeDataArg = $state( {
	mode: 'light',
	light: { ...DEFAULT_COLORS.light },
	dark: { ...DEFAULT_COLORS.dark },
	parts: THEME_PARTS
} );
const currentMode: ThemeModeType = $derived( themeObject.mode || 'light' );
const currentDark: ThemeDataType[ 'dark' ] = $derived( themeObject.dark );
const currentLight: ThemeDataType[ 'light' ] = $derived( themeObject.light );
const currentColors: ColorsType = $derived( currentMode === 'light' ? currentLight || {} : currentDark || {} );


const assignValue = ( mode: ThemeModeType, themeData: ThemeDataType[ 'dark' ] | ThemeDataType[ 'light' ] | undefined ) => {
	const data: ThemeDataType[ 'dark' ] | ThemeDataType[ 'light' ] = !themeData || Object.keys( themeData ).length === 0 ? DEFAULT_COLORS[ mode ] : themeData;
	if ( mode === 'light' ) {
		themeObject.light = data;
	} else {
		themeObject.dark = data;
	}
};

const store = {
	initialize: ( themeMode: ThemeModeType, themeData: ThemeDataArg ) => {
		themeObject.mode = themeMode || themeData.mode;
		themeObject.light = { ...DEFAULT_COLORS.light, ...themeData.light };
		themeObject.dark = { ...DEFAULT_COLORS.dark, ...themeData.dark };
		themeObject.parts = themeData.parts || THEME_PARTS;

		if ( typeof document !== 'undefined' && themeObject.mode ) {
			document.documentElement.setAttribute( 'data-theme', themeObject.mode );
		}
	},
	setColor: ( colorType: ColorModeType, value: string ) => {
		if ( currentMode === 'light' ) {
			if ( themeObject.light ) themeObject.light[ colorType ] = value;
		} else {
			if ( themeObject.dark ) themeObject.dark[ colorType ] = value;
		}
	},
	resetColors: () => {
		themeObject.dark = DEFAULT_COLORS.dark;
		themeObject.light = DEFAULT_COLORS.light;
	},
	set mode ( mode: ThemeModeType ) {
		console.log( '=== Setting theme mode in store:', mode );
		themeObject.mode = mode;
		document.documentElement.setAttribute( 'data-theme', mode );
	},
	set dark ( dark: ThemeDataType[ 'dark' ] ) {
		assignValue( 'dark', dark );
	},
	set light ( light: ThemeDataType[ 'light' ] ) {
		assignValue( 'light', light );
	},
	get mode () {
		return currentMode;
	},
	get colors () {
		return currentColors;
	},
	get dark () {
		return currentDark;
	},
	get light () {
		return currentLight;
	}
};

export default store;

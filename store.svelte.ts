import type {
	ThemeDataType,
	ThemeModeType,
	ColorsType,
	DefaultColorsType,
	ColorModeType
} from '$modules/theme/types';

let currentMode: ThemeModeType = $state( 'light' );
let currentDark: ThemeDataType[ 'dark' ] = $state( {} );
let currentLight: ThemeDataType[ 'light' ] = $state( {} );
const currentColors: ColorsType = $derived( currentMode === 'light' ? currentLight || {} : currentDark || {} );

const DEFAULT_COLORS: DefaultColorsType = {
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

const assignValue = ( mode: ThemeModeType, themeData: ThemeDataType[ 'dark' ] | ThemeDataType[ 'light' ] | undefined ) => {
	const data: ThemeDataType[ 'dark' ] | ThemeDataType[ 'light' ] = !themeData || Object.keys( themeData ).length === 0 ? DEFAULT_COLORS[ mode ] : themeData;
	if ( mode === 'light' ) {
		currentLight = data;
	} else {
		currentDark = data;
	}
};

const store = {
	setMode: ( mode: ThemeModeType ) => {
		currentMode = mode;
		document.documentElement.setAttribute( 'data-theme', mode );
	},
	getMode: () => currentMode,
	setDark: ( dark: ThemeDataType[ 'dark' ] ) => {
		console.log( '=== Setting dark theme in store:', dark );
		assignValue( 'dark', dark );
	},
	getDark: () => currentDark,
	setLight: ( light: ThemeDataType[ 'light' ] ) => {
		console.log( '=== Setting light theme in store:', light );
		assignValue( 'light', light );
	},
	getLight: () => currentLight,
	getColors: () => currentColors,
	setColor: ( colorType: ColorModeType, value: string ) => {
		if ( currentMode === 'light' ) {
			if ( currentLight ) currentLight[ colorType ] = value;
		} else {
			if ( currentDark ) currentDark[ colorType ] = value;
		}
	},
	resetColors: () => {
		currentDark = DEFAULT_COLORS.dark;
		currentLight = DEFAULT_COLORS.light;
	},
	getDefaultColors: () => DEFAULT_COLORS
};

export default store;

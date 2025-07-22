import { storeTheme } from './store.svelte';
import { browser } from '$app/environment';

import type { ThemeDataType, ThemeModeType } from './store.svelte';

type ThemeDataArg = ThemeDataType & { mode?: ThemeModeType; };

export const themeCreateDefault = ( themeData: ThemeDataArg ): void => {
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

		let themeMode = localStorage.getItem( `liwe3-theme-mode` );
		if ( !themeMode ) themeMode = themeData.mode || 'light';
		themeSetMode( themeMode == 'dark' ? 'dark' : 'light' );
	}
};

export const themeSetMode = ( mode: ThemeModeType ): void => {
	if ( browser ) {
		// remove 'liwe3-dark|light-theme' class
		document.body.classList.remove( `liwe3-light-theme` );
		document.body.classList.remove( `liwe3-dark-theme` );

		document.body.classList.add( `liwe3-${ mode }-theme` );

		localStorage.setItem( `liwe3-theme-mode`, mode );

		storeTheme.modeSet( mode );
	}
};
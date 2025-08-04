<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { storeTheme } from '$modules/theme/store.svelte';

    import { THEME_PARTS, type  ThemeDataType, type ThemeModeType, type ThemePartsType } from '$modules/theme/store.svelte';

    type ThemeDataArg = ThemeDataType & { mode?: ThemeModeType; };

    type ThemePropsType = {
        themeData: ThemeDataArg;
    };

    const { themeData }: ThemePropsType = $props();

    let colorPicker: any = $state.raw(null);
    let themeParts: ThemePartsType[] = $state([]);

    export const themeCreateDefault = ( themeData: ThemeDataArg ): void => {
        console.log('Setting theme parts from themeData:', themeData.parts);
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

            //FIXME: parts is not customizable, probably no need to save it in localStorage
            let themeParts = localStorage.getItem( `liwe3-theme-parts` );
            if ( themeParts && themeParts.length > 0 ) {
                storeTheme.setThemeParts( JSON.parse( themeParts ) );
            } else if ( Array.isArray(themeData.parts) && themeData.parts.length > 0 ) {
                storeTheme.setThemeParts( themeData.parts );
            }
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

    onMount( () => {
        themeCreateDefault( themeData );
        themeParts = storeTheme.getThemeParts();

        colorPicker = document.querySelector( 'color-picker' );
        if( colorPicker ) {
            colorPicker.setThemeMode( themeData.mode || 'light' );
        }
    } );

</script>
<svelte:head>
    {#each THEME_PARTS as part}
        {#if themeParts.includes(part)}
            {#if part.split('-').includes('preset')}
                <link rel="stylesheet" href={`/theme/presets/liwe3-${part}.css`} />
            {:else}
                <link rel="stylesheet" href={`/theme/liwe3-${part}.css`} />
            {/if}
        {/if}
    {/each}
</svelte:head>
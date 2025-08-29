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
		type ThemeDataArg
	} from '$modules/theme/types';
	import { runeDebug } from '$liwe3/utils/runes.svelte';

	type ThemePropsType = {
		themeMode?: ThemeModeType;
		themeData?: ThemeDataType | undefined;
		onColorsChanged?: (mode: ThemeModeType, colors: ColorsType) => void;
	};

	const prefix = PUBLIC_PROJECT_KEY ? `${PUBLIC_PROJECT_KEY}-` : '';
	const lsKey = 'theme';
	const defaultThemeParts: ThemePartsType[] = THEME_PARTS;

	let { themeMode = $bindable('light'), themeData, onColorsChanged = $bindable() }: ThemePropsType = $props();
	let themeParts: ThemePartsType[] = $state(
		Array.isArray(themeData?.parts) && themeData.parts.length > 0
			? themeData.parts
			: defaultThemeParts
	);

	let currentDark: ThemeDataType['dark'] | undefined= $state(themeData?.dark );
	let currentLight: ThemeDataType['light'] | undefined = $state(themeData?.light);

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

	const _updateValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined, updateOnly: boolean = false) => {
		if (!browser || !data || !mode) return false;

		const localStorageValues = getFromLocalStorage( lsKey );
		const localStorageData: ThemeDataArg = {};

		const tmpMode = localStorageValues?.mode || null;
		themeMode = tmpMode && !updateOnly
			? (tmpMode as ThemeModeType)
			: (localStorageData['mode'] = mode || 'light') as ThemeModeType;

		const tmpParts = localStorageValues?.parts || null;
		themeParts =
			tmpParts && Array.isArray(tmpParts) && tmpParts.length > 0 && !updateOnly
				? (tmpParts as ThemePartsType[])
				: (localStorageData['parts'] = data.parts || defaultThemeParts) as ThemePartsType[];

		const tmpDark = localStorageValues?.dark || null;
		currentDark = tmpDark && !updateOnly
			? (tmpDark as ThemeDataType['dark'])
			: (localStorageData['dark'] = data.dark || {}) as ThemeDataType['dark'];

		const tmpLight = localStorageValues?.light || null;
		currentLight = tmpLight && !updateOnly
			? (tmpLight as ThemeDataType['light'])
			: (localStorageData['light'] = data.light || {}) as ThemeDataType['light'];

		toLocalStorage(localStorageData);
	};

	export const getCurrentValues = (): ThemeDataArg | undefined => {
		const localStorageValues = getFromLocalStorage( lsKey );
		return {
			mode: (localStorageValues?.mode || $state.snapshot(themeMode)) as string,
			light: (localStorageValues?.light || $state.snapshot(currentLight)) as ColorsType,
			dark: (localStorageValues?.dark || $state.snapshot(currentDark)) as ColorsType,
		};
	}

	/** Read values from localStorage and update it if key is not found
	 * @param mode ThemeModeType
	 * @param data ThemeDataType
	 */
	export const setBaseValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined) => {
		_updateValues(mode, data);
	};

	/** Write passed values to localStorage overwriting existing ones.
	 *  Use this with onColorsChanged to update the theme dynamically.
	 * @param mode ThemeModeType
	 * @param data Partial<ThemeDataType>
	 */
	export const updateBaseValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined) => {
		_updateValues(mode, data, true);
	};

	export const setTheme = (mode: ThemeModeType) => {
		if (!browser) return;

		document.documentElement.setAttribute('data-theme', mode);

		const localStorageValues = getFromLocalStorage( lsKey ) || {} as ThemeDataArg;
		localStorageValues['mode'] = mode;
		toLocalStorage(localStorageValues);
	};

	$effect(() => {
		setTheme($state.snapshot(themeMode));
	});

	onMount(() => {
		if (!browser) return;
		setBaseValues($state.snapshot(themeMode), themeData);
		setTheme($state.snapshot(themeMode));
	});
</script>

<svelte:head>
	{#each THEME_PARTS as part}
		{#if themeParts.includes(part)}
			<link rel="stylesheet" href={`/theme/${part}.css`} />
		{/if}
	{/each}
</svelte:head>
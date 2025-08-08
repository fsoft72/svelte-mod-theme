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
	const defaultThemeParts: ThemePartsType[] = [
		'fonts',
		'theme',
		'variables',
		'typography',
		'layout',
		'form'
	];

	let { themeMode = $bindable('light'), themeData, onColorsChanged = $bindable() }: ThemePropsType = $props();
	let themeParts: ThemePartsType[] = $state(
		Array.isArray(themeData?.parts) && themeData.parts.length > 0
			? themeData.parts
			: defaultThemeParts
	);

	let currentDark: ThemeDataType['dark'] | undefined= $state(themeData?.dark );
	let currentLight: ThemeDataType['light'] | undefined = $state(themeData?.light);

	const toLocalStorage = (key: string, value: Record<string, string> | string[] | string) => {
		if (!browser) return;

		if (!prefix || prefix.length === 0)
			console.warn('No prefix set for localStorage, this may cause conflicts with other projects.');

		const stringValue = JSON.stringify(value);
		localStorage.setItem(prefix + key, stringValue);
		return value;
	};

	const getFromLocalStorage = (key: string): Record<string, string> | string[] | string | null => {
		if (!browser) return null;
		const value = localStorage.getItem(prefix + key);
		if (value === null) return null;
		try {
			return JSON.parse(value) as ColorsType;
		} catch (e) {
			console.error(`Error parsing localStorage value for key "${key}":`, e);
			return null;
		}
	};

	export const getCurrentValues = (): ThemeDataArg | undefined => {
		return {
			mode: (getFromLocalStorage('mode') || $state.snapshot(themeMode)) as string,
			light: (getFromLocalStorage('light') || $state.snapshot(currentLight)) as ColorsType,
			dark: (getFromLocalStorage('dark') || $state.snapshot(currentDark)) as ColorsType,
		};
	}

	export const setBaseValues = (mode: ThemeModeType | undefined, data: ThemeDataType | undefined) => {
		if (!browser || !data || !mode) return false;

		const tmpMode = getFromLocalStorage('mode');
		themeMode = tmpMode
			? (tmpMode as ThemeModeType)
			: (toLocalStorage('mode', mode || 'light') as ThemeModeType);

		const tmpParts = getFromLocalStorage('parts');
		themeParts =
			tmpParts && Array.isArray(tmpParts) && tmpParts.length > 0
				? (tmpParts as ThemePartsType[])
				: (toLocalStorage('parts', data.parts || defaultThemeParts) as ThemePartsType[]);

		const tmpDark = getFromLocalStorage('dark');
		currentDark = tmpDark
			? (tmpDark as ThemeDataType['dark'])
			: (toLocalStorage('dark', data.dark || {}) as ThemeDataType['dark']);

		const tmpLight = getFromLocalStorage('light');
		currentLight = tmpLight
			? (tmpLight as ThemeDataType['light'])
			: (toLocalStorage('light', data.light || {}) as ThemeDataType['light']);
	};

	export const setTheme = (mode: ThemeModeType) => {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', mode);
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
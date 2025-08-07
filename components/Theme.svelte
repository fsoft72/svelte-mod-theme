<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { PUBLIC_PROJECT_KEY } from '$env/static/public';
	import {
		THEME_PARTS,
		type ThemeDataType,
		type ThemeModeType,
		type ThemePartsType
	} from '../types';

	type ThemePropsType = {
		themeData?: (ThemeDataType & { mode?: ThemeModeType }) | undefined;
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

	let { themeData }: ThemePropsType = $props();
	let themeParts: ThemePartsType[] = $state(
		Array.isArray(themeData?.parts) && themeData.parts.length > 0
			? themeData.parts
			: defaultThemeParts
	);
	let currentMode: ThemeModeType = $state(themeData?.mode || 'light');
	let currentDark: ThemeDataType['dark'] = $state(themeData?.dark || {});
	let currentLight: ThemeDataType['light'] = $state(themeData?.light || {});

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
			return JSON.parse(value);
		} catch (e) {
			console.error(`Error parsing localStorage value for key "${key}":`, e);
			return null;
		}
	};

	export const setTheme = (mode: ThemeModeType) => {
		if (!browser) return;
		document.documentElement.setAttribute('data-theme', mode);
	};

	export const setBaseValues = (data: (ThemeDataType & { mode?: ThemeModeType }) | undefined) => {
		if (!browser || !data) return false;

		const tmpMode = getFromLocalStorage('mode');
		currentMode = tmpMode
			? (tmpMode as ThemeModeType)
			: (toLocalStorage('mode', data.mode || 'light') as ThemeModeType);

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

	onMount(() => {
		if (!browser) return;
		setBaseValues(themeData);
		setTheme(currentMode);
	});
</script>

<svelte:head>
	{#each THEME_PARTS as part}
		{#if themeParts.includes(part)}
			<link rel="stylesheet" href={`/theme/${part}.css`} />
		{/if}
	{/each}
</svelte:head>

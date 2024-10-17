<script lang="ts">
	import Button from '$liwe3/components/Button.svelte';
	import Checkbox from '$liwe3/components/Checkbox.svelte';
	import { downloadFile } from '$liwe3/utils/utils';
	import { themeSetMode, exportThemeCss } from '../theme';
	import { storeTheme } from '$modules/theme/store.svelte';
	import ThemeColors from './ThemeColors.svelte';

	const store = storeTheme;
	const themeModes = storeTheme.modesAvailable();

	const setColor = (mode: string, color: string) => {
		storeTheme.setModeColor(store.mode, mode, color);
	};

	const setDarkMode = (darkMode: boolean) => {
		storeTheme.setDarkMode(darkMode);
		themeSetMode(darkMode ? 'dark' : 'light');
	};

	const exportJSON = () => {
		const data = {
			light: store.theme.light,
			dark: store.theme.dark,
			vars: store.theme.vars,
			mode: store.mode,
		};
		const json = JSON.stringify(data, null, 2);
		downloadFile(json, 'theme.json', 'application/json');
	};

	const exportCSS = () => {
		const css = exportThemeCss();
		downloadFile(css, 'theme.css', 'text/css');
	};
</script>

<div class="container">
	<div class="liwe3-row">
		<div class="liwe3-col4">
			<div class="theme-selector">
				<Button mode="info" onclick={exportJSON}>Export JSON</Button>
				<Button mode="info" onclick={exportCSS}>Export CSS</Button>
			</div>
		</div>
		<div class="liwe3-col8 tweekers">
			<div class="liwe3-row">
				<ThemeColors />
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		padding: 20px;
	}

	.theme-selector {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: flex-start;

		height: 100%;
	}
</style>

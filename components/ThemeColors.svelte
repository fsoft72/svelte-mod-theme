<script lang="ts">
	import Checkbox from '$liwe3/components/Checkbox.svelte';
	import { themeSetMode } from '../theme';
	import { storeTheme } from '$modules/theme/store.svelte';

	const themeModes = storeTheme.modesAvailable();

	const setColor = (mode: string, color: string) => {
		storeTheme.setModeColor(storeTheme.mode, mode, color);
	};

	const setDarkMode = (darkMode: boolean) => {
		storeTheme.setDarkMode(darkMode);
		themeSetMode(darkMode ? 'dark' : 'light');
	};
</script>

<div class="container">
	<div class="liwe3-row">
		<div class="theme-selector">
			<Checkbox
				checked={storeTheme.mode === 'dark'}
				onchange={(e: any) => setDarkMode(e.target?.checked)}
				label="Dark mode"
			/>
		</div>
	</div>
	<div class="liwe3-row">
		{#each themeModes as mode}
			<div class="liwe3-col2">
				<span>{mode} </span>
				<span>
					{#if storeTheme.mode === 'dark'}
						<input
							type="color"
							onchange={(e: any) => setColor(mode, e.target?.value)}
							value={storeTheme.theme.dark[mode]}
						/>
					{:else}
						<input
							type="color"
							onchange={(e: any) => setColor(mode, e.target?.value)}
							value={storeTheme.theme.light[mode]}
						/>
					{/if}
				</span>
			</div>
		{/each}
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

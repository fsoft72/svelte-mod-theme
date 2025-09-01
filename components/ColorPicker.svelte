<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { COLOR_MODES, THEME_MODES } from '$modules/theme/types';
	import type { ColorModeType, ColorsType, DefaultColorsType, ThemeDataType, ThemeModeType } from '$modules/theme/types';

	interface Props {
		themeMode?: ThemeModeType;
		darkTheme?: ColorsType | undefined;
		lightTheme?: ColorsType | undefined;
		onColorsUpdated?: (mode: ThemeModeType, colors: ColorsType) => void;
		handleColorChange?: (colorType: ColorModeType, value: string) => void;
	}

	let {
		themeMode = $bindable('light'),
		darkTheme,
		lightTheme,
		onColorsUpdated,
		handleColorChange
	}: Props = $props();

	const DEFAULT_COLORS: DefaultColorsType = {
		light: lightTheme || {
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
		dark: darkTheme || {
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
	console.log ('=== ColorPicker props:', themeMode, darkTheme, lightTheme, DEFAULT_COLORS);

	let themeColors: Record<ThemeModeType, ColorsType> = $state({
		light: { ...DEFAULT_COLORS.light },
		dark: { ...DEFAULT_COLORS.dark }
	});
	// This derived only stores the four color modes for the current theme (dark / light)
	let currentColors: ColorsType = $derived(themeColors[themeMode]);
	let isVisible: boolean = $state(false);
	let pickerButton: HTMLButtonElement | null = $state(null);
	let pickerContainer: HTMLDivElement | null = $state(null);

	/**
	 * Reset colors to default values
	 */
	const resetColors = (): void => {
		currentColors = { ...DEFAULT_COLORS[themeMode] };
		onColorsUpdated?.($state.snapshot(themeMode), $state.snapshot(DEFAULT_COLORS[themeMode]));
	};

	/**
	 * Handle color input changes
	 */
	const colorChange = (colorType: ColorModeType, value: string): void => {
		currentColors[colorType] = value;
		handleColorChange?.(colorType, value);
	};

	/**
	 * Finalize color selection and notify parent component
	 */
	const finalizeColorSelection = (colorType: ColorModeType, value: string): void => {
		currentColors[colorType] = value;
		onColorsUpdated?.($state.snapshot(themeMode), $state.snapshot(currentColors));
	};

	/**
	 * Handle click outside to close panel
	 */
	const handleClickOutside = (event: MouseEvent): void => {
		const target = event.target as HTMLElement;
		const colorPicker = document.querySelector('[data-color-picker]');

		if (colorPicker && !colorPicker.contains(target)) isVisible = false;
	};

	const showPicker = (): void => {
		isVisible = !isVisible;
	};

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
			//console.log('=== ColorPicker mounted', DEFAULT_COLORS);

			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div bind:this={pickerContainer} class="color-picker-container" data-color-picker>
	<button
		bind:this={pickerButton}
		class="toggle-panel mode2"
		title="Toggle Color Picker"
		onclick={showPicker}
	>
		{isVisible ? '✕' : '🎨'}
	</button>
	{#if isVisible}
		<div class="color-picker-panel visible form-container">
			<h3>🎨 Live Color Editor</h3>
			<button
				class="toggle-mode"
				onclick={() => (themeMode = themeMode === 'light' ? 'dark' : 'light')}
			>
				{themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
			</button>

			<div class="color-picker-groups">
				{#each Object.entries(currentColors) as [colorType, colorValue]}
					<div class="color-picker-group">
						<label class="color-picker-label" for={`color-${themeMode}-${colorType}`}>{colorType}:</label>
						<input
							id={`color-${colorType}`}
							type="color"
							class={`color-picker ${colorType}`}
							value={colorValue}
							oninput={(e) => colorChange(colorType as ColorModeType, e.currentTarget.value)}
							onchange={(e) => finalizeColorSelection(colorType as ColorModeType, e.currentTarget.value)}
						/>
						<span class="color-value-display">{colorValue}</span>
					</div>
				{/each}
			</div>

			<button class="reset-button mode1" onclick={resetColors}> Reset to Default </button>
		</div>
	{/if}
</div>

<style>
	.color-picker-container {
		position: fixed;
		z-index: 1001;
		top: 1rem;
		left: 1rem;
	}

	.toggle-panel {
		display: flex;
		align-items: center;
		justify-content: center;

		background: var(--liwe3-mode1-500, #4f46e5);
		color: white;
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		cursor: pointer;
		font-size: 1.2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;

		padding: 0 !important;
		margin: 0 !important;
	}

	.toggle-panel:hover {
		transform: scale(1.1);
		background: var(--liwe3-mode1-600, #4338ca);
	}

	.color-picker-panel {
		position: relative;

		background: var(--liwe3-surface-raised, #ffffff);
		border: 2px solid var(--liwe3-border-default, #d1d5db);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
		width: 45%;

		backdrop-filter: blur(10px);
		color: var(--liwe3-text-mode1, #111827);

		display: flex;
		flex-direction: column;
		gap: 1rem;

		margin: 0 !important;
	}

	.color-picker-panel h3 {
		margin: 0 0 1rem 0;
		color: var(--liwe3-text-mode1, #111827);
		font-size: 1.1rem;
		text-align: center;
	}

	.color-picker-groups {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-evenly;
		width:100%;
	}

	.color-picker-group {
		display: flex;
		align-items: center;
		width: 280px;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.color-picker-group:last-of-type {
		margin-bottom: 0;
	}

	.color-picker-label {
		flex: 1;
		font-weight: 600;
		color: var(--liwe3-text-mode1, #111827);
		font-size: 0.9rem;
	}

	.color-picker {
		width: 50px;
		height: 35px;
		border: 2px solid var(--liwe3-border-default, #d1d5db);
		border-radius: 6px;
		cursor: pointer;
		background: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.color-picker:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.color-picker:focus {
		outline: 2px solid var(--liwe3-mode1-500, #4f46e5);
		outline-offset: 2px;
	}

	.color-value-display {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		color: var(--liwe3-text-mode3, #6b7280);
		margin-left: 0.5rem;
		min-width: 80px;
	}

	.reset-button {
		width: 100%;
		padding: 0.5rem;
		margin-top: 1rem;
		background: var(--liwe3-gray-200, #f3f4f6);
		color: var(--liwe3-text-mode1, #111827);
		border: 1px solid var(--liwe3-border-default, #d1d5db);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.reset-button:hover {
		background: var(--liwe3-gray-300, #e5e7eb);
	}

	@media (max-width: 768px) {
		.color-picker-container {
			bottom: 20px;
			top: auto;
			right: 20px;
			left: 20px;
		}

		.color-picker-panel {
			position: fixed;
			top: auto;
			bottom: 80px;
			right: 20px;
			left: 20px;
			max-width: none;
		}

		.toggle-panel {
			position: fixed;
			bottom: 20px;
			right: 20px;
			top: auto;
		}
	}
	@media (min-width: 1920px) {
		.color-picker-panel {
			width: 720px;
		}
	}
</style>

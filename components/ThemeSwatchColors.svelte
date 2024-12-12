<script lang="ts">
	import Input from '$liwe3/components/Input.svelte';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import { themeSetMode } from '../theme';
	import { storeTheme } from '$modules/theme/store.svelte';
	import { onMount } from 'svelte';

	type AllowedUnits = 'px' | 'rem' | '%' | 'number' | 'string';

	const themeModes = storeTheme.modesAvailable();
	const theme = storeTheme.theme;
	const themeLayoutUnits = storeTheme.layoutUnits();

	let isDragging: boolean = $state(false);
	let isOpen: boolean = $state(true);

	let offset: { x: number; y: number } = { x: 0, y: 0 };
	let swatch: HTMLDivElement;

	const pageBody = document.querySelector('body');
	const lightTheme = 'liwe3-light-theme';
	const darkTheme = 'liwe3-dark-theme';
	const shownLayoutUnits = ['font-size', 'font-weight', 'border-radius', 'border-width'];

	const startDrag = (e: MouseEvent) => {
		isDragging = true;
		offset = { x: e.clientX, y: e.clientY };
	};

	const onDrag = (e: MouseEvent) => {
		if (!isDragging) return;

		if (pageBody) pageBody.style.userSelect = 'none';

		const dx = e.clientX - offset.x;
		const dy = e.clientY - offset.y;
		swatch.style.left = `${parseInt(swatch.style.left) + dx}px`;
		swatch.style.top = `${parseInt(swatch.style.top) + dy}px`;
		offset = { x: e.clientX, y: e.clientY };
	};

	const endDrag = () => {
		if (pageBody) pageBody.style.userSelect = 'auto';
		isDragging = false;
	};

	const formatValue = {
		clean: (name: string, value: string) => {
			const val = value ? value.replace(themeLayoutUnits[name], '').trim() : '';
			return val;
		},
		full: (name: string, value: string) => {
			return ['number', 'string'].includes(themeLayoutUnits[name])
				? value
				: value + themeLayoutUnits[name];
		}
	};

	const setVar = (rule: string, value: string) => {
		storeTheme.setLayoutVar(rule, value);
	};

	const onVarChange = (e: Event, rule: AllowedUnits) => {
		const target = e.target as HTMLInputElement;
		const value = formatValue.full(rule, target.value) || '';
		setVar(rule, value);
	};
	const setColor = (mode: string, color: string) => {
		storeTheme.setModeColor(storeTheme.mode, mode, color);
	};

	const calcSwatchPosition = (idx: number, mode: string): string => {
		const angle = (idx / themeModes.length) * 360 * (Math.PI / 180);
		const radius = 140;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		const bgColor =
			storeTheme.mode === 'dark' ? storeTheme.theme.dark[mode] : storeTheme.theme.light[mode];
		return `top: calc(42% + ${y}px); left: calc(42% + ${x}px); background-color: ${bgColor}`;
	};

	const calcValuesPosition = (idx: number): string => {
		const angle = (idx / shownLayoutUnits.length) * 360 * (Math.PI / 180);
		const radius = 75;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		return `top: calc(42% + ${y}px); left: calc(30% + ${x}px);`;
	};

	const closeSwatch = () => {
		const closeStyle = {
			width: '80px',
			height: '80px',
			rotate: '270deg',
			boxShadow: '-3px 8px 12px 2px rgba(0, 0, 0, 0.5)'
		};

		swatch.style.rotate = closeStyle.rotate;
		swatch.style.width = closeStyle.width;
		swatch.style.height = closeStyle.height;
		swatch.style.boxShadow = closeStyle.boxShadow;
		isOpen = false;
	};

	const openSwatch = (init?: boolean) => {
		if (isDragging) return;

		const startStyle = {
			left: '400px',
			top: '400px',
			width: '340px',
			height: '340px',
			rotate: '0deg',
			boxShadow: '3px 8px 12px 2px rgba(0, 0, 0, 0.5)'
		};
		if (init) {
			swatch.style.left = startStyle.left;
			swatch.style.top = startStyle.top;
		}
		swatch.style.width = startStyle.width;
		swatch.style.height = startStyle.height;
		swatch.style.rotate = startStyle.rotate;
		swatch.style.boxShadow = startStyle.boxShadow;
		isOpen = true;
	};

	onMount(() => {
		openSwatch(true);
	});
</script>

<svelte:window onmousemove={onDrag} onmouseup={endDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="themeswatch" bind:this={swatch} onmousedown={startDrag}>
	<div class="themeswatch-switcher" class:closed={!isOpen}>
		<ThemeSwitcher onclick={(theme, e) => themeSetMode(theme === darkTheme ? 'dark' : 'light')} />
	</div>
	<div class="themeswatch-close-bg" class:closed={!isOpen}></div>
	<div class="themeswatch-close" class:closed={!isOpen}>
		{#if isOpen}
			<button class="btn-close" onclick={closeSwatch} aria-label="Close theme swatch">
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
					><path
						d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
					/></svg
				>
			</button>
		{:else}
			<button class="btn-open" onclick={() => openSwatch()} aria-label="Open theme swatch">
				<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"
					><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z" /></svg
				>
			</button>
		{/if}
	</div>
	<div class="control">
		{#if isOpen}
			<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px"
				><path
					d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z"
				/></svg
			>
		{:else}
			''
		{/if}
	</div>
	<div class="swatch-container">
		{#each themeModes as mode, idx}
			{#if storeTheme.mode === 'dark'}
				<div class="swatch" style={`${calcSwatchPosition(idx, mode)}`}>
					<input
						type="color"
						onchange={(e: any) => setColor(mode, e.target?.value)}
						value={storeTheme.theme.dark[mode]}
						title={mode}
					/>
				</div>
			{:else}
				<div class="swatch" style={`${calcSwatchPosition(idx, mode)}`}>
					<input
						type="color"
						onchange={(e: any) => setColor(mode, e.target?.value)}
						value={storeTheme.theme.light[mode]}
						title={mode}
					/>
				</div>
			{/if}
		{/each}
	</div>
	<div class="values-container">
		{#each shownLayoutUnits as rule, idx}
			<div class="values" style={`${calcValuesPosition(idx)}`}>
				{#if ['rem', 'number'].includes(themeLayoutUnits[rule])}
					<Input
						type="number"
						step=".05"
						min="0"
						size="sm"
						onchange={(e) => onVarChange(e, rule as AllowedUnits)}
						value={formatValue.clean(rule, theme.vars[rule])}
						label={`${rule} (${themeLayoutUnits[rule]})`}
					/>
				{:else if themeLayoutUnits[rule] == 'px'}
					<Input
						type="number"
						step="1"
						min="0"
						size="sm"
						onchange={(e) => onVarChange(e, rule as AllowedUnits)}
						value={formatValue.clean(rule, theme.vars[rule])}
						label={`${rule} (${themeLayoutUnits[rule]})`}
					/>
				{:else if themeLayoutUnits[rule] == 'string'}
					<Input
						type="text"
						size="sm"
						onchange={(e) => onVarChange(e, rule as AllowedUnits)}
						value={formatValue.clean(rule, theme.vars[rule])}
						label={`${rule} (${themeLayoutUnits[rule]})`}
					/>
				{:else if themeLayoutUnits[rule] == '%'}
					<label for={rule}>{rule} ({themeLayoutUnits[rule]})</label>
					<input
						type="range"
						min="0"
						max="100"
						class="slider"
						onchange={(e) => onVarChange(e, rule as AllowedUnits)}
						value={formatValue.clean(rule, theme.vars[rule])}
					/>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.themeswatch {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		border: 10px solid var(--liwe3-darker-paper);
		background-color: var(--liwe3-paper);
		overflow: hidden;
		box-shadow: 3px 8px 12px 2px rgba(0, 0, 0, 0.5);
		z-index: 9998;
		transition:
			width 0.3s ease-in-out,
			height 0.3s ease-in-out,
			transform 0.3s ease-in-out,
			rotate 0.3s ease-in-out,
			box-shadow 0.3s ease-in-out;

		.themeswatch-switcher {
			display: block;
			position: absolute;
			top: 56%;
			left: 30%;
			padding: 5px 8px;
			background-color: var(--liwe3-darker-paper);
			border-radius: 15px;
			z-index: 9999;
		}

		.themeswatch-switcher.closed {
			display: none;
		}

		.themeswatch-close-bg {
			position: absolute;
			top: 31%;
			left: 51%;
			width: 45px;
			height: 45px;
			background-color: var(--liwe3-darker-paper);
			border-radius: 50%;
		}
		.themeswatch-close {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 33%;
			left: 53%;
			width: 33px;
			height: 33px;
			cursor: pointer;
			background-color: var(--liwe3-accent-color);
			border-radius: 50%;
			fill: var(--liwe3-paper);
			z-index: 9999;

			.btn-close {
				display: flex;
				justify-content: center;
				align-items: center;
				cursor: pointer;
				background-color: transparent;
				border: none;
				fill: var(--liwe3-paper);
			}

			.btn-open {
				display: flex;
				justify-content: center;
				align-items: center;
				cursor: pointer;
				width: 80px;
				height: 80px;
				background-color: var(--liwe3-accent-color);
				border: none;
				fill: var(--liwe3-paper);
			}
		}

		.themeswatch-close-bg.closed,
		.themeswatch-close.closed {
			top: 13px;
			left: 13px;
		}

		.control {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 50%;
			left: 50%;
			width: 80px;
			height: 80px;
			transform: translate(-50%, -50%);
			cursor: pointer;
			background-color: var(--liwe3-accent-color);
			border: 10px solid var(--liwe3-darker-paper);
			border-radius: 50%;
			fill: var(--liwe3-paper);
			cursor: crosshair;
		}

		.swatch-container {
			position: absolute;
			width: 300px;
			height: 300px;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.swatch {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			width: 50px;
			height: 50px;
			border: 5px solid var(--liwe3-darker-paper);
			border-radius: 50%;
			overflow: hidden;

			input {
				height: 100%;
				width: 100%;
				background-color: transparent !important;
				border: 0px !important;
				cursor: pointer;
			}
		}

		.values-container {
			position: absolute;
			width: 200px;
			height: 200px;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.values {
			display: flex;
			justify-content: center;
			align-items: center;
			position: absolute;
			width: 80px;
			height: 15px;
		}
	}
</style>

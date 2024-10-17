<script lang="ts">
	import { onMount } from 'svelte';

	interface ThemeSwitcherProps {
		lightTheme?: string;
		darkTheme?: string;
	}

	let { lightTheme = 'liwe3-light-theme', darkTheme = 'liwe3-dark-theme' }: ThemeSwitcherProps =
		$props();

	let is_dark = $state(false);

	const toggleTheme = (e: any) => {
		const body = document.querySelector('body');

		const classes: string[] = body?.getAttribute('class')?.split(' ') ?? [];
		let fromClass = lightTheme,
			toClass = darkTheme;

		is_dark = e.target.checked;

		// replace or append the light/dark theme to classes of body
		if (!is_dark) {
			fromClass = darkTheme;
			toClass = lightTheme;
		}

		// remove the from theme
		classes.splice(classes.indexOf(fromClass), 1);
		// add the new theme
		classes.push(toClass);

		body?.setAttribute('class', classes.join(' '));
	};

	onMount(() => {
		// check if dark theme is already applied
		const body = document.querySelector('body');
		const classes = body?.getAttribute('class') ?? '';

		if (classes.indexOf(darkTheme) > -1) is_dark = true;
	});
</script>

<label class="liwe3-themeswitch">
	<input type="checkbox" onchange={toggleTheme} checked={is_dark} />
	<span class="liwe3-themeswitch-slider"></span>
</label>

<style>
	/* The switch - the box around the slider */
	.liwe3-themeswitch {
		--width-of-switch: 1.5em;
		--height-of-switch: 1em;
		/* size of sliding icon -- sun and moon */
		--size-of-icon: 1em;
		/* it is like a inline-padding of switch */
		--slider-offset: 0.3em;
		display: inline-block;
		position: relative;
		width: var(--width-of-switch);
		height: var(--height-of-switch);
	}

	/* Hide default HTML checkbox */
	.liwe3-themeswitch input {
		opacity: 0;
		/* width: 0; */
		height: 0;
	}

	/* The slider */
	.liwe3-themeswitch-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--liwe3-main-bg-color);
		transition: 0.4s;
		border-radius: 20px;

		border: 1px solid var(--liwe3-color);
		width: var(--width-of-switch);
		height: var(--height-of-switch);
	}

	.liwe3-themeswitch-slider:before {
		position: absolute;
		content: '';
		height: var(--size-of-icon, 1.4em);
		width: var(--size-of-icon, 1.4em);
		border-radius: 20px;
		left: var(--slider-offset, 0.3em);
		top: 50%;
		transform: translateY(-50%);
		background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
		transition: 0.4s;
	}

	input:checked + .liwe3-themeswitch-slider {
		background-color: var(--liwe3-main-bg-color);
	}

	input:checked + .liwe3-themeswitch-slider:before {
		left: calc(100% - (var(--size-of-icon, 1.4em) + var(--slider-offset, 0.3em)));
		background: #303136;
		/* change the value of second inset in box-shadow to change the angle and direction of the moon  */
		box-shadow:
			inset -3px -2px 5px -2px #8983f7,
			inset -10px -4px 0 0 #a3dafb;
	}
</style>

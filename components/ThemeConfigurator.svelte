<script lang="ts">
	import Select from 'svelte-select';

	import Button from '$liwe3/components/Button.svelte';
	import Input from '$liwe3/components/Input.svelte';
	import Tabs from '$liwe3/components/Tabs.svelte';
	import Tab from '$liwe3/components/sub/Tab.svelte';
	import DataGrid, {
		type DataGridAction,
		type DataGridRow,
		type DataGridField
	} from '$liwe3/components/DataGrid.svelte';
	import type { Color } from '$liwe3/types/types';
	import AutoComplete from '$liwe3/components/AutoComplete.svelte';
	import MarkdownInput from '$liwe3/components/MarkdownInput.svelte';
	import Modal from '$liwe3/components/Modal.svelte';
	import ProgressBar from '$liwe3/components/ProgressBar.svelte';
	import DraggableTree from '$liwe3/components/DraggableTree.svelte';
	import ElementList from '$liwe3/components/ElementList.svelte';
	import TagInput from '$liwe3/components/TagInput.svelte';
	import { theme, themeModes } from '../theme_store';
	import ThemeColorSelector from './ThemeColorSelector.svelte';
	import ThemeVarsSelector from './ThemeVarsSelector.svelte';
	import Checkbox from '$liwe3/components/Checkbox.svelte';

	const ranges = [900, 800, 700, 600, 500, 400, 300, 200, 100, 50];
	const fields: DataGridField[] = [
		{
			name: 'id',
			type: 'string',
			label: 'ID',
			hidden: true
		},
		{
			name: 'email',
			type: 'string',
			label: 'Email',
			sortable: true,
			filterable: true,
			editable: true
		},
		{
			name: 'first_name',
			type: 'string',
			label: 'First Name',
			sortable: true,
			filterable: true,
			editable: true
		},
		{
			name: 'last_name',
			type: 'string',
			label: 'Last Name',
			sortable: true,
			filterable: true,
			editable: true
		}
	];

	const data: DataGridRow[] = [
		{
			id: '1',
			first_name: 'John',
			last_name: 'Doe',
			email: 'jdoe@example.com'
		},
		{
			id: '2',
			first_name: 'Jane',
			last_name: 'Doe',
			email: 'jane@example.com'
		},
		{
			id: '3',
			first_name: 'John',
			last_name: 'Smith',
			email: 'jj@example.com'
		},
		{
			id: '4',
			first_name: 'Jane',
			last_name: 'Smith',
			email: 'smith@ssss.com'
		}
	];

	const actions: DataGridAction[] = [
		{
			id: 'a1',
			label: 'Edit',
			onclick: (row: DataGridRow) => {
				console.log('=== EDIT: ', row);
			}
		},
		{
			id: 'a2',
			label: 'Delete',
			onclick: (row: DataGridRow) => {
				console.log('=== DELETE: ', row);
			},
			mode: 'error'
		}
	];

	let mode: Color = $state('mode1');

	let testMode: Color = $state('mode1');
	let showModal = $state(false);
</script>

<div class={`container liwe3-${$theme.theme}-theme`}>
	<div class="liwe3-row">
		<div class="liwe3-col">
			<h1>Theme Configurator {$theme.theme}</h1>
		</div>
	</div>
	<ThemeColorSelector />
	<ThemeVarsSelector />
	<div class="liwe3-row">
		{#if showModal}
			<Modal
				title="Theme modal test"
				size="md"
				mode={testMode}
				oncancel={() => {
					showModal = false;
				}}
				onclose={() => {
					showModal = false;
				}}
			>
				<h1>Modal test</h1>
				<p>Modal test</p>
			</Modal>
		{/if}
		<Tabs {mode}>
			<Tab id="colors" title="Colors">
				{#each themeModes as name}
					<div class="liwe3-row color">
						<div class="liwe3-col12"><b>{name}</b></div>
						{#each ranges as val}
							<div
								class={val === 500 ? 'liwe3-col3' : 'liwe3-col1'}
								style={`background-color: var(--liwe3-${
									$theme.theme ? $theme.theme : 'dark'
								}-${name}-${val});`}
							>
								<div class="color-text"><p>{val}</p></div>
							</div>
						{/each}
					</div>
				{/each}
			</Tab>
			<Tab id="buttons" title="Buttons">
				<div class="liwe3-row color">
					{#each themeModes.slice(0, 9) as mode}
						<div class="liwe3-col12"><b>{mode}</b></div>
						<div class="liwe3-col3">
							<Button {mode} variant="solid">{mode} - solid - Click me</Button>
						</div>
						<div class="liwe3-col3">
							<Button {mode} variant="outline">{mode} - outline - Click me</Button>
						</div>
						<div class="liwe3-col3">
							<Button {mode} variant="link">{mode} - link - Click me</Button>
						</div>
						<div class="liwe3-col3">
							<Button {mode} disabled>{mode} - disabled</Button>
						</div>
					{/each}
				</div>
			</Tab>
			<Tab id="inputs" title="Inputs">
				{#each themeModes as mode}
					<div class="liwe3-row">
						{#each ['text', 'number', 'password', 'email', 'url', 'tel'] as type}
							<Input
								{mode}
								divClass="liwe3-col2"
								class=""
								label="Input"
								placeholder={mode}
								{type}
							/>
						{/each}
					</div>
					<div class="liwe3-row">
						{#each ['search', 'checkbox'] as type}
							<Input
								{mode}
								divClass="liwe3-col2"
								class=""
								label="Input"
								placeholder={mode}
								{type}
							/>
						{/each}
						<div class="liwe3-col2 p5">
							<div class={`${mode} liwe3-form-switch liwe3-form-custom-switch`}>
								<Checkbox id={`switch-${mode}`} />
								<label for={`switch-${mode}`}>{mode}</label>
							</div>
						</div>
						<div class="liwe3-col2 p5">
							<div class={`${mode} radio-group liwe3-form-radio-group`}>
								<input type="radio" id={`${mode}-option-one3`} name="selector3" checked />
								<label for={`${mode}-option-one3`}>Html</label>
								<input type="radio" id={`${mode}-option-two3`} name="selector3" />
								<label for={`${mode}-option-two3`}>Css</label>
								<input type="radio" id={`${mode}-option-three3`} name="selector3" />
								<label for={`${mode}-option-three3`}>Javascript</label>
							</div>
						</div>
						<div class="liwe3-col2 m5">
							<fieldset class={`liwe3-form ${mode} liwe3-form-custom-input`}>
								<legend>Textarea</legend>
								<textarea
									class={`liwe3-form ${mode} custom-input-liwe3-form`}
									rows="4"
									placeholder={mode}
								></textarea>
							</fieldset>
						</div>
					</div>
				{/each}
			</Tab>
			<Tab id="selects" title="Selects">
				<div class="row form">
					{#each ['mode1', 'mode2', 'mode3', 'mode4'] as mode}
						<Select class={mode} items={['mode1', 'mode2', 'mode3', 'mode4']} />
					{/each}
				</div>
			</Tab>
			<Tab id="form" title="Form">
				<div class="liwe3-container liwe3-paper spacer">
					<div class="liwe3-row">
						<div class="liwe3-col12">
							<p class="liwe3-lead">Example Form</p>
						</div>
						<div class="liwe3-col8">
							<div class="liwe3-row">
								<div class="liwe3-col6">
									<Input label="First Name" placeholder="First Name" />
								</div>
								<div class="liwe3-col6">
									<Input label="Last Name" placeholder="Last Name" />
								</div>
								<div class="liwe3-col6 liwe3-offset-6">
									<div class="mode3 radio-group liwe3-form-radio-group">
										<input type="radio" id="mode3-option-one3" name="selector3" checked />
										<label for="mode3-option-one3">Male</label>
										<input type="radio" id="mode3-option-two3" name="selector3" />
										<label for="mode3-option-two3">Female</label>
									</div>
								</div>
								<div class="liwe3-col6">
									<Select class="mode3" items={['mode1', 'mode2', 'mode3', 'mode4']} />
								</div>
								<div class="liwe3-col6">
									<Input
										mode="mode3"
										class=""
										label="Subscribe to newsletter"
										placeholder={mode}
										type="checkbox"
									/>
									<Input
										mode="mode3"
										class=""
										label="I accept the terms and conditions"
										placeholder={mode}
										type="checkbox"
									/>
									<Input
										mode="mode3"
										class=""
										label="This is a checkbox"
										placeholder={mode}
										type="checkbox"
									/>
								</div>
								<div class="liwe3-col6 input-container">
									<label class="label" for="textarea1">Textarea</label>
									<textarea
										id="textarea1"
										class={`liwe3-form mode3 custom-input-liwe3-form`}
										rows="5"
										placeholder="Your text here"
									></textarea>
								</div>
							</div>
						</div>
						<div class="liwe3-col4">
							<div class="liwe3-row" style="align-items:flex-end">
								<div class="liwe3-col-offset2 liwe3-col8">
									<Button mode="mode4" variant="solid">Submit</Button>
								</div>
								<div class="liwe3-col-offset2 liwe3-col8">
									<Button mode="warning" variant="solid">reset</Button>
								</div>
							</div>
						</div>
					</div>
				</div></Tab
			>
			<Tab id="grids" title="DataGrids">
				<div class="col">
					<DataGrid mode="mode1" {fields} {data} {actions} />
					<DataGrid mode="mode2" {fields} {data} {actions} />
					<DataGrid mode="mode3" {fields} {data} {actions} />
					<DataGrid mode="mode4" {fields} {data} {actions} />
				</div>
			</Tab>
			<Tab id="dragtree" title="Draggable Tree">
				<div class="row">
					<DraggableTree mode="mode1" tree={{ children: [] }} />
					<DraggableTree mode="mode2" tree={{ children: [] }} />
					<DraggableTree mode="mode3" tree={{ children: [] }} />
					<DraggableTree mode="mode4" tree={{ children: [] }} />
				</div>
			</Tab>
			<Tab id="elements" title="Elements List">
				<div class="row">
					<ElementList mode="mode1" />
					<ElementList mode="mode2" />
					<ElementList mode="mode3" />
					<ElementList mode="mode4" />
				</div>
			</Tab>
			<Tab id="controls" title="Controls">
				<div class="col form">
					Autocomplete
					<div class="row">
						<AutoComplete mode="mode1" items={['mode1', 'mode2', 'mode3', 'mode4']} />
						<AutoComplete mode="mode2" items={['mode1', 'mode2', 'mode3', 'mode4']} />
						<AutoComplete mode="mode3" items={['mode1', 'mode2', 'mode3', 'mode4']} />
						<AutoComplete mode="mode4" items={['mode1', 'mode2', 'mode3', 'mode4']} />
					</div>
					Markdown
					<div class="col">
						<MarkdownInput rows={2} mode="mode1" />
						<MarkdownInput rows={2} mode="mode2" />
						<MarkdownInput rows={2} mode="mode3" />
						<MarkdownInput rows={2} mode="mode4" />
					</div>
					Modals
					<div class="row">
						<Button
							mode="mode1"
							onclick={() => {
								testMode = 'mode1';
								showModal = true;
							}}>Open Modal</Button
						>
						<Button
							mode="mode2"
							onclick={() => {
								testMode = 'mode2';
								showModal = true;
							}}>Open Modal</Button
						>
						<Button
							mode="mode3"
							onclick={() => {
								testMode = 'mode3';
								showModal = true;
							}}>Open Modal</Button
						>
						<Button
							mode="mode4"
							onclick={() => {
								testMode = 'mode4';
								showModal = true;
							}}>Open Modal</Button
						>
					</div>
					Progress Bar
					<div class="row">
						<ProgressBar mode="mode1" percentage={50} />
						<ProgressBar mode="mode2" percentage={50} />
						<ProgressBar mode="mode3" percentage={50} />
						<ProgressBar mode="mode4" percentage={50} />
					</div>
					Tag Input
					<div class="row">
						<TagInput mode="mode1" allowNewTags={true} />
						<TagInput mode="mode2" allowNewTags={true} />
						<TagInput mode="mode3" allowNewTags={true} />
						<TagInput mode="mode4" allowNewTags={true} />
					</div>
				</div>
			</Tab>
		</Tabs>
	</div>
</div>

<style>
	.color div {
		padding: 0.5rem 0;
	}

	.color-text {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.color-text > p {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.5rem 0;
		text-overflow: clip;
		overflow-wrap: break-word;
	}

	.colors {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.col {
		display: flex;
		flex-direction: column;

		gap: 1rem;
	}

	.spacer [class^='liwe3-col'] {
		padding: var(--liwe3-space-2) 0;
	}

	.row {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;

		margin-bottom: 0.5rem;
	}

	.m5 {
		margin: 5px;
	}

	.tweekers {
		margin-bottom: 1rem;
	}
	.theme-selector {
		flex: 0.5;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 0.5rem;
	}
</style>

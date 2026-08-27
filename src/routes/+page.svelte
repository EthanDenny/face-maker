<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Face from '$lib/components/Face.svelte';
	import {
		exportFormatCookieName,
		exportFormatStorageKey,
		eyeOptions,
		faceCookieName,
		faceStorageKey,
		getPalette,
		initialFaceConfig,
		initialLockedTraits,
		moodOptions,
		mouthOptions,
		paletteOptions,
		parseExportFormat,
		parseFaceConfig,
		randomizeFace,
		shapeOptions,
		serializeFaceCookie
	} from '$lib/face-config';
	import type { ExportFormat, FaceConfig, LockedTraits, TraitKey } from '$lib/face-config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let config = $state<FaceConfig>({ ...untrack(() => data.config) });
	let lockedTraits = $state<LockedTraits>({ ...initialLockedTraits });
	let storageReady = $state(false);
	let faceFrame = $state<HTMLDivElement>();
	let isExporting = $state(false);
	let exportFormat = $state<ExportFormat>(untrack(() => data.exportFormat));
	const activePalette = $derived(getPalette(config.palette));

	function readStoredConfig() {
		try {
			const rawConfig = localStorage.getItem(faceStorageKey);
			return rawConfig ? parseFaceConfig(JSON.parse(rawConfig)) : null;
		} catch {
			return null;
		}
	}

	function readStoredExportFormat() {
		try {
			return parseExportFormat(localStorage.getItem(exportFormatStorageKey));
		} catch {
			return null;
		}
	}

	onMount(() => {
		config = readStoredConfig() ?? config;
		exportFormat = readStoredExportFormat() ?? exportFormat;
		storageReady = true;
	});

	$effect(() => {
		if (!storageReady) return;
		try {
			localStorage.setItem(faceStorageKey, JSON.stringify(config));
			localStorage.setItem(exportFormatStorageKey, exportFormat);
		} catch {
			// Keep the face maker usable when browser storage is unavailable.
		}
		document.cookie = `${faceCookieName}=${serializeFaceCookie(config)}; Path=/; Max-Age=31536000; SameSite=Lax`;
		document.cookie = `${exportFormatCookieName}=${exportFormat}; Path=/; Max-Age=31536000; SameSite=Lax`;
	});

	function choose<K extends keyof FaceConfig>(key: K, value: FaceConfig[K]) {
		config[key] = value;
	}

	function toggleLock(trait: TraitKey) {
		lockedTraits[trait] = !lockedTraits[trait];
	}

	function randomize() {
		config = randomizeFace(config, lockedTraits);
	}

	function reset() {
		config = { ...initialFaceConfig };
		lockedTraits = { ...initialLockedTraits };
	}

	async function exportFace(format: ExportFormat) {
		if (!faceFrame || isExporting) return;

		isExporting = true;
		try {
			const { toPng, toSvg } = await import('html-to-image');
			const exportOptions = {
				backgroundColor: activePalette.background,
				cacheBust: true
			};
			const dataUrl = format === 'png'
				? await toPng(faceFrame, { ...exportOptions, pixelRatio: 2 })
				: await toSvg(faceFrame, exportOptions);
			const link = document.createElement('a');
			link.download = `${config.shape}-${config.mood}-${config.palette}-${config.eyes}-${config.mouth}.${format}`;
			link.href = dataUrl;
			document.body.append(link);
			link.click();
			link.remove();
		} catch (error) {
			console.error('Could not export face', error);
		} finally {
			isExporting = false;
		}
	}
</script>

<svelte:head>
	<title>Face Maker — Tiny faces, big personality</title>
	<meta name="description" content="A playful little studio for making bold, geometric faces." />
</svelte:head>

<div class="site-shell">
	<main>
		<div class="tools-column">
			<section class="intro" aria-label="Face actions">
				<button class="circle-action randomize-action" type="button" onclick={randomize} aria-label="Randomize face" title="Randomize">
					<img src="/randomize.png" alt="" aria-hidden="true" />
				</button>
				<button class="circle-action reset-action" type="button" onclick={reset} aria-label="Reset face" title="Reset">
					<span aria-hidden="true">↺</span>
				</button>
				<button class="circle-action export-action" type="button" onclick={() => exportFace(exportFormat)} disabled={isExporting} aria-label={`Export face as ${exportFormat.toUpperCase()}`} title={`Export as ${exportFormat.toUpperCase()}`}>
					<span aria-hidden="true">↓</span>
				</button>
			</section>

			<aside class="controls" aria-label="Face controls">
			<div class="control-row">
				<label for="shape-select">Shape</label>
				<div class="select-wrap">
					<select id="shape-select" bind:value={config.shape}>
						{#each shapeOptions as option}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
				<button class="lock-toggle" class:active={lockedTraits.shape} type="button" onclick={() => toggleLock('shape')} aria-label={`${lockedTraits.shape ? 'Unlock' : 'Lock'} shape`} aria-pressed={lockedTraits.shape} title={`${lockedTraits.shape ? 'Unlock' : 'Lock'} shape`}></button>
			</div>
			<div class="control-row">
				<label for="eyes-select">Eyes</label>
				<div class="select-wrap">
					<select id="eyes-select" bind:value={config.eyes}>
						{#each eyeOptions as option}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
				<button class="lock-toggle" class:active={lockedTraits.eyes} type="button" onclick={() => toggleLock('eyes')} aria-label={`${lockedTraits.eyes ? 'Unlock' : 'Lock'} eyes`} aria-pressed={lockedTraits.eyes} title={`${lockedTraits.eyes ? 'Unlock' : 'Lock'} eyes`}></button>
			</div>
			<div class="control-row">
				<label for="mood-select">Mood</label>
				<div class="select-wrap">
					<select id="mood-select" bind:value={config.mood}>
						{#each moodOptions as option}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
				<button class="lock-toggle" class:active={lockedTraits.mood} type="button" onclick={() => toggleLock('mood')} aria-label={`${lockedTraits.mood ? 'Unlock' : 'Lock'} mood`} aria-pressed={lockedTraits.mood} title={`${lockedTraits.mood ? 'Unlock' : 'Lock'} mood`}></button>
			</div>
			<div class="control-row">
				<label for="mouth-select">Mouth</label>
				<div class="select-wrap">
					<select id="mouth-select" bind:value={config.mouth}>
						{#each mouthOptions as option}
							<option value={option.id}>{option.label}</option>
						{/each}
					</select>
				</div>
				<button class="lock-toggle" class:active={lockedTraits.mouth} type="button" onclick={() => toggleLock('mouth')} aria-label={`${lockedTraits.mouth ? 'Unlock' : 'Lock'} mouth`} aria-pressed={lockedTraits.mouth} title={`${lockedTraits.mouth ? 'Unlock' : 'Lock'} mouth`}></button>
			</div>
			<div class="control-row palette-control">
				<span class="control-label">Palette</span>
				<div class="palette-options">
					{#each paletteOptions as palette}
						<button type="button" class:active={config.palette === palette.id} style={`--swatch-bg: ${palette.background}; --swatch-ink: ${palette.ink};`} onclick={() => choose('palette', palette.id)} aria-label={palette.label} aria-pressed={config.palette === palette.id}></button>
					{/each}
				</div>
				<button class="lock-toggle" class:active={lockedTraits.palette} type="button" onclick={() => toggleLock('palette')} aria-label={`${lockedTraits.palette ? 'Unlock' : 'Lock'} palette`} aria-pressed={lockedTraits.palette} title={`${lockedTraits.palette ? 'Unlock' : 'Lock'} palette`}></button>
			</div>
			<div class="control-row export-format-control">
				<label for="export-format-select">Export As</label>
				<div class="select-wrap">
					<select id="export-format-select" bind:value={exportFormat}>
						<option value="png">PNG</option>
						<option value="svg">SVG</option>
					</select>
				</div>
			</div>
			</aside>
		</div>

		<section class="preview-card" aria-label="Your face preview">
			<div class="face-frame" bind:this={faceFrame}>
				<Face shape={config.shape} eyes={config.eyes} mood={config.mood} mouth={config.mouth} palette={activePalette} />
			</div>
		</section>
	</main>
</div>

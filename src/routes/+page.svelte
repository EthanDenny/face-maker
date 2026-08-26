<script lang="ts">
	import { toPng, toSvg } from 'html-to-image';
	import { onMount, untrack } from 'svelte';
	import Face from '$lib/components/Face.svelte';
	import { exportFormatCookieName, exportFormatStorageKey, faceCookieName, faceStorageKey, initialFaceConfig, parseExportFormat, parseFaceConfig, serializeFaceCookie } from '$lib/face-config';
	import type { ExportFormat, EyeStyle, FaceConfig, FaceShape, Mood, MouthStyle } from '$lib/face-config';
	import type { PageData } from './$types';

	type TraitKey = keyof FaceConfig;
	type LockedTraits = Record<TraitKey, boolean>;
	type Palette = { id: string; name: string; background: string; skin: string; ink: string };
	let { data }: { data: PageData } = $props();

	const shapes = [
		{ id: 'soft', label: 'Soft' }, { id: 'round', label: 'Round' },
		{ id: 'tall', label: 'Tall' }, { id: 'square', label: 'Square' },
		{ id: 'wide', label: 'Wide' }, { id: 'oval', label: 'Oval' },
		{ id: 'arch', label: 'Arch' }, { id: 'bean', label: 'Bean' }
	] as const;
	const eyeStyles = [
		{ id: 'pebble', label: 'Pebble' }, { id: 'dot', label: 'Dot' },
		{ id: 'sleepy', label: 'Slant' }, { id: 'block', label: 'Block' },
		{ id: 'pill', label: 'Pill' }, { id: 'diamond', label: 'Diamond' },
		{ id: 'dash', label: 'Dash' }, { id: 'drop', label: 'Drop' },
		{ id: 'alien', label: 'Alien' }, { id: 'gem', label: 'Gem' },
		{ id: 'star', label: 'Star' },
		{ id: 'x', label: 'Crossed' }
	] as const;
	const moods = [
		{ id: 'happy', label: 'Happy' }, { id: 'curious', label: 'Curious' },
		{ id: 'calm', label: 'Calm' }, { id: 'mischief', label: 'Mischief' },
		{ id: 'surprised', label: 'Surprised' }, { id: 'stern', label: 'Stern' },
		{ id: 'worried', label: 'Worried' }, { id: 'dreamy', label: 'Dreamy' }
	] as const;
	const mouths = [
		{ id: 'none', label: 'None' }, { id: 'smile', label: 'Smile' },
		{ id: 'grin', label: 'Grin' }, { id: 'open', label: 'Open' },
		{ id: 'flat', label: 'Flat' }, { id: 'pout', label: 'Pout' },
		{ id: 'ooh', label: 'Ooh' },
		{ id: 'smirk', label: 'Smirk' }
	] as const;
	const palettes: Palette[] = [
		{ id: 'grape', name: 'Grape soda', background: '#d9c5ff', skin: '#f5efff', ink: '#4b238f' },
		{ id: 'tomato', name: 'Tomato cream', background: '#f8cfbb', skin: '#fff1e9', ink: '#70331f' },
		{ id: 'mint', name: 'Mint chip', background: '#bfe8d4', skin: '#eefbf5', ink: '#1b4d42' },
		{ id: 'lemon', name: 'Lemon ink', background: '#f8df72', skin: '#fff9db', ink: '#5b4a00' },
		{ id: 'sky', name: 'Blue hour', background: '#b9ddff', skin: '#eef7ff', ink: '#2251a3' },
		{ id: 'bubblegum', name: 'Bubblegum', background: '#f7c2e1', skin: '#fff0f8', ink: '#7f2358' },
		{ id: 'tangerine', name: 'Tangerine', background: '#ffc18f', skin: '#fff0e4', ink: '#713014' },
		{ id: 'lagoon', name: 'Lagoon', background: '#9fe4df', skin: '#e9fbfa', ink: '#0d5957' },
		{ id: 'pistachio', name: 'Pistachio', background: '#d5e99d', skin: '#f5f9e8', ink: '#3f5118' },
		{ id: 'midnight', name: 'Periwinkle', background: '#cbd3f2', skin: '#f1f3fb', ink: '#29345c' },
		{ id: 'cocoa', name: 'Cocoa cream', background: '#d8b79a', skin: '#f7eee6', ink: '#603f32' },
		{ id: 'mono', name: 'Black & white', background: '#ffffff', skin: '#ffffff', ink: '#111111' }
	];
	const shapeIds = shapes.map(({ id }) => id);
	const eyeIds = eyeStyles.map(({ id }) => id);
	const moodIds = moods.map(({ id }) => id);
	const mouthIds = mouths.map(({ id }) => id);
	const paletteIds = palettes.filter(({ id }) => id !== 'mono').map(({ id }) => id);
	const traitKeys: readonly TraitKey[] = ['shape', 'eyes', 'mood', 'mouth', 'palette'];
	const initialLocks: LockedTraits = { shape: false, eyes: false, mood: false, mouth: false, palette: false };

	let config = $state<FaceConfig>({ ...untrack(() => data.config) });
	let lockedTraits = $state<LockedTraits>({ ...initialLocks });
	let storageReady = $state(false);
	let faceFrame = $state<HTMLDivElement>();
	let isExporting = $state(false);
	let exportFormat = $state<ExportFormat>(untrack(() => data.exportFormat));
	const activePalette = $derived(palettes.find((palette) => palette.id === config.palette) ?? palettes[0]);

	function readStoredConfig() {
		try {
			const rawConfig = localStorage.getItem(faceStorageKey);
			return rawConfig ? parseFaceConfig(JSON.parse(rawConfig)) : null;
		} catch {
			return null;
		}
	}

	onMount(() => {
		config = readStoredConfig() ?? config;
		try {
			exportFormat = parseExportFormat(localStorage.getItem(exportFormatStorageKey)) ?? exportFormat;
		} catch {
			// Keep the server-provided preference when browser storage is unavailable.
		}
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

	function pick<T>(items: readonly T[]) {
		return items[Math.floor(Math.random() * items.length)];
	}

	function pickDifferent<T>(items: readonly T[], current: T) {
		return pick(items.filter((item) => item !== current));
	}

	function toggleLock(trait: TraitKey) {
		lockedTraits[trait] = !lockedTraits[trait];
	}

	function randomize() {
		if (traitKeys.some((trait) => lockedTraits[trait])) {
			config = {
				shape: lockedTraits.shape ? config.shape : pickDifferent(shapeIds, config.shape),
				eyes: lockedTraits.eyes ? config.eyes : pickDifferent(eyeIds, config.eyes),
				mood: lockedTraits.mood ? config.mood : pickDifferent(moodIds, config.mood),
				mouth: lockedTraits.mouth ? config.mouth : pickDifferent(mouthIds, config.mouth),
				palette: lockedTraits.palette ? config.palette : pickDifferent(paletteIds, config.palette)
			};
			return;
		}

		const keptTrait = pick(config.palette === 'mono' ? traitKeys.filter((trait) => trait !== 'palette') : traitKeys);
		config = {
			shape: keptTrait === 'shape' ? config.shape : pickDifferent(shapeIds, config.shape),
			eyes: keptTrait === 'eyes' ? config.eyes : pickDifferent(eyeIds, config.eyes),
			mood: keptTrait === 'mood' ? config.mood : pickDifferent(moodIds, config.mood),
			mouth: keptTrait === 'mouth' ? config.mouth : pickDifferent(mouthIds, config.mouth),
			palette: keptTrait === 'palette' ? config.palette : pickDifferent(paletteIds, config.palette)
		};
	}

	function reset() {
		config = { ...initialFaceConfig };
		lockedTraits = { ...initialLocks };
	}

	async function exportFace(format: ExportFormat) {
		if (!faceFrame || isExporting) return;

		isExporting = true;
		try {
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
				<select id="shape-select" bind:value={config.shape}>
					{#each shapes as option}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
				<button class="lock-toggle" class:active={lockedTraits.shape} type="button" onclick={() => toggleLock('shape')} aria-label={`${lockedTraits.shape ? 'Unlock' : 'Lock'} shape`} aria-pressed={lockedTraits.shape} title={`${lockedTraits.shape ? 'Unlock' : 'Lock'} shape`}></button>
			</div>
			<div class="control-row">
				<label for="eyes-select">Eyes</label>
				<select id="eyes-select" bind:value={config.eyes}>
					{#each eyeStyles as option}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
				<button class="lock-toggle" class:active={lockedTraits.eyes} type="button" onclick={() => toggleLock('eyes')} aria-label={`${lockedTraits.eyes ? 'Unlock' : 'Lock'} eyes`} aria-pressed={lockedTraits.eyes} title={`${lockedTraits.eyes ? 'Unlock' : 'Lock'} eyes`}></button>
			</div>
			<div class="control-row">
				<label for="mood-select">Mood</label>
				<select id="mood-select" bind:value={config.mood}>
					{#each moods as option}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
				<button class="lock-toggle" class:active={lockedTraits.mood} type="button" onclick={() => toggleLock('mood')} aria-label={`${lockedTraits.mood ? 'Unlock' : 'Lock'} mood`} aria-pressed={lockedTraits.mood} title={`${lockedTraits.mood ? 'Unlock' : 'Lock'} mood`}></button>
			</div>
			<div class="control-row">
				<label for="mouth-select">Mouth</label>
				<select id="mouth-select" bind:value={config.mouth}>
					{#each mouths as option}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
				<button class="lock-toggle" class:active={lockedTraits.mouth} type="button" onclick={() => toggleLock('mouth')} aria-label={`${lockedTraits.mouth ? 'Unlock' : 'Lock'} mouth`} aria-pressed={lockedTraits.mouth} title={`${lockedTraits.mouth ? 'Unlock' : 'Lock'} mouth`}></button>
			</div>
			<div class="control-row palette-control">
				<span class="control-label">Palette</span>
				<div class="palette-options">
					{#each palettes as palette}
						<button type="button" class:active={config.palette === palette.id} style={`--swatch-bg: ${palette.background}; --swatch-skin: ${palette.skin};`} onclick={() => choose('palette', palette.id)} aria-label={palette.name} aria-pressed={config.palette === palette.id}><span></span></button>
					{/each}
				</div>
				<button class="lock-toggle" class:active={lockedTraits.palette} type="button" onclick={() => toggleLock('palette')} aria-label={`${lockedTraits.palette ? 'Unlock' : 'Lock'} palette`} aria-pressed={lockedTraits.palette} title={`${lockedTraits.palette ? 'Unlock' : 'Lock'} palette`}></button>
			</div>
			<div class="control-row export-format-control">
				<label for="export-format-select">Export As</label>
				<select id="export-format-select" bind:value={exportFormat}>
					<option value="png">PNG</option>
					<option value="svg">SVG</option>
				</select>
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

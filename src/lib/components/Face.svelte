<script lang="ts">
	import { createFaceGeometry } from '$lib/face-geometry';
	import type { EyeStyle, FaceShape, Mood, MouthStyle, Palette } from '$lib/face-config';
	import type { SvgPath } from '$lib/face-geometry';

	let { shape, eyes, mood, mouth, palette }: {
		shape: FaceShape;
		eyes: EyeStyle;
		mood: Mood;
		mouth: MouthStyle;
		palette: Palette;
	} = $props();

	const geometry = $derived(createFaceGeometry(shape, eyes, mood, mouth));
	const description = $derived(`A ${mood}, right-facing face with ${eyes} eyes${mouth === 'none' ? ' and no mouth' : ` and a ${mouth} mouth`}`);

	function color(paint: SvgPath['fill']) {
		if (paint === 'ink') return palette.ink;
		if (paint === 'skin') return palette.skin;
		return 'none';
	}
</script>

<svg class="portrait" style={`--ink: ${palette.ink};`} viewBox="0 0 1000 1000" role="img" aria-label={description} preserveAspectRatio="xMidYMid meet">
	<rect width="1000" height="1000" fill={palette.background}></rect>
	<g transform={geometry.transform}>
		<path class="head" d={geometry.head.d} fill={palette.skin} stroke={palette.ink}></path>

		{#each geometry.eyes as path}
			<path class="eye" d={path.d} fill={color(path.fill)} transform={path.transform}></path>
		{/each}

		{#each geometry.brows as path}
			<path class:brow={path.strokeStyle === 'brow'} d={path.d} fill={color(path.fill)} stroke={path.stroke ? color(path.stroke) : 'none'} transform={path.transform}></path>
		{/each}

		{#each geometry.mouth as path}
			<path class="mouth-shape" class:outline={path.strokeStyle === 'outline'} class:mouth-line={path.strokeStyle === 'mouth'} d={path.d} fill={color(path.fill)} stroke={path.stroke ? color(path.stroke) : 'none'} transform={path.transform}></path>
		{/each}
	</g>
</svg>

<style>
	.portrait { display: block; width: 100%; height: 100%; overflow: hidden; }
	.head { stroke-width: 15px; stroke-linejoin: round; filter: drop-shadow(0 30px 0 color-mix(in srgb, var(--ink) 9%, transparent)); }
	.outline { stroke-width: 15px; }
	.brow { stroke-width: 18.75px; stroke-linecap: round; }
	.mouth-line { stroke-width: 16.875px; stroke-linecap: round; }
</style>

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

	function color(paint: SvgPath['fill'], colors: Palette) {
		if (paint === 'ink') return colors.ink;
		if (paint === 'skin') return colors.skin;
		return 'none';
	}

</script>

<svg class="portrait" viewBox="0 0 1000 1000" role="img" aria-label={description} preserveAspectRatio="xMidYMid meet">
	<rect width="1000" height="1000" fill={palette.background}></rect>
	<g transform={geometry.transform}>
		<g opacity="0.09" transform="translate(0 30)">
			<path
				d={geometry.head.d}
				fill={palette.ink}
				stroke={palette.ink}
				stroke-width="15"
				stroke-linejoin="round"
			></path>
		</g>
		<path
			d={geometry.head.d}
			fill={palette.skin}
			stroke={palette.ink}
			stroke-width="15"
			stroke-linejoin="round"
		></path>

		{#each geometry.eyes as path}
			<path d={path.d} fill={color(path.fill, palette)} transform={path.transform}></path>
		{/each}

		{#each geometry.brows as path}
			<path
				d={path.d}
				fill={color(path.fill, palette)}
				stroke={path.stroke ? color(path.stroke, palette) : 'none'}
				stroke-width={path.strokeStyle === 'brow' ? 18.75 : undefined}
				stroke-linecap={path.strokeStyle === 'brow' ? 'round' : undefined}
				transform={path.transform}
			></path>
		{/each}

		{#each geometry.mouth as path}
			<path
				d={path.d}
				fill={color(path.fill, palette)}
				stroke={path.stroke ? color(path.stroke, palette) : 'none'}
				stroke-width={path.strokeStyle === 'outline' ? 15 : path.strokeStyle === 'mouth' ? 16.875 : undefined}
				stroke-linecap={path.strokeStyle === 'mouth' ? 'round' : undefined}
				transform={path.transform}
			></path>
		{/each}
	</g>
</svg>

<style>
	.portrait { display: block; width: 100%; height: 100%; overflow: hidden; }
</style>

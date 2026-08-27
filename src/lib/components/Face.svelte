<script lang="ts">
	import type { EyeStyle, FaceShape, Mood, MouthStyle, Palette } from '$lib/face-config';

	let { shape, eyes, mood, mouth, palette }: {
		shape: FaceShape;
		eyes: EyeStyle;
		mood: Mood;
		mouth: MouthStyle;
		palette: Palette;
	} = $props();
</script>

<div class="portrait" style={`--portrait-bg: ${palette.background}; --skin: ${palette.skin}; --ink: ${palette.ink};`} role="img" aria-label={`A ${mood}, right-facing face with ${eyes} eyes${mouth === 'none' ? ' and no mouth' : ` and a ${mouth} mouth`}`}>
	<div class={`head shape-${shape} mood-${mood}`}>
		<div class="brows" aria-hidden="true"><span></span><span></span></div>
		<div class={`eyes eyes-${eyes}`} aria-hidden="true"><span></span><span></span></div>
		<div class={`mouth mouth-${mouth}`} aria-hidden="true"></div>
	</div>
</div>

<style>
	.portrait { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--portrait-bg); isolation: isolate; }
	.head { position: absolute; left: 50%; top: 53%; width: 57%; height: 64%; transform: translate(-50%, -50%); background: var(--skin); border: clamp(5px, 1.2vw, 8px) solid var(--ink); box-shadow: 0 16px 0 color-mix(in srgb, var(--ink) 9%, transparent); transition: border-radius 240ms ease, width 240ms ease, height 240ms ease; }
	.shape-soft { border-radius: 46% 54% 48% 52% / 41% 43% 57% 59%; transform: translate(-50%, -50%) rotate(-1deg); }
	.shape-round { width: 61%; height: 61%; border-radius: 50%; }
	.shape-tall { width: 50%; height: 69%; border-radius: 44% 44% 50% 50% / 38% 38% 62% 62%; }
	.shape-square { width: 60%; height: 59%; border-radius: 24% 20% 27% 22%; }
	.shape-wide { width: 70%; height: 52%; border-radius: 48% 52% 45% 55% / 52% 48% 52% 48%; }
	.shape-oval { width: 53%; height: 72%; border-radius: 50%; }
	.shape-arch { width: 60%; height: 66%; border-radius: 50% 50% 24% 24% / 44% 44% 22% 22%; }
	.shape-bean { width: 65%; height: 58%; border-radius: 58% 42% 55% 45% / 43% 55% 45% 57%; transform: translate(-50%, -50%) rotate(2deg); }
	.eyes { position: absolute; display: flex; justify-content: space-between; align-items: center; width: 49%; height: 28%; left: 39%; top: 33%; }
	.eyes span { display: block; background: var(--ink); transition: width 180ms ease, height 180ms ease, border-radius 180ms ease, transform 180ms ease; }
	.eyes-pebble span { width: 34%; height: 96%; border-radius: 50%; }
	.eyes-dot { width: 42%; left: 44%; }
	.eyes-dot span { width: 31%; aspect-ratio: 1; border-radius: 50%; }
	.eyes-sleepy span { width: 32%; height: 76%; border-radius: 999px; transform: rotate(-34deg); }
	.eyes-block span { width: 33%; aspect-ratio: 1; border-radius: 14%; }
	.eyes-pill span { width: 31%; height: 94%; border-radius: 999px; }
	.eyes-diamond span { width: 29%; aspect-ratio: 1; border-radius: 8%; transform: rotate(45deg); }
	.eyes-dash span { width: 36%; height: 25%; border-radius: 999px; }
	.eyes-drop span { width: 31%; height: 91%; border-radius: 58% 42% 58% 42%; transform: rotate(-22deg); }
	.eyes-alien { width: 53%; height: 27%; left: 36%; top: 35%; }
	.eyes-alien span { width: 43%; height: 100%; }
	.eyes-alien span:first-child { border-radius: 10% 82% 0 78% / 12% 76% 0 72%; transform: rotate(4deg); }
	.eyes-alien span:last-child { border-radius: 82% 10% 78% 0 / 76% 12% 72% 0; transform: rotate(-4deg); }
	.eyes-gem span { width: 35%; aspect-ratio: 1; clip-path: polygon(22% 0, 78% 0, 100% 30%, 50% 100%, 0 30%); }
	.eyes-star span { width: 36%; aspect-ratio: 1; clip-path: polygon(50% 0, 61% 34%, 98% 35%, 68% 56%, 79% 94%, 50% 72%, 21% 94%, 32% 56%, 2% 35%, 39% 34%); }
	.eyes-heart span { position: relative; width: 30%; aspect-ratio: 1; border-radius: 8%; transform: rotate(45deg); }
	.eyes-heart span::before, .eyes-heart span::after { content: ''; position: absolute; width: 100%; height: 100%; background: var(--ink); border-radius: 50%; }
	.eyes-heart span::before { left: -50%; top: 0; }
	.eyes-heart span::after { left: 0; top: -50%; }
	.eyes-x span { width: 34%; aspect-ratio: 1; clip-path: polygon(0 18%, 18% 0, 50% 32%, 82% 0, 100% 18%, 68% 50%, 100% 82%, 82% 100%, 50% 68%, 18% 100%, 0 82%, 32% 50%); }
	.brows { position: absolute; display: flex; justify-content: space-between; width: 47%; left: 40%; top: 27%; z-index: 1; }
	.brows span { width: 29%; height: clamp(7px, 1.1vw, 10px); background: var(--ink); border-radius: 999px; transform: scaleX(0); transition: transform 180ms ease; }
	.mood-happy .brows span { height: clamp(11px, 1.5vw, 15px); background: transparent; border-top: clamp(7px, 1.1vw, 10px) solid var(--ink); border-radius: 50%; transform: translateY(-4px); }
	.mood-curious .brows span:first-child { transform: translateY(-6px) rotate(-12deg); }
	.mood-curious .brows span:last-child { transform: rotate(8deg); }
	.mood-mischief .brows span:first-child { transform: rotate(13deg); }
	.mood-mischief .brows span:last-child { transform: rotate(-13deg); }
	.mood-surprised .brows span { transform: translateY(-9px) scaleX(0.82); }
	.mood-stern .brows span { transform: translateY(5px); }
	.mood-worried .brows span:first-child { transform: rotate(-13deg); }
	.mood-worried .brows span:last-child { transform: rotate(13deg); }
	.mood-dreamy .brows span:first-child { transform: translateY(-5px) rotate(-8deg); }
	.mouth { position: absolute; left: 61%; top: 68%; width: 23%; height: 10%; color: var(--ink); }
	.mouth-none { display: none; }
	.mouth-smile { top: 69%; height: 11%; background: var(--ink); border-radius: 12% 12% 55% 55% / 16% 16% 100% 100%; }
	.mouth-grin { height: 13%; background: var(--skin); border: clamp(5px, 0.9vw, 8px) solid var(--ink); border-radius: 35% 35% 55% 55%; }
	.mouth-open { left: 67%; width: 11%; height: 15%; background: var(--ink); border-radius: 50%; }
	.mouth-flat { top: 72%; height: clamp(6px, 1vw, 9px); background: var(--ink); border-radius: 999px; }
	.mouth-pout { top: 72%; height: 11%; background: var(--ink); border-radius: 55% 55% 12% 12% / 100% 100% 16% 16%; }
	.mouth-ooh { left: 67%; width: 11%; aspect-ratio: 1; height: auto; background: var(--skin); border: clamp(5px, 0.9vw, 8px) solid var(--ink); border-radius: 50%; }
	.mouth-smirk { left: 64%; top: 71%; width: 18%; height: clamp(6px, 1vw, 9px); background: var(--ink); border-radius: 999px; transform: rotate(-14deg); }
</style>

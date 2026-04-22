<script>
	import {pageBackground} from "$lib/stores"

	let {src = "", blur = 0} = $props()

	$effect(() => {
		const nextBackground = {
			src: src || "",
			blur: Number.isFinite(blur) ? Math.max(0, blur) : 0,
		}
		pageBackground.set(nextBackground)

		return () => {
			pageBackground.update((current) =>
				current.src === nextBackground.src &&
				current.blur === nextBackground.blur
					? {src: "", blur: 0}
					: current,
			)
		}
	})
</script>

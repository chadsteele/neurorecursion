<script>
	import {pageBackground} from "$lib/stores"

	let {src = ""} = $props()

	$effect(() => {
		const nextBackground = src || ""
		pageBackground.set(nextBackground)

		return () => {
			pageBackground.update((current) =>
				current === nextBackground ? "" : current,
			)
		}
	})
</script>

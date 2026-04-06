<script>
	let {height = 300, class: customClass = ""} = $props()
	let isVisible = $state(true)

	function toggle() {
		isVisible = !isVisible
	}
</script>

<div class="skeleton-container">
	<button class="toggle-skeleton" onclick={toggle}>
		{isVisible ? "Hide" : "Show"} Skeleton
	</button>
	{#if isVisible}
		<div class="skeleton {customClass}" style="height: {height}px;"></div>
	{:else}
		<div
			class="skeleton disabled {customClass}"
			style="height: {height}px;"
		></div>
	{/if}
</div>

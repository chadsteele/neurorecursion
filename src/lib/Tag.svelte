<script>
	import {searchOpen, searchQuery} from "$lib/stores.js"

	let {label = ""} = $props()

	function handleTagClick() {
		// Set the search query to the label
		searchQuery.set(label)

		// Open the search bar; results are only computed when nav buttons are clicked
		searchOpen.set(true)
	}
</script>

<button type="button" class="tag" onclick={handleTagClick}>
	{label}
</button>

<style>
	.tag {
		display: inline-block;
		padding: 0.4rem 0.75rem;
		background: rgba(74, 159, 216, 0.2);
		border: 1px solid rgba(74, 159, 216, 0.4);
		border-radius: 20px;
		color: #a0d8ff;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.tag:hover {
		background: rgba(74, 159, 216, 0.35);
		border-color: rgba(74, 159, 216, 0.6);
		transform: scale(1.05);
	}

	.tag:active {
		transform: scale(0.98);
	}

	.tag:focus-visible {
		outline: 2px solid rgba(74, 159, 216, 0.8);
		outline-offset: 2px;
	}
</style>

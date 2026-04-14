<script>
	let {src = ""} = $props()
</script>

<div class="lazy-parallax-image" style="background-image: url('{src}');" />

<style>
	@keyframes kenBurns {
		from {
			background-size: 120%;
			background-position: center;
		}
		to {
			background-size: 150%;
			background-position: center;
		}
	}

	.lazy-parallax-image {
		width: 100%;
		height: 20vh;
		border-radius: 12px;
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		animation: kenBurns 8s ease-in-out infinite alternate;
	}

	/* Parallax for devices 600px+ */
	@media (min-width: 600px) {
		.lazy-parallax-image {
			background-attachment: fixed;
			animation: none;
		}
	}
</style>

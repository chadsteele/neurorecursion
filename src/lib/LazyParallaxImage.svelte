<script>
	let {src = ""} = $props()
	let isScrolling = $state(false)
	let shouldLoad = $state(false)
	let imageElement
	let scrollTimeout

	function handleScroll() {
		isScrolling = true

		clearTimeout(scrollTimeout)
		scrollTimeout = setTimeout(() => {
			isScrolling = false
			checkIfShouldLoad()
		}, 500)
	}

	function checkIfShouldLoad() {
		if (!isScrolling && !shouldLoad && imageElement) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							shouldLoad = true
							observer.unobserve(imageElement)
						}
					})
				},
				{threshold: 0.1},
			)

			observer.observe(imageElement)
		}
	}

	$effect(() => {
		window.addEventListener("scroll", handleScroll)

		return () => {
			window.removeEventListener("scroll", handleScroll)
			clearTimeout(scrollTimeout)
		}
	})

	$effect(() => {
		checkIfShouldLoad()
	})
</script>

<div
	bind:this={imageElement}
	class="lazy-parallax-image"
	style={shouldLoad ? `background-image: url('${src}');` : ""}
></div>

<style>
	@keyframes kenBurns {
		0% {
			background-size: 120%;
			background-position: center;
		}
		50% {
			background-size: 150%;
			background-position: center;
		}
		100% {
			background-size: 120%;
			background-position: center;
		}
	}

	.lazy-parallax-image {
		width: 100%;
		height: 20vh;
		border-radius: 12px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		animation: kenBurns 60s ease-in-out infinite;
	}

	/* Parallax for devices 600px+ */
	@media (min-width: 600px) {
		.lazy-parallax-image {
			background-attachment: fixed;
		}
	}
</style>

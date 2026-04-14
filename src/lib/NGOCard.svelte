<script>
	let {id, path, href, imageSrc, imageAlt, name, description} = $props()
	let isVisible = $state(false)
	let cardElement

	function handleCardClick(event) {
		if (href) {
			window.open(href, "_blank")
		}
	}

	function handleCardKeydown(event) {
		if (event.key === "Enter" || event.key === " ") {
			handleCardClick(event)
		}
	}

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isVisible = true
						observer.unobserve(entry.target)
					}
				})
			},
			{
				threshold: 0.9,
			},
		)

		if (cardElement) {
			observer.observe(cardElement)
		}

		return () => {
			observer.disconnect()
		}
	})
</script>

<div
	bind:this={cardElement}
	class="ngo-card"
	class:visible={isVisible}
	data-href={href}
	role="button"
	tabindex="0"
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
>
	<div {id} {path}></div>
	<img src={imageSrc} alt={imageAlt} />
	<h3>{name}</h3>
	<p>{@html description}</p>
	<a {href}>{href}</a>
</div>

<style>
	.ngo-card {
		border: 1px solid #e0e0e0;
		padding: 1.5rem;
		border-radius: 8px;
		text-align: center;
		background-color: #ffffff;
		transition: all 0.3s ease;
		cursor: pointer;
		user-select: none;
		opacity: 0;
		transform: translateY(40px);
	}

	.ngo-card.visible {
		animation: slideUpFadeIn 0.6s ease-out forwards;
	}

	@keyframes slideUpFadeIn {
		from {
			opacity: 0;
			transform: translateY(100px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.ngo-card:hover {
		background: #f5f5f5;
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: #999;
	}

	.ngo-card img {
		margin-bottom: 1rem;
		max-width: 150px;
		height: auto;
	}

	.ngo-card h3 {
		color: #000000;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}

	.ngo-card p {
		font-size: 0.95rem;
		margin-bottom: 1rem;
		color: #333333;
		line-height: 1.6;
	}

	.ngo-card a {
		color: #0066cc;
		text-decoration: none;
		word-break: break-all;
		font-size: 0.85rem;
		transition: color 0.3s ease;
	}

	.ngo-card a:hover {
		color: #004399;
		text-decoration: underline;
	}
</style>

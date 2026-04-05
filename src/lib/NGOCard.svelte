<script>
	let {href, imageSrc, imageAlt, name, description} = $props()

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
</script>

<div
	class="ngo-card"
	data-href={href}
	role="button"
	tabindex="0"
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
>
	<img src={imageSrc} alt={imageAlt} />
	<h3>{name}</h3>
	<p>{@html description}</p>
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

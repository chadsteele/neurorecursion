<script>
	let {src = ""} = $props()
</script>

<div class="lazy-parallax-image" style="background-image: url('{src}');" />

<style>
	.lazy-parallax-image {
		width: 100%;
		height: 20vh;
		border-radius: 12px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed;
	}
</style>

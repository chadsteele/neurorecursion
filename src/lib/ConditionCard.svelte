<script>
	import Parallax from "$lib/Parallax.svelte"

	let {condition = {}, formData = {}} = $props()
</script>

<div id={condition.id} path={condition.path}></div>
<Parallax background={condition.background_image}>
	<section class="paper container">
		<h3>{condition.name}</h3>
		<p>
			{condition?.description?.trim() || ""}
		</p>

		<p>This could be your breakthrough! Sign up now.</p>
		<div class="condition-links">
			<label class="toggle-slider">
				<input
					type="checkbox"
					bind:checked={formData.conditions[condition.name]}
				/>
				<span class="slider"></span>
				<span class="toggle-label">
					{formData.conditions[condition.name] ? "me!" : "nope"}
				</span>
			</label>
			<a type="button" class="signup-btn" href="#signup"> ✅ Sign up! </a>

			<a
				href={condition.ngo_url}
				target="_blank"
				rel="noopener noreferrer"
			>
				❤️ Support
			</a>
			<a
				href={condition.scientific_reference}
				target="_blank"
				rel="noopener noreferrer"
			>
				🔬 Science
			</a>
		</div>
	</section>
</Parallax>

<style>
	h3 {
		color: #4a9fd8;
		font-size: 1.5rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	p {
		color: #d0d0d0;
		line-height: 1.6;
	}

	.condition-links {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}

	.condition-links a {
		padding: 0.5rem 1rem;
		background: #4a9fd8;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.3s ease;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.condition-links a:hover {
		background: #357ba8;
	}

	.toggle-slider {
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}

	.toggle-slider input {
		display: none;
	}

	.slider {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 26px;
		background-color: #4a5f7f;
		border-radius: 24px;
		transition: background-color 0.3s ease;
		border: 1px solid rgba(74, 159, 216, 0.3);
	}

	.slider::after {
		content: "";
		position: absolute;
		width: 20px;
		height: 20px;
		left: 2px;
		top: 2px;
		background-color: white;
		border-radius: 50%;
		transition: transform 0.3s ease;
	}

	.toggle-slider input:checked + .slider {
		background-color: #4a9fd8;
		border-color: rgba(74, 159, 216, 0.8);
	}

	.toggle-slider input:checked + .slider::after {
		transform: translateX(26px);
	}

	.toggle-label {
		margin-left: 0.5rem;
		font-weight: 600;
		font-size: 0.85rem;
		color: #a0d8ff;
		min-width: 35px;
	}
</style>

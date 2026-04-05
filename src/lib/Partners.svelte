<script>
	import NGOCard from "./NGOCard.svelte"

	const ngos = [
		{
			href: "https://tourette.org/",
			imageSrc: "/partners/TouretteLogo.svg",
			imageAlt: "Tourette Association of America Logo",
			name: "Tourette Association of America (TAA)",
			description:
				"The premier global organization dedicated to making life better for all people affected by Tourette Syndrome and Tic Disorders through research, advocacy, and support.",
		},
		{
			href: "https://www.autismspeaks.org/",
			imageSrc: "/partners/autismspeaks.png",
			imageAlt: "Autism Speaks Logo",
			name: "Autism Speaks",
			description:
				"A global leader in promoting solutions for the needs of individuals with autism and their families through advocacy and support across the lifespan.",
		},
		{
			href: "https://chadd.org/",
			imageSrc: "/partners/chadd.png",
			imageAlt: "CHADD Logo",
			name: "CHADD",
			description:
				"The leading non-profit organization serving people affected by ADHD, providing evidence-based information and support for children and adults.",
		},
		{
			href: "https://dyslexiaida.org/",
			imageSrc: "/partners/dyslexiaassoc.png",
			imageAlt: "IDA Logo",
			name: "International Dyslexia Association (IDA)",
			description:
				"Dedicated to helping individuals who struggle with dyslexia and other related reading differences through research-based literacy programs.",
		},
		{
			href: "https://www.autism.org.uk/",
			imageSrc: "/partners/nas.png",
			imageAlt: "National Autistic Society Logo",
			name: "National Autistic Society (UK)",
			description:
				"The UK's leading charity for autistic people and their families, providing specialist education, care, and employment support services.",
		},
		{
			href: "https://add.org/",
			imageSrc: "/partners/adda.png",
			imageAlt: "ADDA Logo",
			name: "Attention Deficit Disorder Association (ADDA)",
			description:
				"The world's largest organization specifically dedicated to helping adults with ADHD lead better lives through education and community.",
		},
		{
			href: "https://www.bdadyslexia.org.uk/",
			imageSrc: "/partners/britishdyslexia.png",
			imageAlt: "BDA Logo",
			name: "British Dyslexia Association (BDA)",
			description:
				"Campaigns for a dyslexia-friendly society where every person with dyslexia has the opportunity to reach their full potential.",
		},
		{
			href: "https://www.autismeurope.org/",
			imageSrc: "/partners/autismeurope.png",
			imageAlt: "Autism-Europe Logo",
			name: "Autism-Europe",
			description:
				"An international association whose main objective is to advance the rights of autistic people and their families across Europe.",
		},
		{
			href: "https://ldaamerica.org/",
			imageSrc: "/partners/ldaa.png",
			imageAlt: "LDA Logo",
			name: "Learning Disabilities Association of America (LDA)",
			description:
				"Provides support to people with learning disabilities, their parents, teachers, and other professionals through advocacy and education.",
		},
		{
			href: "https://www.westutter.org/",
			imageSrc: "/partners/westutter.avif",
			imageAlt: "National Stuttering Association Logo",
			name: "National Stuttering Association (NSA)",
			description: `79 Million People Stutter Worldwide <br/>The National Stuttering Association believes in a more accepting and understanding world for people who stutter.`,
		},
	]
</script>

<section class="partners-section">
	<h2>Neuro Recursion Resources and Partners</h2>
	<p>
		The Neuro Recursion Institute supports the world's leading
		non-governmental organizations dedicated to neurodivergent advocacy,
		clinical research, and systemic support.
	</p>

	<div class="ngo-container">
		{#each ngos as ngo (ngo.href)}
			<NGOCard {...ngo} />
		{/each}
	</div>
</section>

<style>
	.partners-section {
		margin-bottom: 4rem;
		padding: 3rem 2rem;
		background: rgba(30, 90, 150, 0.1);
		border-left: 4px solid #4a9fd8;
		border-radius: 8px;
		position: relative;
	}

	.partners-section h2 {
		color: #4a9fd8;
		font-size: 1.8rem;
		margin-bottom: 1rem;
		margin-top: 0;
	}

	.partners-section p {
		color: #e8e8e8;
		font-size: 1.02rem;
		line-height: 1.75;
		margin-bottom: 2rem;
	}

	.ngo-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		padding: 0;
	}

	@media (max-width: 799px) {
		.ngo-container {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}
	}

	@media (max-width: 400px) {
		.ngo-container {
			grid-template-columns: 1fr;
		}
	}
</style>

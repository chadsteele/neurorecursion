<script>
	import NGOCard from "./NGOCard.svelte"

	const ngos = [
		{
			href: "https://www.autismspeaks.org/",
			imageSrc: "/partners/autismspeaks.png",
			imageAlt: "Autism Speaks Logo",
			name: "Autism Speaks",
			description:
				"The world's largest autism advocacy organization, focusing on research and global awareness.",
		},
		{
			href: "https://chadd.org/",
			imageSrc: "/partners/chadd.png",
			imageAlt: "CHADD Logo",
			name: "CHADD (Children and Adults with ADHD)",
			description:
				"The leading non-profit providing evidence-based training and advocacy for the ADHD community.",
		},
		{
			href: "https://tourette.org/",
			imageSrc: "/partners/TouretteLogo.svg",
			imageAlt: "Tourette Association of America Logo",
			name: "Tourette Association of America (TAA)",
			description:
				"The premier global entity for research into the CSTC loops and clinical support for tic disorders.",
		},
		{
			href: "https://iocdf.org/",
			imageSrc: "/partners/international-ocd-foundation.png",
			imageAlt: "International OCD Foundation Logo",
			name: "International OCD Foundation (IOCDF)",
			description:
				"A global donor-supported organization dedicated to helping those with OCD and related disorders.",
		},
		{
			href: "https://ibpf.org/",
			imageSrc: "/partners/ibf.png",
			imageAlt: "International Bipolar Foundation Logo",
			name: "International Bipolar Foundation (IBPF)",
			description:
				"Focuses on global outreach and providing free resources to those living with bipolar disorder.",
		},
		{
			href: "https://www.dbsalliance.org/",
			imageSrc: "/partners/dbsa.png",
			imageAlt: "DBSA Logo",
			name: "Depression and Bipolar Support Alliance (DBSA)",
			description:
				"A peer-led organization providing support groups and clinical information for mood disorders.",
		},
		{
			href: "https://westutter.org/",
			imageSrc: "/partners/westutter.png",
			imageAlt: "National Stuttering Association Logo",
			name: "National Stuttering Association (NSA)",
			description:
				"The world's largest support organization for people who stutter.",
		},
		{
			href: "https://adaa.org/",
			imageSrc: "/partners/adda.png",
			imageAlt: "ADAA Logo",
			name: "Anxiety and Depression Association of America (ADAA)",
			description:
				"Focuses on the prevention and treatment of anxiety, phobias, and related disorders.",
		},
		{
			href: "https://wfad.se/",
			imageSrc: "/partners/WFAD_logo.png",
			imageAlt: "World Federation Against Drugs Logo",
			name: "World Federation Against Drugs (WFAD)",
			description:
				"A multilateral umbrella organization for NGOs working on drug prevention and recovery.",
		},
		{
			href: "https://dyspraxiafoundation.co.uk/",
			imageSrc: "/partners/dyspraxia.png",
			imageAlt: "Dyspraxia Foundation Logo",
			name: "Dyspraxia Foundation (UK)",
			description:
				"The leading international resource for Developmental Coordination Disorder research and support.",
		},
		{
			href: "https://www.dyscalculia.me.uk/",
			imageSrc: "/partners/dyscalculia.png",
			imageAlt: "Dyscalculia Association Logo",
			name: "The Dyscalculia Association",
			description:
				"Provides specialized research and teacher training for numerical processing disorders.",
		},
		{
			href: "https://dyslexiaida.org/",
			imageSrc: "/partners/dyslexiaassoc.png",
			imageAlt: "IDA Logo",
			name: "International Dyslexia Association (IDA)",
			description:
				"The oldest organization dedicated to the study and treatment of dyslexia worldwide.",
		},
		{
			href: "https://sensoryhealth.org/",
			imageSrc: "/partners/star.png",
			imageAlt: "STAR Institute Logo",
			name: "STAR Institute for Sensory Processing",
			description:
				"The premier global center for SPD research, treatment, and education.",
		},

		{
			href: "https://www.pdasociety.org.uk/",
			imageSrc: "/partners/pda.png",
			imageAlt: "PDA Society Logo",
			name: "PDA Society",
			description:
				"The primary global organization defining and advocating for the PDA profile of autism.",
		},
		{
			href: "https://world-gifted.org/",
			imageSrc: "/partners/world-gifted.png",
			imageAlt: "World Council for Gifted and Talented Children Logo",
			name: "World Council for Gifted and Talented Children (WCGTC)",
			description:
				"A worldwide network that supports research and educational policies for gifted individuals.",
		},
	]

	let {...props} = $props()
</script>

<section {...props}>
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

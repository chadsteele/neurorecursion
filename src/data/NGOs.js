// GLOBAL & INTERNATIONAL META-ORGANIZATIONS
const globalOrganizations = [
	{
		id: "ngo-who",
		path: "/ngo/who",
		href: "https://www.who.int/health-topics/mental-health",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-who.png",
		imageAlt: "WHO Logo",
		name: "WHO (World Health Organization) - Mental Health Division",
		description:
			"The UN's primary health authority, with global programs in mental health, neurology, and disability prevention across 194 countries.",
	},
	{
		id: "ngo-unicef",
		path: "/ngo/unicef",
		href: "https://www.unicef.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-unicef.png",
		imageAlt: "UNICEF Logo",
		name: "UNICEF (UN Children's Fund)",
		description:
			"The world's largest organization dedicated to children's welfare, operating in 190 countries with programs for health, education, and protection.",
	},
	{
		id: "ngo-unodc",
		path: "/ngo/unodc",
		href: "https://www.unodc.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-unodc.png",
		imageAlt: "UNODC Logo",
		name: "UNODC (UN Office on Drugs and Crime)",
		description:
			"The UN agency fighting drug trafficking, crime, and corruption with programs for substance abuse prevention and treatment in 190+ countries.",
	},
	{
		id: "ngo-world-federation-for-mental-health",
		path: "/ngo/world-federation-mental-health",
		href: "https://www.wfmh.global/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-federation-for-mental-health.png",
		imageAlt: "World Federation for Mental Health Logo",
		name: "World Federation for Mental Health (WFMH)",
		description:
			"A global organization advancing mental health advocacy, awareness, and promotion across 150+ countries with 320+ member organizations.",
	},
	{
		id: "ngo-world-psychiatric-association",
		path: "/ngo/world-psychiatric-association",
		href: "https://www.wpanet.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-psychiatric-association.png",
		imageAlt: "World Psychiatric Association Logo",
		name: "World Psychiatric Association (WPA)",
		description:
			"The global federation of psychiatric societies representing 250,000+ psychiatrists and promoting mental health care in 140+ countries.",
	},
	{
		id: "ngo-world-federation-of-neurology",
		path: "/ngo/world-federation-neurology",
		href: "https://www.wfneurology.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-federation-of-neurology.png",
		imageAlt: "World Federation of Neurology Logo",
		name: "World Federation of Neurology (WFN)",
		description:
			"The global federation of neurological societies providing education, research, and patient advocacy across 130+ countries.",
	},
	{
		id: "ngo-médecins-sans-frontières",
		path: "/ngo/médecins-sans-frontières",
		href: "https://www.msf.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-médecins-sans-frontières.png",
		imageAlt: "Médecins Sans Frontières Logo",
		name: "Médecins Sans Frontières (Doctors Without Borders)",
		description:
			"An international humanitarian organization providing medical aid to people affected by conflict, disease, and disaster.",
	},
	{
		id: "ngo-amnesty-international",
		path: "/ngo/amnesty-international",
		href: "https://www.amnesty.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-amnesty-international.png",
		imageAlt: "Amnesty International Logo",
		name: "Amnesty International",
		description:
			"A global human rights organization with 10+ million members advocating for justice and human dignity across 150+ countries.",
	},
]

// NEURODEVELOPMENTAL DISORDERS
const neurodevelopmentalOrganizations = [
	{
		id: "ngo-autism-speaks",
		path: "/ngo/autism-speaks",
		href: "https://www.autismspeaks.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-autism-speaks.png",
		imageAlt: "Autism Speaks Logo",
		name: "Autism Speaks",
		description:
			"The world's largest autism advocacy organization, focusing on research and global awareness.",
	},
	{
		id: "ngo-pda-society",
		path: "/ngo/pda-society",
		href: "https://www.pdasociety.org.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-pda-society.png",
		imageAlt: "PDA Society Logo",
		name: "PDA Society",
		description:
			"The primary global organization defining and advocating for the PDA profile of autism.",
	},
	{
		id: "ngo-chadd",
		path: "/ngo/chadd",
		href: "https://chadd.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-chadd.png",
		imageAlt: "CHADD Logo",
		name: "CHADD (Children and Adults with ADHD)",
		description:
			"The leading non-profit providing evidence-based training and advocacy for the ADHD community.",
	},
	{
		id: "ngo-international-dyslexia-association",
		path: "/ngo/international-dyslexia-association",
		href: "https://dyslexiaida.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-international-dyslexia-association.png",
		imageAlt: "IDA Logo",
		name: "International Dyslexia Association (IDA)",
		description:
			"The oldest organization dedicated to the study and treatment of dyslexia worldwide.",
	},
	{
		id: "ngo-the-dyscalculia-association",
		path: "/ngo/dyscalculia-association",
		href: "https://www.dyscalculia.me.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-the-dyscalculia-association.png",
		imageAlt: "Dyscalculia Association Logo",
		name: "The Dyscalculia Association",
		description:
			"Provides specialized research and teacher training for numerical processing disorders.",
	},
	{
		id: "ngo-dysgraphia-support",
		path: "/ngo/dysgraphia-support",
		href: "https://www.dysgraphia.life/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-dysgraphia-support.png",
		imageAlt: "Dysgraphia Logo",
		name: "Dysgraphia Support",
		description:
			"An organization providing resources for writing disorder research and support.",
	},
	{
		id: "ngo-dyspraxia-foundation",
		path: "/ngo/dyspraxia-foundation",
		href: "https://dyspraxiafoundation.co.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-dyspraxia-foundation.png",
		imageAlt: "Dyspraxia Foundation Logo",
		name: "Dyspraxia Foundation (UK)",
		description:
			"The leading international resource for Developmental Coordination Disorder research and support.",
	},
	{
		id: "ngo-dyspraxia-usa",
		path: "/ngo/dyspraxia-usa",
		href: "https://dyspraxiausa.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-dyspraxia-usa.png",
		imageAlt: "Dyspraxia USA Logo",
		name: "Dyspraxia USA",
		description:
			"An organization dedicated to raising awareness and support for dyspraxia.",
	},
	{
		id: "ngo-star-institute-for-sensory-processing",
		path: "/ngo/star-institute-sensory-processing",
		href: "https://sensoryhealth.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-star-institute-for-sensory-processing.png",
		imageAlt: "STAR Institute Logo",
		name: "STAR Institute for Sensory Processing",
		description:
			"The premier global center for SPD research, treatment, and education.",
	},
	{
		id: "ngo-national-stuttering-association",
		path: "/ngo/national-stuttering-association",
		href: "https://westutter.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-stuttering-association.png",
		imageAlt: "National Stuttering Association Logo",
		name: "National Stuttering Association (NSA)",
		description:
			"The world's largest support organization for people who stutter.",
	},
	{
		id: "ngo-stuttering-help",
		path: "/ngo/stuttering-help",
		href: "https://www.stutteringhelp.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-stuttering-help.png",
		imageAlt: "Stuttering Help Logo",
		name: "Stuttering Help (Also known as Speech Easy)",
		description:
			"An organization providing facts, support, and resources for stuttering.",
	},
	{
		id: "ngo-selective-mutism-association",
		path: "/ngo/selective-mutism-association",
		href: "https://www.selectivemutism.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-selective-mutism-association.png",
		imageAlt: "Selective Mutism Logo",
		name: "Selective Mutism Association",
		description:
			"An organization providing resources and support for selective mutism.",
	},
	{
		id: "ngo-learning-disabilities-association-of-america",
		path: "/ngo/learning-disabilities-association-america",
		href: "https://ldaamerica.org/what-is-dyscalculia/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-learning-disabilities-association-of-america.png",
		imageAlt: "Learning Disabilities Association Logo",
		name: "Learning Disabilities Association of America",
		description:
			"An organization providing research and resources on learning disabilities.",
	},
	{
		id: "ngo-world-literacy-foundation",
		path: "/ngo/world-literacy-foundation",
		href: "https://worldliteracyfoundation.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-literacy-foundation.png",
		imageAlt: "World Literacy Foundation Logo",
		name: "World Literacy Foundation",
		description:
			"An international organization promoting literacy and education access globally, supporting reading and writing development for all ages.",
	},
	{
		id: "ngo-asha",
		path: "/ngo/asha",
		href: "https://www.asha.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-asha.png",
		imageAlt: "ASHA Logo",
		name: "ASHA (American Speech-Language-Hearing Association)",
		description:
			"The leading organization for speech-language pathology and audiology professionals.",
	},
]

// NEUROLOGICAL & MOVEMENT DISORDERS
const neurologicalOrganizations = [
	{
		id: "ngo-brain-and-spine-foundation",
		path: "/ngo/brain-spine-foundation",
		href: "https://www.brainandspine.org.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-brain-and-spine-foundation.png",
		imageAlt: "Brain and Spine Foundation Logo",
		name: "Brain and Spine Foundation (Global)",
		description:
			"An international organization providing information and support for neurological and spinal conditions with research partnerships worldwide.",
	},
	{
		id: "ngo-the-neurological-alliance",
		path: "/ngo/neurological-alliance",
		href: "https://www.neural.org.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-the-neurological-alliance.png",
		imageAlt: "The Neurological Alliance Logo",
		name: "The Neurological Alliance",
		description:
			"A UK-based alliance of organizations supporting people affected by neurological conditions.",
	},
	{
		id: "ngo-epilepsy-foundation",
		path: "/ngo/epilepsy-foundation",
		href: "https://www.epilepsy.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-epilepsy-foundation.png",
		imageAlt: "Epilepsy Logo",
		name: "Epilepsy Foundation",
		description:
			"A leading organization providing research, education, and support for epilepsy.",
	},
	{
		id: "ngo-tourette-association-of-america",
		path: "/ngo/tourette-association-america",
		href: "https://tourette.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-tourette-association-of-america.png",
		imageAlt: "Tourette Association of America Logo",
		name: "Tourette Association of America (TAA)",
		description:
			"The premier global entity for research into the CSTC loops and clinical support for tic disorders.",
	},
	{
		id: "ngo-international-association-for-the-study-of-pain",
		path: "/ngo/international-association-study-pain",
		href: "https://www.iasp-pain.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-international-association-for-the-study-of-pain.png",
		imageAlt: "IASP Logo",
		name: "International Association for the Study of Pain (IASP)",
		description:
			"A global organization advancing pain research and clinical care.",
	},
	{
		id: "ngo-american-migraine-foundation",
		path: "/ngo/american-migraine-foundation",
		href: "https://americanmigrainefoundation.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-american-migraine-foundation.png",
		imageAlt: "American Migraine Foundation Logo",
		name: "American Migraine Foundation",
		description:
			"A leading organization advancing migraine research and patient education worldwide.",
	},
	{
		id: "ngo-misophonia-hub",
		path: "/ngo/misophonia-hub",
		href: "https://misophonia-hub.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-misophonia-hub.png",
		imageAlt: "Misophonia Hub Logo",
		name: "Misophonia Hub",
		description: "A resource center for misophonia research and support.",
	},
	{
		id: "ngo-tlc-foundation-for-body-focused-repetitive-behaviors",
		path: "/ngo/tlc-foundation-body-focused-repetitive-behaviors",
		href: "https://www.bfrb.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-tlc-foundation-for-body-focused-repetitive-behaviors.png",
		imageAlt: "BFRB Logo",
		name: "TLC Foundation for Body-Focused Repetitive Behaviors (BFRB)",
		description:
			"An organization providing support and research for hair pulling, skin picking, and nail biting disorders.",
	},
]

// MOOD, ANXIETY & PSYCHIATRIC DISORDERS
const psychiatricOrganizations = [
	{
		id: "ngo-anxiety-and-depression-association-of-america",
		path: "/ngo/anxiety-depression-association-america",
		href: "https://adaa.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-anxiety-and-depression-association-of-america.png",
		imageAlt: "ADAA Logo",
		name: "Anxiety and Depression Association of America (ADAA)",
		description:
			"Focuses on the prevention and treatment of anxiety, phobias, and related disorders.",
	},
	{
		id: "ngo-anxiety-canada",
		path: "/ngo/anxiety-canada",
		href: "https://www.anxietycanada.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-anxiety-canada.png",
		imageAlt: "Anxiety Canada Logo",
		name: "Anxiety Canada",
		description:
			"A Canadian organization providing evidence-based resources for anxiety disorders.",
	},
	{
		id: "ngo-fear-of-flying-help",
		path: "/ngo/fear-flying-help",
		href: "https://www.fearofflying.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-fear-of-flying-help.png",
		imageAlt: "Fear of Flying Logo",
		name: "Fear of Flying Help",
		description: "Resources and support for those with aviophobia.",
	},
	{
		id: "ngo-international-ocd-foundation",
		path: "/ngo/international-ocd-foundation",
		href: "https://iocdf.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-international-ocd-foundation.png",
		imageAlt: "International OCD Foundation Logo",
		name: "International OCD Foundation (IOCDF)",
		description:
			"A global donor-supported organization dedicated to helping those with OCD and related disorders.",
	},
	{
		id: "ngo-depression-and-bipolar-support-alliance",
		path: "/ngo/depression-bipolar-support-alliance",
		href: "https://www.dbsalliance.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-depression-and-bipolar-support-alliance.png",
		imageAlt: "DBSA Logo",
		name: "Depression and Bipolar Support Alliance (DBSA)",
		description:
			"A peer-led organization providing support groups and clinical information for mood disorders.",
	},
	{
		id: "ngo-international-bipolar-foundation",
		path: "/ngo/international-bipolar-foundation",
		href: "https://ibpf.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-international-bipolar-foundation.png",
		imageAlt: "International Bipolar Foundation Logo",
		name: "International Bipolar Foundation (IBPF)",
		description:
			"Focuses on global outreach and providing free resources to those living with bipolar disorder.",
	},
	{
		id: "ngo-bipolar-uk",
		path: "/ngo/bipolar-uk",
		href: "https://www.bipolaruk.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-bipolar-uk.png",
		imageAlt: "Bipolar UK Logo",
		name: "Bipolar UK",
		description:
			"A leading UK organization providing information and support for bipolar disorder.",
	},
	{
		id: "ngo-national-eating-disorders-association",
		path: "/ngo/national-eating-disorders-association",
		href: "https://www.nationaleatingdisorders.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-eating-disorders-association.png",
		imageAlt: "NEDA Logo",
		name: "National Eating Disorders Association (NEDA)",
		description:
			"A leading organization providing resources and support for eating disorders.",
	},
]

// SUBSTANCE USE & ADDICTION
const substanceAbuseOrganizations = [
	{
		id: "ngo-alcoholics-anonymous",
		path: "/ngo/alcoholics-anonymous",
		href: "https://www.aa.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-alcoholics-anonymous.png",
		imageAlt: "Alcoholics Anonymous Logo",
		name: "Alcoholics Anonymous (AA)",
		description:
			"The world's largest peer-support organization for alcohol recovery, with millions of members in 180+ countries.",
	},
	{
		id: "ngo-narcotics-anonymous",
		path: "/ngo/narcotics-anonymous",
		href: "https://www.na.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-narcotics-anonymous.png",
		imageAlt: "Narcotics Anonymous Logo",
		name: "Narcotics Anonymous (NA)",
		description:
			"A global fellowship for drug addiction recovery with individuals recovering in 140+ countries.",
	},
	{
		id: "ngo-al-anon",
		path: "/ngo/al-anon",
		href: "https://www.al-anon.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/og/neurorecursion.com/partners/al-anon.png",
		imageAlt: "Al-Anon Logo",
		name: "Al-Anon",
		description:
			"A global peer-support organization for families and friends of alcoholics.",
	},
	{
		id: "ngo-world-federation-against-drugs",
		path: "/ngo/world-federation-against-drugs",
		href: "https://www.wfad.se/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-federation-against-drugs.png",
		imageAlt: "World Federation Against Drugs Logo",
		name: "World Federation Against Drugs (WFAD)",
		description:
			"A multilateral umbrella organization for NGOs working on drug prevention and recovery.",
	},
	{
		id: "ngo-addiction-center",
		path: "/ngo/addiction-center",
		href: "https://www.addictioncenter.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-addiction-center.png",
		imageAlt: "Addiction Center Logo",
		name: "Addiction Center",
		description:
			"A leading resource for substance abuse treatment and recovery information.",
	},
	{
		id: "ngo-find-treatment-samhsa",
		path: "/ngo/find-treatment-samhsa",
		href: "https://findtreatment.gov/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-find-treatment-samhsa.png",
		imageAlt: "Find Treatment Logo",
		name: "Find Treatment - SAMHSA",
		description:
			"A US government resource for finding treatment for substance use and mental health.",
	},
]

// MENTAL HEALTH & CRISIS SUPPORT
const mentalHealthOrganizations = [
	{
		id: "ngo-mind",
		path: "/ngo/mind",
		href: "https://www.mind.org.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-mind.png",
		imageAlt: "Mind Logo",
		name: "Mind (UK Mental Health Charity)",
		description:
			"A leading UK mental health organization providing information, support, and advocacy with international research partnerships.",
	},
	{
		id: "ngo-mental-health-america",
		path: "/ngo/mental-health-america",
		href: "https://www.mhanational.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-mental-health-america.png",
		imageAlt: "Mental Health America Logo",
		name: "Mental Health America (MHA)",
		description:
			"A comprehensive mental health organization providing screening, education, and advocacy across the United States.",
	},
	{
		id: "ngo-mental-health-foundation",
		path: "/ngo/mental-health-foundation",
		href: "https://www.mentalhealth.org.uk/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-mental-health-foundation.png",
		imageAlt: "Mental Health Foundation Logo",
		name: "Mental Health Foundation (Global)",
		description:
			"An international charity advancing mental health research, awareness, and prevention across Europe and beyond.",
	},
	{
		id: "ngo-hope-+-me",
		path: "/ngo/hope-+-me",
		href: "https://www.hopeandme.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-hope-+-me.png",
		imageAlt: "Hope + Me Logo",
		name: "Hope + Me",
		description:
			"Provides accessible mental health support and community resources for those in crisis.",
	},
	{
		id: "ngo-gidget-foundation-australia",
		path: "/ngo/gidget-foundation-australia",
		href: "https://www.gidgetfoundation.org.au/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-gidget-foundation-australia.png",
		imageAlt: "Gidget Foundation Australia Logo",
		name: "Gidget Foundation Australia",
		description:
			"Supporting the mental health of new and expectant parents through evidence-based programs.",
	},
	{
		id: "ngo-psychology-today",
		path: "/ngo/psychology-today",
		href: "https://www.psychologytoday.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-psychology-today.png",
		imageAlt: "Psychology Today Logo",
		name: "Psychology Today",
		description:
			"A leading online resource for mental health information, therapist directory, and wellness articles.",
	},
	{
		id: "ngo-greater-good-science-center",
		path: "/ngo/greater-good-science-center",
		href: "https://greatergood.berkeley.edu/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-greater-good-science-center.png",
		imageAlt: "Greater Good Science Center Logo",
		name: "Greater Good Science Center",
		description:
			"A UC Berkeley center researching happiness, mindfulness, and social connection.",
	},
	{
		id: "ngo-campaign-to-end-loneliness",
		path: "/ngo/campaign-end-loneliness",
		href: "https://www.campaigntoendloneliness.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-campaign-to-end-loneliness.png",
		imageAlt: "Campaign to End Loneliness Logo",
		name: "Campaign to End Loneliness",
		description:
			"A UK coalition organization working to reduce loneliness and social isolation.",
	},
	{
		id: "ngo-national-sleep-foundation",
		path: "/ngo/national-sleep-foundation",
		href: "https://www.thensf.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-sleep-foundation.png",
		imageAlt: "Sleep Foundation Logo",
		name: "National Sleep Foundation",
		description:
			"An organization advancing sleep health education and research.",
	},
	{
		id: "ngo-impostor-syndrome-support",
		path: "/ngo/impostor-syndrome-support",
		href: "https://impostorsyndrome.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-impostor-syndrome-support.png",
		imageAlt: "Impostor Syndrome Logo",
		name: "Impostor Syndrome Support",
		description:
			"Resources and support for understanding and overcoming impostor syndrome.",
	},
	{
		id: "ngo-nami",
		path: "/ngo/nami",
		href: "https://www.nami.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-nami.png",
		imageAlt: "NAMI Logo",
		name: "NAMI (National Alliance on Mental Illness)",
		description:
			"A grassroots mental health organization providing advocacy, education, support, and public awareness for those living with mental illness.",
	},
	{
		id: "ngo-postpartum-support-international",
		path: "/ngo/postpartum-support-international",
		href: "https://www.postpartum.net/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-postpartum-support-international.png",
		imageAlt: "Postpartum Support International Logo",
		name: "Postpartum Support International (PSI)",
		description:
			"A global organization providing support for women experiencing perinatal mood and anxiety disorders.",
	},
]

// TRAUMA, VIOLENCE & CRISIS INTERVENTION
const traumaViolenceOrganizations = [
	{
		id: "ngo-suicide-crisis-lifeline",
		path: "/ngo/suicide-crisis-lifeline",
		href: "https://suicidepreventionlifeline.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-suicide-crisis-lifeline.png",
		imageAlt: "Suicide Prevention Lifeline Logo",
		name: "Suicide & Crisis Lifeline",
		description:
			"The nation's leading 24/7 suicide and crisis prevention organization.",
	},
	{
		id: "ngo-the-trevor-project",
		path: "/ngo/trevor-project",
		href: "https://www.thetrevorproject.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-the-trevor-project.png",
		imageAlt: "The Trevor Project Logo",
		name: "The Trevor Project",
		description:
			"The leading suicide prevention and crisis intervention organization for LGBTQ+ young people.",
	},
	{
		id: "ngo-rainn",
		path: "/ngo/rainn",
		href: "https://rainn.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-rainn.png",
		imageAlt: "RAINN Logo",
		name: "RAINN (Rape, Abuse & Incest National Network)",
		description:
			"The nation's leading anti-sexual violence organization providing support and advocacy.",
	},
	{
		id: "ngo-the-hotline-domestic-violence-support",
		path: "/ngo/hotline-domestic-violence-support",
		href: "https://www.thehotline.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-the-hotline-domestic-violence-support.png",
		imageAlt: "The Hotline Logo",
		name: "The Hotline - Domestic Violence Support",
		description:
			"The nation's leading domestic violence hotline providing 24/7 support.",
	},
	{
		id: "ngo-vawnet",
		path: "/ngo/vawnet",
		href: "https://www.vawnet.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-vawnet.png",
		imageAlt: "VAWnet Logo",
		name: "VAWnet (Violence Against Women Network)",
		description:
			"A resource network providing information on sexual abuse and domestic violence.",
	},
	{
		id: "ngo-national-center-for-trauma-informed-care",
		path: "/ngo/national-center-trauma-informed-care",
		href: "https://www.nctsn.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-center-for-trauma-informed-care.png",
		imageAlt: "NCTSN Logo",
		name: "National Center for Trauma-Informed Care (NCTSN)",
		description:
			"A center advancing trauma-informed approaches in mental health and healthcare systems.",
	},
	{
		id: "ngo-national-center-for-ptsd",
		path: "/ngo/national-center-ptsd",
		href: "https://www.ptsd.va.gov/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-center-for-ptsd.png",
		imageAlt: "PTSD Logo",
		name: "National Center for PTSD (VA)",
		description:
			"A US Veterans Affairs center providing PTSD research and treatment resources.",
	},
	{
		id: "ngo-futures-without-violence",
		path: "/ngo/futures-without-violence",
		href: "https://www.futureswithoutviolence.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-futures-without-violence.png",
		imageAlt: "Futures Without Violence Logo",
		name: "Futures Without Violence",
		description:
			"A global nonprofit organization working to prevent violence and trauma with evidence-based strategies.",
	},
	{
		id: "ngo-gun-violence-archive",
		path: "/ngo/gun-violence-archive",
		href: "https://www.gunviolencearchive.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-gun-violence-archive.png",
		imageAlt: "Gun Violence Archive Logo",
		name: "Gun Violence Archive",
		description:
			"A research organization documenting gun violence incidents and providing accessible data on the human impact of gun violence.",
	},
	{
		id: "ngo-one-love-foundation",
		path: "/ngo/one-love-foundation",
		href: "https://www.joinonelove.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-one-love-foundation.png",
		imageAlt: "One Love Foundation Logo",
		name: "One Love Foundation",
		description:
			"Teaches young people to recognize and prevent unhealthy and abusive relationships.",
	},
]

// HEALTHCARE & MEDICAL RESEARCH
const healthcareOrganizations = [
	{
		id: "ngo-mayo-clinic",
		path: "/ngo/mayo-clinic",
		href: "https://www.mayoclinic.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-mayo-clinic.png",
		imageAlt: "Mayo Clinic Logo",
		name: "Mayo Clinic",
		description:
			"A world-renowned medical center advancing healthcare research and patient care.",
	},
	{
		id: "ngo-american-psychological-association",
		path: "/ngo/american-psychological-association",
		href: "https://www.apa.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-american-psychological-association.png",
		imageAlt: "American Psychological Association Logo",
		name: "American Psychological Association (APA)",
		description:
			"The world's largest professional psychology organization advancing psychological science and practice.",
	},
	{
		id: "ngo-aasect",
		path: "/ngo/aasect",
		href: "https://www.aasect.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-aasect.png",
		imageAlt: "AASECT Logo",
		name: "AASECT (American Association of Sexuality Educators, Counselors and Therapists)",
		description:
			"A global organization advancing sexual health education and professional training.",
	},
	{
		id: "ngo-aamft",
		path: "/ngo/aamft",
		href: "https://www.aamft.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-aamft.png",
		imageAlt: "AAMFT Logo",
		name: "AAMFT (American Association for Marriage and Family Therapy)",
		description:
			"The professional organization for marriage and family therapists advancing treatment and research.",
	},
	{
		id: "ngo-american-academy-of-neurology",
		path: "/ngo/american-academy-neurology",
		href: "https://www.aan.com/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-american-academy-of-neurology.png",
		imageAlt: "American Academy of Neurology Logo",
		name: "American Academy of Neurology (AAN)",
		description:
			"The world's largest professional association of neurologists and neuroscience professionals advancing neurological care and research.",
	},
	{
		id: "ngo-north-american-menopause-society",
		path: "/ngo/north-american-menopause-society",
		href: "https://www.menopause.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-north-american-menopause-society.png",
		imageAlt: "Menopause Logo",
		name: "North American Menopause Society",
		description:
			"An organization providing education and resources on menopause and hormone therapy.",
	},
	{
		id: "ngo-national-institute-on-aging",
		path: "/ngo/national-institute-aging",
		href: "https://www.nia.nih.gov/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-institute-on-aging.png",
		imageAlt: "NIA Logo",
		name: "National Institute on Aging (NIA)",
		description:
			"A US government agency researching aging, dementia, and age-related health conditions.",
	},
	{
		id: "ngo-hospicenet",
		path: "/ngo/hospicenet",
		href: "https://www.hospicenet.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-hospicenet.png",
		imageAlt: "Hospice Net Logo",
		name: "HospiceNet",
		description:
			"An organization providing information and resources about end-of-life care.",
	},
]

// LGBTQ+ & SEXUAL HEALTH
const lgbtqOrganizations = [
	{
		id: "ngo-human-rights-campaign",
		path: "/ngo/human-rights-campaign",
		href: "https://www.hrc.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-human-rights-campaign.png",
		imageAlt: "HRC Logo",
		name: "Human Rights Campaign (HRC)",
		description: "A leading LGBTQ+ civil rights organization.",
	},
]

// CIVIL RIGHTS & HUMANITARIANISM
const humanitarianOrganizations = [
	{
		id: "ngo-naacp",
		path: "/ngo/naacp",
		href: "https://www.naacp.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-naacp.png",
		imageAlt: "NAACP Logo",
		name: "NAACP (National Association for the Advancement of Colored People)",
		description:
			"America's oldest and largest civil rights organization dedicated to racial equality and social justice.",
	},
	{
		id: "ngo-anti-defamation-league",
		path: "/ngo/anti-defamation-league",
		href: "https://www.adl.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-anti-defamation-league.png",
		imageAlt: "ADL Logo",
		name: "Anti-Defamation League (ADL)",
		description:
			"An international organization fighting discrimination and promoting civil rights.",
	},
	{
		id: "ngo-ceasefire-now",
		path: "/ngo/ceasefire-now",
		href: "https://www.ceasefirenow.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-ceasefire-now.png",
		imageAlt: "Ceasefire Now Logo",
		name: "Ceasefire Now",
		description:
			"An international organization advocating for conflict prevention and peace-building initiatives.",
	},
	{
		id: "ngo-helpage-international",
		path: "/ngo/helpage-international",
		href: "https://www.helpage.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-helpage-international.png",
		imageAlt: "HelpAge International Logo",
		name: "HelpAge International",
		description:
			"The leading global organization dedicated to improving the lives of older people in poor countries.",
	},
	{
		id: "ngo-sos-childrens-villages",
		path: "/ngo/sos-childrens-villages",
		href: "https://www.sos-childrensvillages.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-sos-childrens-villages.png",
		imageAlt: "SOS Children's Villages Logo",
		name: "SOS Children's Villages",
		description:
			"A global humanitarian organization supporting vulnerable children and families.",
	},
]

// CHILD & FAMILY DEVELOPMENT
const childFamilyOrganizations = [
	{
		id: "ngo-zero-to-three",
		path: "/ngo/zero-three",
		href: "https://www.zerotothree.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-zero-to-three.png",
		imageAlt: "Zero to Three Logo",
		name: "Zero to Three",
		description:
			"A global organization focused on infant and early childhood development.",
	},
	{
		id: "ngo-ja-worldwide",
		path: "/ngo/ja-worldwide",
		href: "https://www.jaworldwide.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-ja-worldwide.png",
		imageAlt: "JA Worldwide Logo",
		name: "JA Worldwide (Junior Achievement)",
		description:
			"A global social enterprise providing entrepreneurship and financial literacy education to youth.",
	},
	{
		id: "ngo-national-foundation-for-youth-improvement",
		path: "/ngo/national-foundation-youth-improvement",
		href: "https://www.nfyi.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-foundation-for-youth-improvement.png",
		imageAlt: "NFYI Logo",
		name: "National Foundation for Youth Improvement",
		description:
			"An organization supporting youth development and mental health programs.",
	},
	{
		id: "ngo-coda",
		path: "/ngo/coda",
		href: "https://www.coda.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-coda.png",
		imageAlt: "CODA Logo",
		name: "CODA (Children of Deaf Adults)",
		description: "A support organization for children of deaf parents.",
	},
	{
		id: "ngo-national-stepfamily-resource-center",
		path: "/ngo/national-stepfamily-resource-center",
		href: "https://www.stepfamilies.info/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-national-stepfamily-resource-center.png",
		imageAlt: "Stepfamilies Logo",
		name: "National Stepfamily Resource Center",
		description:
			"Resources and research for stepfamilies and blended families.",
	},
	{
		id: "ngo-world-council-for-gifted-and-talented-children",
		path: "/ngo/world-council-gifted-talented-children",
		href: "https://world-gifted.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-world-council-for-gifted-and-talented-children.png",
		imageAlt: "World Council for Gifted and Talented Children Logo",
		name: "World Council for Gifted and Talented Children (WCGTC)",
		description:
			"A worldwide network that supports research and educational policies for gifted individuals.",
	},
]

// SPECIALIZED SUPPORT
const specializedOrganizations = [
	{
		id: "ngo-international-cultic-studies-association",
		path: "/ngo/international-cultic-studies-association",
		href: "https://internationalculticstudies.org/",
		imageSrc:
			"https://cri-cdn.netlify.app/src/neurorecursion.com/partners/ngo-international-cultic-studies-association.png",
		imageAlt: "ICSA Logo",
		name: "International Cultic Studies Association (ICSA)",
		description:
			"A global nonprofit organization advancing education and research on psychological manipulation, undue influence, and coercive control.",
	},
]

// MERGED EXPORT - All organizations organized by category
export const ngos = [
	...globalOrganizations,
	...neurodevelopmentalOrganizations,
	...neurologicalOrganizations,
	...psychiatricOrganizations,
	...substanceAbuseOrganizations,
	...mentalHealthOrganizations,
	...traumaViolenceOrganizations,
	...healthcareOrganizations,
	...lgbtqOrganizations,
	...humanitarianOrganizations,
	...childFamilyOrganizations,
	...specializedOrganizations,
]

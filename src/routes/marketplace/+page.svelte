<script>
	import {tick, onMount} from "svelte"
	let referrer = $state("")
	onMount(() => {
		if (typeof window !== "undefined") {
			referrer =
				localStorage.getItem("original_referrer") ||
				window.__original_referrer ||
				""
		}
	})
	import {
		Share2 as Share2Icon,
		ShoppingCart as CheckoutIcon,
		Check as CheckIcon,
	} from "lucide-svelte"

	import LinkedInIcon from "$lib/LinkedInIcon.svelte"
	import {
		getCurrentFormPath,
		handleLocalFormNavigation,
		saveNetlifySuccessContext,
	} from "$lib/netlifySuccess.js"
	import PageBackground from "$lib/PageBackground.svelte"
	import ShareModal from "$lib/ShareModal.svelte"
	import Speak from "$lib/Speak.svelte"

	let showShareModal = $state(false)
	let highlightedProductId = $state(null)
	let orderError = $state("")
	let orderStatus = $state("idle")
	let highlightResetTimer
	let orderSummaryElement
	let orderSummaryTimer
	let orderSummaryShownAt = 0
	let showOrderSummaryToast = $state(false)
	let isSubmitting = $state(false)
	const successAction = "/success"
	let orderForm = $state({
		name: "",
		email: "",
		phone: "",
		notes: "",
		selected: {},
		quantities: {},
	})

	const priceFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	})

	const roadmap = [
		{
			phase: "1. Relief",
			title: "Interrupt the old limbic loop",
			description:
				"The clinical trial is designed to weaken entrenched fear, shame, compulsion, and stress loops so the nervous system finally has room to do something new.",
		},
		{
			phase: "2. Stabilization",
			title: "Practice until the new response feels real",
			description:
				"Many people get enough freedom from the trial that they can maintain progress for life. Others need repetition, structure, and community so the new pattern becomes automatic.",
		},
		{
			phase: "3. Expansion",
			title: "Catch deeper layers before they rebuild",
			description:
				"Some conditions have multiple layers. Some patients meet new triggers, new seasons of life, or old coping patterns that try to reassemble. Maintenance keeps recovery moving forward instead of backward.",
		},
		{
			phase: "4. Mastery",
			title: "Turn insight into skill",
			description:
				"At this stage you are not just surviving symptoms. You understand the protocol, can use it under pressure, and can recognize when a loop is starting before it fully takes over.",
		},
		{
			phase: "5. Multiplication",
			title: "Help other people recover too",
			description:
				"For many patients, the natural next step is contribution: coaching, studying, joining certification, or sharing the protocol so other people can experience the same breakthrough.",
		},
	]

	const maintenanceOptions = [
		{
			name: "Facilitated Small Group Conversations",
			duration: "Generally 1 hour",
			description:
				"Practice the protocol in live conversation with other people working on related conditions. This is where understanding becomes repetition, repetition becomes confidence, and confidence becomes durability.",
			bestFor:
				"People who want affordable reinforcement, accountability, and the emotional relief of not doing this alone.",
		},
		{
			name: "One-on-One Coaching",
			duration: "Per hour",
			description:
				"A coach helps you reinforce the protocol, identify where the old loop is trying to sneak back in, and connect the work to other useful modalities based on training and expertise.",
			bestFor:
				"People with complex cases, layered histories, or a strong desire for precision and individualized support.",
		},
	]

	const clinicalTrialOptions = [
		{
			name: "NeuroRecursion Clinical Trial",
			duration: "Self-directed protocol",
			description:
				"A free entry point designed to break entrenched limbic loops and create space for sustained recovery.",
		},
	]

	const certificationTrack = [
		{
			name: "Coach Certification Course and Materials",
			description:
				"Build the conceptual foundation: why loops persist, how the protocol interrupts them, how to lead sessions responsibly, and what ethical NeuroRecursion coaching looks like in practice.",
		},
		{
			name: "Coach Certification Study Group",
			description:
				"Practice with peers, compare notes, sharpen your language, and develop real confidence before you test.",
		},
		{
			name: "Coach Certification Practice Exam",
			description:
				"Pressure-test your understanding before the real exam and expose weak spots while the stakes are still low.",
		},
		{
			name: "Coach Certification Exam",
			description:
				"A formal proctored exam for people who want to coach, teach, or represent the work with rigor. Passing this exam earns your initial NeuroRecursion certification and qualifies you to apply for an active coaching license.",
			note: "Initial certification exam",
		},
		{
			name: "Annual Coach License Renewal + Reexamination",
			description:
				"Active coaches renew annually to remain listed, licensed, and in good standing. Renewal includes reexamination so coaches keep demonstrating current knowledge, ethical judgment, and fidelity to the NeuroRecursion method.",
			note: "Required annually for active licensed coaches",
		},
	]

	const patientProfiles = [
		{
			title: "The person who finally feels normal again",
			copy: "The trial may be enough. If your loops are quiet, your stress response is lighter, and your life is opening back up, your job is simple: keep practicing while life is easy, not only when it is hard.",
		},
		{
			title: "The person who improves but still feels unfinished",
			copy: "This is common. Sometimes the first breakthrough reveals the next layer. Maintenance is not failure. It is what serious recovery looks like when the nervous system still has more to unwind.",
		},
		{
			title: "The helper who wants to pay recovery forward",
			copy: "Therapists, coaches, parents, and former patients often move from relief into mission. Certification gives that impulse structure so enthusiasm becomes competence.",
		},
	]

	const faq = [
		{
			question: "Is the clinical trial really enough for some people?",
			answer: "Yes. For some patients, breaking the main loop and practicing the protocol is enough to sustain recovery for years or for life. The degree of permanence depends on the condition, the person's environment, and whether they actually keep using the tool.",
		},
		{
			question:
				"Why would someone need maintenance after a major breakthrough?",
			answer: "Because life keeps happening. New stressors can appear. Old circuits can try to return. Some conditions are layered. Maintenance exists to prevent relapse, deepen skill, and help people stay ahead of the next wave instead of getting buried by it.",
		},
		{
			question: "Who should choose group support versus coaching?",
			answer: "Group support is the best first step for people who want repetition, affordability, and shared momentum. Coaching is better when the case is more personal, more complex, or when progress depends on targeted feedback.",
		},
		{
			question: "Is certification only for professionals?",
			answer: "No. Professionals may be drawn to it, but many parents, former patients, and serious students also want to understand the protocol deeply enough to help other people use it well.",
		},
	]

	const affiliateExample = {
		views: 100000,
		conversionRate: 0.01,
		commissionRate: 0.1,
	}

	const attendees = affiliateExample.views * affiliateExample.conversionRate

	const prices = {
		"NeuroRecursion Clinical Trial": "Free!",
		"Facilitated Small Group Conversations": 99,
		"One-on-One Coaching": 199,
		"Coach Certification Course and Materials": 999,
		"Coach Certification Study Group": "Free!",
		"Coach Certification Practice Exam": 199,
		"Coach Certification Exam": 999,
		"Annual Coach License Renewal + Reexamination": 399,
	}

	const productConfig = {
		"NeuroRecursion Clinical Trial": {
			supportsQuantity: false,
			discountTiers: [],
		},
		"Facilitated Small Group Conversations": {
			supportsQuantity: true,
			unitLabel: (count) => (count === 1 ? "Session" : "Sessions"),
			discountTiers: [
				{threshold: 3, rate: 0.1},
				{threshold: 10, rate: 0.2},
			],
		},
		"One-on-One Coaching": {
			supportsQuantity: true,
			unitLabel: (count) => (count === 1 ? "Hour" : "Hours"),
			discountTiers: [
				{threshold: 3, rate: 0.1},
				{threshold: 10, rate: 0.2},
			],
		},
		"Coach Certification Course and Materials": {
			supportsQuantity: false,
			discountTiers: [],
		},
		"Coach Certification Study Group": {
			supportsQuantity: false,
			discountTiers: [],
		},
		"Coach Certification Practice Exam": {
			supportsQuantity: false,
			discountTiers: [],
		},
		"Coach Certification Exam": {
			supportsQuantity: false,
			discountTiers: [],
		},
		"Annual Coach License Renewal + Reexamination": {
			supportsQuantity: false,
			discountTiers: [],
		},
	}
	const orderGroups = [
		{
			category: "clinical trial",
			products: clinicalTrialOptions,
		},
		{
			category: "personal treatment and support",
			products: maintenanceOptions,
		},
		{
			category: "certification",
			products: certificationTrack,
		},
	]

	const orderCatalog = orderGroups.map((group) => ({
		category: group.category,
		products: group.products.map((product) => {
			const id = `${group.category}-${product.name}`
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "")

			return {
				name: product.name,
				description: product.description,
				duration: product.duration ?? product.note,
				id,
				value: `${group.category}: ${product.name}`,
			}
		}),
	}))
	const affiliateSmallGroupPrice =
		prices["Facilitated Small Group Conversations"]
	const affiliateCoachingPrice = prices["One-on-One Coaching"]

	function toNumberOrZero(value) {
		const numericValue = typeof value === "number" ? value : Number(value)

		return Number.isFinite(numericValue) ? numericValue : 0
	}

	const smallGroupCommission =
		attendees *
		toNumberOrZero(affiliateSmallGroupPrice) *
		affiliateExample.commissionRate
	const coachingCommission =
		attendees *
		toNumberOrZero(affiliateCoachingPrice) *
		affiliateExample.commissionRate

	$effect(() => {
		const selectionSignature = getSelectedProducts()
			.map((product) => product.id)
			.sort()
			.join("|")

		clearTimeout(orderSummaryTimer)

		if (!selectionSignature) {
			showOrderSummaryToast = false
			return
		}

		showOrderSummaryToastForSelection()

		return () => {
			clearTimeout(orderSummaryTimer)
		}
	})

	function handleShare() {
		showShareModal = true
	}

	function reviewOrderForm() {
		const orderFormSection = document.getElementById("order-form")

		orderFormSection?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		})
		dismissOrderSummaryToast()
	}

	function dismissOrderSummaryToast() {
		clearTimeout(orderSummaryTimer)
		showOrderSummaryToast = false
	}

	function showOrderSummaryToastForSelection() {
		orderSummaryShownAt = Date.now()
		showOrderSummaryToast = true
		clearTimeout(orderSummaryTimer)
		orderSummaryTimer = setTimeout(() => {
			showOrderSummaryToast = false
		}, 3000)
	}

	function handleWindowClick(event) {
		if (!showOrderSummaryToast || !orderSummaryElement) {
			return
		}

		if (Date.now() - orderSummaryShownAt < 150) {
			return
		}

		if (!orderSummaryElement.contains(event.target)) {
			dismissOrderSummaryToast()
		}
	}

	function formatPrice(value) {
		const numericValue = typeof value === "number" ? value : Number(value)

		if (!Number.isFinite(numericValue)) {
			return String(value)
		}

		if (numericValue === 0) {
			return "Free"
		}

		return priceFormatter.format(numericValue)
	}

	function getProductByName(name) {
		return orderCatalog
			.flatMap((group) => group.products)
			.find((product) => product.name === name)
	}

	function getProductById(productId) {
		return orderCatalog
			.flatMap((group) => group.products)
			.find((product) => product.id === productId)
	}

	function supportsQuantity(productOrName) {
		const productName =
			typeof productOrName === "string"
				? productOrName
				: productOrName?.name

		return productConfig[productName]?.supportsQuantity ?? false
	}

	function getQuantityUnitLabel(productOrName, count = 2) {
		const productName =
			typeof productOrName === "string"
				? productOrName
				: productOrName?.name

		const config = productConfig[productName]

		if (config?.unitLabel) {
			return config.unitLabel(count)
		}

		return count === 1 ? "Unit" : "Units"
	}

	function getProductQuantity(productId) {
		const product = getProductById(productId)

		if (!product || !supportsQuantity(product)) {
			return 1
		}

		const quantity = Number(orderForm.quantities[productId])
		const isSelected = Boolean(orderForm.selected[productId])

		if (!Number.isFinite(quantity)) {
			return isSelected ? 1 : 0
		}

		if (quantity <= 0) {
			return 0
		}

		return Math.floor(quantity)
	}

	function isProductSelected(name) {
		const product = getProductByName(name)

		return product ? Boolean(orderForm.selected[product.id]) : false
	}

	function toggleProductSelection(productId) {
		const product = getProductById(productId)
		const nextSelected = !orderForm.selected[productId]

		orderForm.selected[productId] = nextSelected

		if (product && supportsQuantity(product)) {
			orderForm.quantities[productId] = nextSelected
				? Math.max(1, getProductQuantity(productId))
				: 0
		}
		orderError = ""
		orderStatus = "idle"
	}

	function setProductQuantity(productId, quantity) {
		const product = getProductById(productId)

		if (!product || !supportsQuantity(product)) {
			return
		}

		const nextQuantity = Math.max(0, Math.floor(quantity))

		orderForm.quantities[productId] = nextQuantity
		orderForm.selected[productId] = nextQuantity > 0
		orderError = ""
		orderStatus = "idle"
	}

	function handleQuantityAdjust(event, productId, delta) {
		event.preventDefault()
		event.stopPropagation()

		setProductQuantity(productId, getProductQuantity(productId) + delta)
		void pulseCheckboxRow(productId)
	}

	function handleProductCheckboxChange(event, product) {
		const isChecked = event.currentTarget.checked

		if (supportsQuantity(product)) {
			setProductQuantity(product.id, isChecked ? 1 : 0)
		} else {
			orderForm.selected[product.id] = isChecked
			orderError = ""
			orderStatus = "idle"
		}

		void pulseCheckboxRow(product.id)
	}

	function toggleProductByName(name) {
		const product = getProductByName(name)

		if (!product) {
			return
		}

		toggleProductSelection(product.id)
		void pulseCheckboxRow(product.id)
	}

	async function pulseCheckboxRow(productId) {
		highlightedProductId = null
		await tick()
		highlightedProductId = productId

		clearTimeout(highlightResetTimer)
		highlightResetTimer = setTimeout(() => {
			highlightedProductId = null
		}, 1400)
	}

	function handleToggleKeydown(event, name) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			toggleProductByName(name)
		}
	}

	function getSelectedProducts() {
		return orderCatalog.flatMap((group) =>
			group.products.filter((product) => orderForm.selected[product.id]),
		)
	}

	function getProductPrice(productOrName) {
		const productName =
			typeof productOrName === "string"
				? productOrName
				: productOrName?.name

		return prices[productName] ?? 0
	}

	function getLineSubtotal(product) {
		return (
			toNumberOrZero(getProductPrice(product)) *
			getProductQuantity(product.id)
		)
	}

	function getQuantityDiscountRate(product) {
		if (!supportsQuantity(product)) {
			return 0
		}

		const config = productConfig[product.name]
		const quantity = getProductQuantity(product.id)

		if (!config?.discountTiers?.length) {
			return 0
		}

		// Find the highest matching tier
		let appliedRate = 0
		for (const tier of config.discountTiers) {
			if (quantity >= tier.threshold) {
				appliedRate = tier.rate
			}
		}

		return appliedRate
	}

	function getQuantityDiscountPercent(product) {
		return Math.round(getQuantityDiscountRate(product) * 100)
	}

	function getNextQuantityDiscount(product) {
		if (!supportsQuantity(product)) {
			return null
		}

		const config = productConfig[product.name]
		if (!config?.discountTiers?.length) {
			return null
		}

		const quantity = getProductQuantity(product.id)

		// Find the next tier not yet achieved
		for (const tier of config.discountTiers) {
			if (quantity < tier.threshold) {
				return {
					remaining: tier.threshold - quantity,
					percent: Math.round(tier.rate * 100),
				}
			}
		}

		return null
	}

	function getLineDiscount(product) {
		const discountRate = getQuantityDiscountRate(product)

		if (discountRate === 0) {
			return 0
		}

		return getLineSubtotal(product) * discountRate
	}

	function getRemainingForQuantityDiscount(product) {
		const nextDiscount = getNextQuantityDiscount(product)

		if (!nextDiscount) {
			return 0
		}

		return nextDiscount.remaining
	}

	function getNextQuantityDiscountPercent(product) {
		return getNextQuantityDiscount(product)?.percent ?? 0
	}

	function shouldEncourageNextQuantityDiscount(product) {
		if (!supportsQuantity(product)) {
			return false
		}

		const config = productConfig[product.name]
		if (!config?.discountTiers?.length || config.discountTiers.length < 2) {
			return false
		}

		const quantity = getProductQuantity(product.id)
		const firstTier = config.discountTiers[0]
		const secondTier = config.discountTiers[1]

		return quantity > firstTier.threshold && quantity < secondTier.threshold
	}

	function getLineTotal(product) {
		return getLineSubtotal(product) - getLineDiscount(product)
	}

	function getQuantityTotalLabel(product) {
		if (supportsQuantity(product) && getProductQuantity(product.id) === 0) {
			return ""
		}

		return formatPrice(getLineTotal(product))
	}

	function getSelectedTotal() {
		return getSelectedProducts().reduce(
			(sum, product) => sum + getLineTotal(product),
			0,
		)
	}

	async function handleOrderSubmit(event) {
		if (isSubmitting) {
			event.preventDefault()
			return
		}

		orderError = ""
		orderStatus = "idle"

		const form = event.currentTarget
		const selectedProducts = getSelectedProducts()

		if (selectedProducts.length === 0) {
			orderError =
				"Select at least one product to submit an order request."
			event.preventDefault()
			return
		}

		if (!form.reportValidity()) {
			event.preventDefault()
			return
		}

		const currentFormPath = getCurrentFormPath()
		const formPathField = form.elements.namedItem("form_path")
		if (formPathField instanceof HTMLInputElement) {
			formPathField.value = currentFormPath
		}

		const selectedProductsSummary = selectedProducts
			.map((product) => {
				if (!supportsQuantity(product)) {
					return product.value
				}

				const quantity = getProductQuantity(product.id)
				const discount = getLineDiscount(product)

				return discount > 0
					? `${product.value} x${quantity} (${getQuantityDiscountPercent(product)}% volume discount applied)`
					: `${product.value} x${quantity}`
			})
			.join(", ")

		const selectedProductsField =
			form.elements.namedItem("selected_products")
		if (selectedProductsField instanceof HTMLInputElement) {
			selectedProductsField.value = selectedProductsSummary
		}

		const estimatedTotalField = form.elements.namedItem("estimated_total")
		if (estimatedTotalField instanceof HTMLInputElement) {
			estimatedTotalField.value = formatPrice(getSelectedTotal())
		}

		saveNetlifySuccessContext({
			form: "marketplace",
			redirectTo: "/marketplace",
		})

		isSubmitting = true

		if (await handleLocalFormNavigation(event, successAction)) {
			return
		}

		// Let the form submit naturally to Netlify Forms
		// No preventDefault - allow browser to handle the POST
	}
</script>

<svelte:window onclick={handleWindowClick} />

<svelte:head>
	<title>The Future of Recovery | Neuro Recursion Institute</title>
	<meta
		name="description"
		content="A practical, compelling roadmap for sustained recovery after the NeuroRecursion clinical trial, including maintenance, coaching, certification, and affiliate pathways."
	/>
</svelte:head>

{#if showShareModal}
	<ShareModal
		title="The Future of Recovery"
		description="See the NeuroRecursion roadmap for sustained recovery, maintenance, certification, and affiliate growth."
		imageUrl="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/children.avif"
		url={typeof window !== "undefined"
			? `${window.location.origin}/future`
			: "/future"}
		onClose={() => (showShareModal = false)}
	/>
{/if}

<PageBackground
	src="https://cri-cdn.netlify.app/src/neurorecursion.com/backgrounds/children.avif"
/>

<section class="future-page page-shell">
	<Speak>
		<div class="paper container page-stack">
			<div class="hero-panel paper container">
				<div class="hero-copy">
					<div class="eyebrow">
						The roadmap after the breakthrough
					</div>
					<h1>
						The future is not just symptom relief. <br />It is
						durable freedom.
					</h1>
					<p class="lead">
						Here is the roadmap to full and sustained recovery:
						break the old limbic loop, create space for a better
						one, then reinforce that new path until it holds under
						real life pressure.
					</p>
					<p>
						The clinical trial is often enough to carry a patient
						for a lifetime. It is free, and if practiced seriously
						it can create lasting relief, sometimes permanent
						relief, depending on the condition and the patient's
						commitment. But sometimes there is more work to do. More
						loops to break. More layers to uncover. More life to
						integrate.
					</p>
					<div class="hero-actions">
						<button
							type="button"
							class="share-trigger"
							onclick={handleShare}
						>
							<Share2Icon size={18} strokeWidth={2} />
							Share this page
						</button>
					</div>
				</div>

				<div class="hero-stats">
					<div
						class="stat-card glow"
						class:selected-card={isProductSelected(
							"NeuroRecursion Clinical Trial",
						)}
						role="button"
						tabindex="0"
						onclick={() =>
							toggleProductByName(
								"NeuroRecursion Clinical Trial",
							)}
						onkeydown={(event) =>
							handleToggleKeydown(
								event,
								"NeuroRecursion Clinical Trial",
							)}
					>
						<div class="stat-label">
							<span
								class="selection-checkbox"
								class:is-checked={isProductSelected(
									"NeuroRecursion Clinical Trial",
								)}
								aria-hidden="true"
							></span>
							<span>Clinical trial</span>
						</div>
						<div class="stat-value">
							{formatPrice(
								prices["NeuroRecursion Clinical Trial"],
							)}
						</div>
						<p>
							Built to dismantle entrenched loops and create real
							breathing room.
						</p>
					</div>
					<div
						class="stat-card"
						class:selected-card={isProductSelected(
							"Facilitated Small Group Conversations",
						)}
						role="button"
						tabindex="0"
						onclick={() =>
							toggleProductByName(
								"Facilitated Small Group Conversations",
							)}
						onkeydown={(event) =>
							handleToggleKeydown(
								event,
								"Facilitated Small Group Conversations",
							)}
					>
						<div class="stat-label">
							<span
								class="selection-checkbox"
								class:is-checked={isProductSelected(
									"Facilitated Small Group Conversations",
								)}
								aria-hidden="true"
							></span>
							<span>Small group practice</span>
						</div>
						<div class="stat-value">
							{formatPrice(
								prices["Facilitated Small Group Conversations"],
							)}
						</div>
						<p>
							Live reinforcement with other people doing the work
							beside you.
						</p>
					</div>
					<div
						class="stat-card"
						class:selected-card={isProductSelected(
							"One-on-One Coaching",
						)}
						role="button"
						tabindex="0"
						onclick={() =>
							toggleProductByName("One-on-One Coaching")}
						onkeydown={(event) =>
							handleToggleKeydown(event, "One-on-One Coaching")}
					>
						<div class="stat-label">
							<span
								class="selection-checkbox"
								class:is-checked={isProductSelected(
									"One-on-One Coaching",
								)}
								aria-hidden="true"
							></span>
							<span>1:1 coaching</span>
						</div>
						<div class="stat-value">
							{formatPrice(prices["One-on-One Coaching"])} /hr
						</div>
						<p>
							Targeted support for complex cases, stubborn loops,
							and precision.
						</p>
					</div>
				</div>
			</div>

			<div class="section-shell">
				<h2>What happens after the first major win?</h2>
				<p>
					A major breakthrough can feel almost strange at first. The
					panic is quieter. The compulsion is less convincing. The
					shame story is weaker. The body is no longer yelling the
					same emergency every day. But this is also when patients
					discover a hard truth: healing is not only about getting
					unstuck once. It is also about becoming the kind of person
					who knows how not to get captured again.
				</p>
				<p>
					That is why the future matters. The future is where
					repetition turns a breakthrough into a baseline. It is where
					patients stop measuring life by how bad it used to be and
					start measuring it by what they can build now. Better
					relationships. Better sleep. Better focus. Better choices.
					More agency. More calm. More range.
				</p>
				<p>
					And for some people, the future becomes bigger than
					maintenance. It becomes vocation. They do not just want to
					stay well. They want to help other people get free too.
				</p>
			</div>

			<div class="section-shell roadmap-shell">
				<h2>The recovery roadmap</h2>
				<div class="roadmap-grid">
					{#each roadmap as item}
						<article class="roadmap-card">
							<div class="roadmap-phase">{item.phase}</div>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</article>
					{/each}
				</div>
			</div>

			<div class="section-shell" id="maintenance">
				<h2>Maintenance that keeps recovery alive</h2>
				<p>
					If old loops were built through repetition, new ones are
					strengthened the same way. Maintenance is not a consolation
					prize. It is a deliberate strategy for making recovery more
					stable, more flexible, and more difficult to reverse.
				</p>
				<div class="offer-grid">
					{#each maintenanceOptions as option}
						<div
							class="offer-card spotlight"
							class:selected-card={isProductSelected(option.name)}
							role="button"
							tabindex="0"
							onclick={() => toggleProductByName(option.name)}
							onkeydown={(event) =>
								handleToggleKeydown(event, option.name)}
						>
							<div class="offer-topline">
								<div class="card-title">
									<span
										class="selection-checkbox"
										class:is-checked={isProductSelected(
											option.name,
										)}
										aria-hidden="true"
									></span>
									<h3>{option.name}</h3>
								</div>
								<div class="price-pill">
									{formatPrice(getProductPrice(option.name))}
								</div>
							</div>
							<div class="offer-duration">{option.duration}</div>
							<p>{option.description}</p>
							<div class="offer-footer">
								<strong>Best for:</strong>
								{option.bestFor}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="section-shell profile-shell">
				<h2>Three futures patients often discover</h2>
				<div class="profile-grid">
					{#each patientProfiles as profile}
						<article class="profile-card">
							<h3>{profile.title}</h3>
							<p>{profile.copy}</p>
						</article>
					{/each}
				</div>
			</div>

			<div class="section-shell" id="certification">
				<h2>When recovery turns into mission</h2>
				<p>
					Therapists, coaches, parents, and many patients eventually
					arrive at the same thought: "I want to help cure others
					too." That impulse makes sense. Once you have felt the
					reality of a nervous system changing, it becomes hard not to
					want that for somebody else.
				</p>
				<p>
					The certification path exists for that reason. It turns
					enthusiasm into study, study into discipline, and discipline
					into a standard you can be proud of.
				</p>
				<div class="certification-stack">
					{#each certificationTrack as step, index}
						<div
							class="cert-card"
							class:selected-card={isProductSelected(step.name)}
							role="button"
							tabindex="0"
							onclick={() => toggleProductByName(step.name)}
							onkeydown={(event) =>
								handleToggleKeydown(event, step.name)}
						>
							<div
								class="cert-number"
								class:cert-number-selected={isProductSelected(
									step.name,
								)}
							>
								<span
									class="cert-number-value"
									class:cert-number-value-hidden={isProductSelected(
										step.name,
									)}
									aria-hidden={isProductSelected(step.name)}
								>
									0{index + 1}
								</span>
								<span
									class="cert-number-check"
									class:cert-number-check-visible={isProductSelected(
										step.name,
									)}
									aria-hidden={!isProductSelected(step.name)}
									>&check;</span
								>
							</div>
							<div class="cert-copy">
								<div class="offer-topline">
									<div class="card-title">
										<h3>{step.name}</h3>
									</div>
									<div class="price-pill">
										{formatPrice(
											getProductPrice(step.name),
										)}
									</div>
								</div>
								<p>{step.description}</p>
								{#if step.note}
									<div class="cert-note">{step.note}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="section-shell affiliate-shell">
				<h2>
					Love talking about your breakthrough? There is a path for
					that too.
				</h2>
				<p>
					If your transformation is real, people notice. They ask what
					changed. They ask what worked. They watch how you carry
					yourself. For some people, that becomes a natural bridge
					into affiliate marketing.
				</p>
				<p>
					Affiliate commission is 10% of future purchases by your
					referred customer. That means your own story can become both
					testimony and traction. The upside is not imaginary, but it
					is also not automatic. It depends on trust, attention,
					message quality, and whether the people you reach are
					genuinely ready.
				</p>
				<div class="example-card">
					<h3>Illustrative scenario</h3>
					<p>
						Suppose a social campaign gets {affiliateExample.views.toLocaleString()}
						views, and 1% of those viewers attend one small group session.
					</p>
					<div class="example-math">
						<div>
							<span>Attendees</span>
							<strong>{attendees.toLocaleString()}</strong>
						</div>
						<div>
							<span>
								10% commission on one {formatPrice(
									affiliateSmallGroupPrice,
								)} small group
							</span>
							<strong>{formatPrice(smallGroupCommission)}</strong>
						</div>
						<div>
							<span
								>10% commission if each also books one {formatPrice(
									affiliateCoachingPrice,
								)} coaching hour</span
							>
							<strong>{formatPrice(coachingCommission)}</strong>
						</div>
					</div>
					<p class="fine-print">
						These numbers are illustrative, not a promise. They show
						the mechanics, not a guaranteed outcome. Real
						performance depends on audience quality, platform, offer
						fit, and follow-through.
					</p>
				</div>
			</div>

			<div class="section-shell faq-shell">
				<h2>Questions people usually ask next</h2>
				<div class="faq-list">
					{#each faq as item}
						<article class="faq-card">
							<h3>{item.question}</h3>
							<p>{item.answer}</p>
						</article>
					{/each}
				</div>
			</div>

			<div class="section-shell closing-shell">
				<div class="closing-copy">
					<h2>
						Recovery is the beginning. The future is what you do
						with it.
					</h2>
					<p>
						The goal is not endless management. The goal is
						increasing freedom, increasing capability, and
						increasing contribution. Maybe you will take one small
						group session every so often. Maybe you will work with a
						coach until the next layer breaks open. Maybe you will
						study, certify, and teach. Maybe your recovery story
						will quietly change a family, a friend, or a stranger on
						the internet.
					</p>
					<p>
						Whatever form it takes, the future is not passive. It is
						practiced. Built. Protected. Shared.
					</p>
				</div>
				<div class="closing-actions">
					<a href="/#signup" class="primary-link">Start the trial</a>
					<a href="#certification" class="secondary-link"
						>Explore certification</a
					>
					<a
						href="https://www.linkedin.com/company/neurorecursion"
						target="_blank"
						rel="noopener"
						class="social-inline"
					>
						<LinkedInIcon />
						NeuroRecursion
					</a>
				</div>
			</div>

			<div class="section-shell order-shell" id="order-form">
				<div class="order-intro">
					<h2>Build your order request</h2>
					<p>
						Choose any products you want more information about or
						are ready to purchase. Submit the form and
						NeuroRecursion can follow up with the right next step,
						scheduling details, and purchase guidance.
					</p>
				</div>

				<form
					name="future-order-request"
					method="POST"
					action={successAction}
					netlify-honeypot="bot-field"
					netlify
					onsubmit={handleOrderSubmit}
					class="order-form"
					class:is-submitting={isSubmitting}
					aria-busy={isSubmitting}
				>
					<input
						type="hidden"
						name="form-name"
						value="future-order-request"
					/>
					<input type="hidden" name="form_path" value="" />
					<input type="hidden" name="selected_products" value="" />
					<input type="hidden" name="estimated_total" value="" />
					{#if typeof window !== "undefined"}
						<input
							type="hidden"
							name="original_referrer"
							value={referrer}
						/>
					{/if}

					<div class="hidden-field" aria-hidden="true">
						<label for="bot-field-future-order">
							Do not fill this out if you are human
							<input
								id="bot-field-future-order"
								type="text"
								name="bot-field"
							/>
						</label>
					</div>

					<div class="order-grid">
						<div class="order-fields">
							<div class="form-grid">
								<label class="field">
									<span>Name</span>
									<input
										type="text"
										name="name"
										bind:value={orderForm.name}
										required
										placeholder="Your full name"
									/>
								</label>

								<label class="field">
									<span>Email</span>
									<input
										type="email"
										name="email"
										bind:value={orderForm.email}
										required
										placeholder="you@example.com"
									/>
								</label>

								<label class="field field-full">
									<span>Phone</span>
									<input
										type="tel"
										name="phone"
										bind:value={orderForm.phone}
										placeholder="Optional phone number"
									/>
								</label>
							</div>

							<div class="catalog-stack">
								{#each orderCatalog as group}
									<fieldset class="catalog-group">
										<legend>{group.category}</legend>
										<div class="checkbox-list">
											{#each group.products as product}
												<label
													class="checkbox-card"
													class:highlighted-checkbox={highlightedProductId ===
														product.id}
													for={product.id}
												>
													<input
														id={product.id}
														type="checkbox"
														value={product.value}
														disabled={getProductQuantity(
															product.id,
														) > 1}
														checked={Boolean(
															orderForm.selected[
																product.id
															],
														)}
														onchange={(event) =>
															handleProductCheckboxChange(
																event,
																product,
															)}
													/>
													<div class="checkbox-copy">
														<div
															class="checkbox-topline"
														>
															<strong
																>{product.name}</strong
															>
															<span
																>{formatPrice(
																	getProductPrice(
																		product,
																	),
																)}</span
															>
														</div>
														<p>
															{product.description}
														</p>
														{#if product.duration}
															<div
																class="checkbox-duration"
															>
																Duration: {product.duration}
															</div>
														{/if}
														{#if supportsQuantity(product)}
															<div
																class="quantity-controls"
															>
																<div
																	class="fixed-to-top"
																>
																	<span
																		class="quantity-label"
																		>{getQuantityUnitLabel(
																			product,
																			getProductQuantity(
																				product.id,
																			) ||
																				2,
																		)}</span
																	>
																	<div
																		class="quantity-stepper"
																	>
																		<button
																			type="button"
																			class="quantity-btn"
																			disabled={getProductQuantity(
																				product.id,
																			) ===
																				0}
																			onclick={(
																				event,
																			) =>
																				handleQuantityAdjust(
																					event,
																					product.id,
																					-1,
																				)}
																			aria-label={`Decrease quantity for ${product.name}`}
																		>
																			-
																		</button>
																		<span
																			class="quantity-value"
																			>{getProductQuantity(
																				product.id,
																			)}</span
																		>
																		<button
																			type="button"
																			class="quantity-btn"
																			onclick={(
																				event,
																			) =>
																				handleQuantityAdjust(
																					event,
																					product.id,
																					1,
																				)}
																			aria-label={`Increase quantity for ${product.name}`}
																		>
																			+
																		</button>
																	</div>
																</div>
																<div
																	class="quantity-pricing"
																>
																	<span
																		class="quantity-total"
																		>{getQuantityTotalLabel(
																			product,
																		)}</span
																	>
																	{#if getLineDiscount(product) > 0}
																		<span
																			class="quantity-discount"
																			>{getQuantityDiscountPercent(
																				product,
																			)}%
																			off
																			applied
																			for {getProductQuantity(
																				product.id,
																			)}
																			{getQuantityUnitLabel(
																				product,
																				getProductQuantity(
																					product.id,
																				),
																			)}</span
																		>
																		{#if shouldEncourageNextQuantityDiscount(product)}
																			<span
																				class="quantity-notice"
																				>Order
																				{getRemainingForQuantityDiscount(
																					product,
																				)}
																				more
																				to
																				get
																				{getNextQuantityDiscountPercent(
																					product,
																				)}%
																				off!</span
																			>
																		{/if}
																	{:else if getProductQuantity(product.id) > 0}
																		<span
																			class="quantity-notice"
																			>Order
																			{getRemainingForQuantityDiscount(
																				product,
																			)}
																			more
																			to get
																			{getNextQuantityDiscountPercent(
																				product,
																			)}%
																			off!</span
																		>
																	{/if}
																</div>
															</div>
														{/if}
													</div>
												</label>
											{/each}
										</div>
									</fieldset>
								{/each}
							</div>

							<label class="field field-full">
								<span>Notes</span>
								<textarea
									name="notes"
									bind:value={orderForm.notes}
									rows="5"
									placeholder="Tell us what you are interested in, your timeline, or any questions you want answered first."
								></textarea>
							</label>

							{#if orderError}
								<div class="order-message error">
									{orderError}
								</div>
							{/if}

							{#if orderStatus === "success"}
								<div class="order-message success">
									Your order request has been sent. We will
									follow up with next steps.
								</div>
							{/if}

							<div
								class="submit-progress"
								class:is-visible={isSubmitting}
							>
								<div class="submit-progress-bar"></div>
							</div>

							<button
								type="submit"
								class="submit-order-btn"
								disabled={isSubmitting}
							>
								<CheckIcon size={18} strokeWidth={2} />
								<span
									>{isSubmitting
										? "Submitting..."
										: "Submit"}</span
								>
							</button>
						</div>
					</div>

					<aside
						class="order-summary"
						class:toast-visible={showOrderSummaryToast}
						aria-live="polite"
						bind:this={orderSummaryElement}
					>
						<div class="summary-header">
							<button
								type="button"
								class="summary-cta"
								onclick={reviewOrderForm}
							>
								<CheckoutIcon size={16} strokeWidth={2} />
								<span>Checkout</span>
							</button>

							<button
								type="button"
								class="summary-close"
								aria-label="Close selected products summary"
								onclick={dismissOrderSummaryToast}
							>
								<span
									class="summary-close-glyph"
									aria-hidden="true">&times;</span
								>
							</button>
						</div>

						<p class="summary-copy">
							Review the full order form to confirm your
							selections and next steps.
						</p>

						<ul class="summary-list">
							{#if getSelectedProducts().length > 0}
								{#each getSelectedProducts() as product}
									<li>
										<span>
											{product.name}
											{#if supportsQuantity(product)}
												<span class="summary-quantity"
													>x{getProductQuantity(
														product.id,
													)}</span
												>
											{/if}
											{#if getLineDiscount(product) > 0}
												<span
													class="summary-line-discount"
													>{getQuantityDiscountPercent(
														product,
													)}% off</span
												>
											{/if}
										</span>
										<strong
											>{formatPrice(
												getLineTotal(product),
											)}</strong
										>
									</li>
								{/each}
								<div class="summary-total">
									<span>Estimated total</span>
									<strong
										>{formatPrice(
											getSelectedTotal(),
										)}</strong
									>
								</div>
							{:else}
								<li class="summary-empty">
									No products selected yet.
								</li>
							{/if}
						</ul>
					</aside>
				</form>
			</div>
		</div>
	</Speak>
</section>

<style>
	h1 {
		font-size: clamp(2.2rem, 4vw, 4.25rem);
		line-height: 1.05;
		margin: 0 0 1rem;
		color: #f5fbff;
		max-width: 12ch;
	}

	h2 {
		color: #4a9fd8;
		font-size: clamp(1.5rem, 2vw, 2.1rem);
		margin: 0 0 1rem;
	}

	h3 {
		margin: 0;
		color: #eaf7ff;
		font-size: 1.1rem;
	}

	button,
	a {
		user-select: none;
	}

	p {
		color: #d5deea;
		line-height: 1.75;
	}

	.lead {
		font-size: 1.15rem;
		color: #eff8ff;
		max-width: 60ch;
	}

	.stat-card {
		cursor: pointer;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			border-color 0.25s ease,
			background 0.25s ease;
	}

	.offer-card::before,
	.cert-card::before {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgb(var(--accent-bright-rgb) / 0.08),
			transparent 45%,
			rgb(var(--accent-rgb) / 0.06)
		);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.22s ease;
	}

	.offer-card::after,
	.cert-card::after {
		content: "";
		position: absolute;
		inset: 0;
		border-radius: inherit;
		box-shadow: inset 0 0 0 1px rgb(var(--accent-bright-rgb) / 0.18);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.22s ease;
	}

	.offer-card:hover,
	.cert-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 32px rgba(4, 12, 28, 0.28);
		border-color: rgb(var(--accent-bright-rgb) / 0.24);
	}

	.offer-card:hover::before,
	.offer-card:hover::after,
	.cert-card:hover::before,
	.cert-card:hover::after,
	.offer-card:focus-visible::before,
	.offer-card:focus-visible::after,
	.cert-card:focus-visible::before,
	.cert-card:focus-visible::after {
		opacity: 1;
	}

	.offer-card:focus-visible,
	.cert-card:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.2);
		border-color: rgb(var(--accent-bright-rgb) / 0.4);
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		color: #f5fbff;
		margin: 0.3rem 0 0.5rem;
	}

	.roadmap-grid,
	.offer-grid,
	.profile-grid,
	.faq-list {
		display: grid;
		gap: 1rem;
	}

	.roadmap-grid {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}

	.offer-grid,
	.profile-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.roadmap-card,
	.offer-card,
	.profile-card,
	.faq-card,
	.example-card,
	.cert-card {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.15rem;
		user-select: none;
	}

	.offer-card,
	.cert-card {
		cursor: pointer;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			border-color 0.25s ease,
			background 0.25s ease;
	}

	.selected-card {
		border-color: rgb(var(--accent-bright-rgb) / 0.62);
		box-shadow:
			0 0 0 1px rgb(var(--accent-bright-rgb) / 0.2),
			0 18px 36px rgba(13, 37, 71, 0.34);
		background: linear-gradient(
			180deg,
			rgb(var(--accent-rgb) / 0.18),
			rgba(255, 255, 255, 0.05)
		);
	}

	.selected-card::before,
	.selected-card::after {
		opacity: 1;
	}

	.selected-card::after {
		box-shadow:
			inset 0 0 0 1px rgb(var(--accent-bright-rgb) / 0.28),
			inset 0 42px 60px rgb(var(--accent-bright-rgb) / 0.04);
	}

	.selection-checkbox {
		width: 1rem;
		height: 1rem;
		border-radius: 0.22rem;
		border: 1.5px solid rgba(159, 220, 255, 0.75);
		background: rgba(255, 255, 255, 0.03);
		position: relative;
		flex-shrink: 0;
		align-self: center;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.selection-checkbox::after {
		content: "";
		position: absolute;
		left: 0.27rem;
		top: 0.08rem;
		width: 0.28rem;
		height: 0.52rem;
		border-right: 2px solid #07111d;
		border-bottom: 2px solid #07111d;
		transform: rotate(45deg) scale(0);
		transform-origin: center;
		transition: transform 0.18s ease;
	}

	.selection-checkbox.is-checked {
		background: linear-gradient(
			135deg,
			var(--accent-bright),
			var(--accent-500)
		);
		border-color: rgb(var(--accent-bright-rgb) / 0.95);
		box-shadow: 0 0 0 3px rgb(var(--accent-rgb) / 0.14);
	}

	.selection-checkbox.is-checked::after {
		transform: rotate(45deg) scale(1);
	}

	.selected-card .stat-label,
	.selected-card .card-title h3,
	.selected-card .offer-duration,
	.selected-card .offer-footer,
	.selected-card .cert-note {
		color: #c8ecff;
	}

	.card-title {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.card-title h3 {
		margin: 0;
		line-height: 1.15;
	}

	.roadmap-phase {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #7fdcff;
		margin-bottom: 0.65rem;
	}

	.offer-topline {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.price-pill {
		flex-shrink: 0;
		padding: 0.45rem 0.75rem;
		border-radius: 999px;
		background: rgb(var(--accent-bright-rgb) / 0.14);
		border: 1px solid rgb(var(--accent-bright-rgb) / 0.25);
		color: #e9fbff;
		font-weight: 700;
	}

	.offer-duration,
	.offer-footer,
	.cert-note,
	.fine-print {
		color: var(--accent-muted-alt);
		font-size: 0.95rem;
	}

	.spotlight {
		background: linear-gradient(
			180deg,
			rgb(var(--accent-rgb) / 0.14),
			rgba(255, 255, 255, 0.04)
		);
	}

	.certification-stack {
		display: grid;
		gap: 1rem;
	}

	.cert-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		align-items: start;
	}

	.cert-number {
		width: 3rem;
		height: 3rem;
		display: grid;
		place-items: center;
		position: relative;
		border-radius: 50%;
		background: linear-gradient(
			135deg,
			var(--accent-500),
			var(--accent-bright)
		);
		color: #07111d;
		font-weight: 800;
		font-size: 1rem;
		line-height: 1;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			background 0.25s ease,
			color 0.25s ease;
	}

	.cert-number-value,
	.cert-number-check {
		position: absolute;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		transition:
			opacity 0.22s ease,
			transform 0.22s ease;
	}

	.cert-number-value {
		opacity: 1;
		transform: scale(1);
	}

	.cert-number-value-hidden {
		opacity: 0;
		transform: scale(0.55);
	}

	.cert-number-selected {
		background: linear-gradient(135deg, #a8f1ff, #66d6ff);
		box-shadow:
			0 0 0 4px rgb(var(--accent-bright-rgb) / 0.16),
			0 12px 28px rgba(10, 31, 58, 0.24);
		transform: scale(1.04);
	}

	.cert-number-check {
		font-size: 1.9rem;
		font-weight: 800;
		opacity: 0;
		transform: scale(0.45) rotate(-12deg);
	}

	.cert-number-check-visible {
		opacity: 1;
		transform: scale(1) rotate(0deg);
	}

	.example-card {
		margin-top: 1rem;
	}

	.example-math {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin: 1rem 0;
	}

	.example-math div {
		padding: 1rem;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.1);
	}

	.example-math span {
		display: block;
		color: var(--accent-muted-alt);
		font-size: 0.88rem;
		margin-bottom: 0.4rem;
	}

	.example-math strong {
		font-size: 1.6rem;
		color: #f6fbff;
	}

	.order-shell {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.order-intro {
		max-width: 62ch;
	}

	.order-form {
		display: block;
	}

	.order-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	.order-form.is-submitting {
		pointer-events: none;
		opacity: 0.8;
	}

	.order-fields,
	.order-summary {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 20px;
		padding: 1.15rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.9rem;
		margin-bottom: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.field-full {
		grid-column: 1 / -1;
	}

	.field span,
	.catalog-group legend {
		color: #a9d3ec;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.03em;
	}

	.field input,
	.field textarea {
		width: 100%;
		padding: 0.9rem 1rem;
		border-radius: 14px;
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.18);
		background: rgba(7, 17, 29, 0.55);
		color: #eff8ff;
		font: inherit;
	}

	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: rgb(var(--accent-bright-rgb) / 0.55);
		box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.12);
	}

	.field textarea {
		resize: vertical;
		min-height: 120px;
	}

	.catalog-stack {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.catalog-group {
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-radius: 18px;
		padding: 1rem;
	}

	.catalog-group legend {
		padding: 0 0.4rem;
		text-transform: capitalize;
	}

	.checkbox-list {
		display: grid;
		gap: 0.75rem;
	}

	.checkbox-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.85rem;
		padding: 0.95rem;
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.1);
		cursor: pointer;
		user-select: none;
		transition:
			transform 0.25s ease,
			border-color 0.25s ease,
			box-shadow 0.25s ease,
			background 0.25s ease;
	}

	.highlighted-checkbox {
		border-color: rgb(var(--accent-bright-rgb) / 0.72);
		background: rgb(var(--accent-rgb) / 0.14);
		box-shadow:
			0 0 0 1px rgb(var(--accent-bright-rgb) / 0.22),
			0 0 0 10px rgb(var(--accent-rgb) / 0.08);
		animation: checkboxPulse 0.9s ease;
	}

	@keyframes checkboxPulse {
		0% {
			transform: scale(0.985);
			box-shadow:
				0 0 0 0 rgb(var(--accent-bright-rgb) / 0.28),
				0 0 0 0 rgb(var(--accent-rgb) / 0.18);
		}

		45% {
			transform: scale(1.01);
			box-shadow:
				0 0 0 1px rgb(var(--accent-bright-rgb) / 0.25),
				0 0 0 14px rgb(var(--accent-rgb) / 0.12);
		}

		100% {
			transform: scale(1);
			box-shadow:
				0 0 0 1px rgb(var(--accent-bright-rgb) / 0.22),
				0 0 0 10px rgb(var(--accent-rgb) / 0.08);
		}
	}

	.checkbox-card input {
		margin-top: 0.25rem;
		width: 18px;
		height: 18px;
		accent-color: var(--accent-bright);
	}

	.checkbox-copy {
		position: relative;
	}

	.checkbox-copy p {
		margin: 0.35rem 0 0;
		font-size: 0.95rem;
	}

	.checkbox-topline {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
	}

	.checkbox-topline span,
	.checkbox-duration {
		color: var(--accent-muted-alt);
		font-size: 0.9rem;
	}

	.quantity-controls {
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 0.75rem;
		margin-top: 0.9rem;
		padding-top: 0.85rem;
		border-top: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		position: sticky;
		top: 0;
	}

	.fixed-to-top {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		flex-shrink: 0;
	}

	.quantity-label,
	.summary-quantity {
		color: var(--accent-muted-alt);
		font-size: 0.9rem;
	}

	.quantity-total {
		color: #ffffff;
		font-size: 1.08rem;
		font-weight: 600;
	}

	.quantity-pricing {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
		margin-left: auto;
	}

	.quantity-discount,
	.summary-line-discount {
		color: #9ff8c2;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.quantity-notice {
		color: #ffd98a;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.quantity-stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.quantity-btn {
		width: 2rem;
		height: 2rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		border: 1px solid rgb(var(--accent-bright-rgb) / 0.24);
		background: rgba(255, 255, 255, 0.05);
		color: #eff8ff;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.quantity-btn:hover {
		background: rgb(var(--accent-bright-rgb) / 0.14);
		border-color: rgb(var(--accent-bright-rgb) / 0.36);
		transform: translateY(-1px);
	}

	.quantity-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.18);
	}

	.quantity-value {
		min-width: 1.5rem;
		text-align: center;
		font-weight: 700;
		color: #eff8ff;
	}

	.summary-quantity {
		display: inline-flex;
		margin-left: 0.35rem;
	}

	.summary-line-discount {
		display: inline-flex;
		margin-left: 0.45rem;
	}

	.submit-order-btn {
		margin-top: 1rem;
		width: fit-content;
		padding: 0.9rem 1.15rem;
		border-radius: 999px;
		background: linear-gradient(
			135deg,
			var(--accent-500),
			var(--accent-bright)
		);
		color: #07111d;
		font-weight: 800;
	}

	.submit-order-btn:disabled {
		cursor: wait;
		box-shadow: none;
		transform: none;
		filter: saturate(0.8);
	}

	.submit-progress {
		overflow: hidden;
		height: 0;
		margin: 0;
		border-radius: 999px;
		background: rgba(74, 159, 216, 0.12);
		border: 1px solid rgba(74, 159, 216, 0.22);
		opacity: 0;
		transition:
			height 0.2s ease,
			margin 0.2s ease,
			opacity 0.2s ease;
	}

	.submit-progress.is-visible {
		height: 0.5rem;
		margin: 1rem 0 0.85rem;
		opacity: 1;
	}

	.submit-progress-bar {
		width: 40%;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(
			90deg,
			var(--accent-500),
			var(--accent-bright)
		);
		animation: submitProgress 1.1s ease-in-out infinite;
	}

	.order-message {
		margin-top: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: 14px;
		font-weight: 600;
	}

	.order-message.error {
		background: rgba(182, 54, 79, 0.18);
		border: 1px solid rgba(255, 129, 153, 0.28);
		color: #ffd5df;
	}

	.order-message.success {
		background: rgba(55, 132, 99, 0.2);
		border: 1px solid rgba(122, 237, 186, 0.25);
		color: #dbfff0;
	}

	.order-summary {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		width: min(360px, calc(100vw - 2rem));
		height: fit-content;
		z-index: 40;
		opacity: 0;
		transform: translateY(1rem) scale(0.98);
		pointer-events: none;
		box-shadow: 0 24px 60px rgba(3, 9, 23, 0.45);
		backdrop-filter: blur(18px);
		transition:
			opacity 0.24s ease,
			transform 0.24s ease;
	}

	@keyframes submitProgress {
		0% {
			transform: translateX(-115%);
		}

		100% {
			transform: translateX(260%);
		}
	}

	.order-summary.toast-visible {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
	}

	.summary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.summary-copy {
		max-width: 28ch;
		margin: 0 0 0.9rem;
		color: var(--accent-muted-alt);
		line-height: 1.6;
	}

	.summary-close {
		width: 2.8rem;
		height: 2.8rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		border: 1px solid rgb(var(--accent-soft-rgb) / 0.18);
		background: rgba(255, 255, 255, 0.05);
		color: #eff8ff;
		font-size: 1.15rem;
		line-height: 1;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.summary-close:hover {
		background: rgb(var(--accent-bright-rgb) / 0.14);
		border-color: rgb(var(--accent-bright-rgb) / 0.28);
		transform: scale(1.04);
	}

	.summary-close:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.18);
		border-color: rgb(var(--accent-bright-rgb) / 0.42);
	}

	.summary-close-glyph {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		transform: translateY(-0.03rem);
	}

	.summary-total {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
		padding: 0.9rem 0;
		margin: 1rem 0;
		border-top: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
		border-bottom: 1px solid rgb(var(--accent-soft-rgb) / 0.12);
	}

	.summary-total span,
	.summary-list,
	.summary-empty {
		color: var(--accent-muted-alt);
	}

	.summary-total strong {
		font-size: 1.4rem;
		color: #f6fbff;
	}

	.summary-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		width: fit-content;
		min-height: 2.8rem;
		padding: 0 1rem;
		border-radius: 999px;
		background: rgb(var(--accent-bright-rgb) / 0.14);
		border: 1px solid rgb(var(--accent-bright-rgb) / 0.25);
		color: #effbff;
		font: inherit;
		font-weight: 700;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.25s ease;
	}

	.summary-cta:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 24px rgb(var(--accent-rgb) / 0.18);
	}

	.summary-cta:focus-visible {
		outline: none;
		box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.18);
		border-color: rgb(var(--accent-bright-rgb) / 0.42);
	}

	.summary-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.7rem;
	}

	.summary-list li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
	}

	.summary-list strong {
		color: #f0f7ff;
	}

	.hidden-field {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.closing-shell {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: flex-start;
	}

	.closing-copy {
		width: 100%;
	}

	.closing-actions {
		flex-direction: row;
		align-items: flex-start;
	}

	.social-inline :global(svg),
	.share-trigger :global(svg) {
		width: 18px;
		height: 18px;
		stroke-width: 2;
	}

	@media (max-width: 1100px) {
		.roadmap-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.hero-panel,
		.closing-shell,
		.order-grid {
			grid-template-columns: 1fr;
		}

		.order-summary {
			right: 1rem;
			bottom: 1rem;
		}
	}

	@media (max-width: 800px) {
		.offer-grid,
		.profile-grid,
		.example-math,
		.roadmap-grid,
		.form-grid {
			grid-template-columns: 1fr;
		}

		.hero-copy,
		.hero-stats,
		.section-shell,
		.closing-shell {
			padding: 1.2rem;
			border-radius: 20px;
		}

		.offer-topline,
		.cert-card {
			grid-template-columns: 1fr;
		}

		.cert-card {
			display: flex;
			flex-direction: column;
		}

		.quantity-controls {
			flex-wrap: wrap;
		}

		.order-summary {
			left: 1rem;
			right: 1rem;
			width: auto;
			bottom: 1rem;
		}
	}
</style>

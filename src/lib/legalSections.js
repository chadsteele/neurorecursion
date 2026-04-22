export const legalSections = [
	{
		id: "overview",
		slug: "terms",
		aliases: ["overview"],
		href: "/legal/terms#overview",
		title: "Overview",
	},
	{
		id: "privacy-data-use",
		slug: "privacy",
		aliases: ["privacy-policy", "data", "data-use"],
		href: "/legal/privacy#privacy-data-use",
		title: "Privacy and Data Use",
	},
	{
		id: "acceptable-use",
		slug: "acceptable-use",
		aliases: ["use", "acceptable"],
		href: "/legal/acceptable-use#acceptable-use",
		title: "Acceptable Use",
	},
	{
		id: "intellectual-property",
		slug: "copyright",
		aliases: ["copyrights", "ip", "intellectual-property"],
		href: "/legal/copyright#intellectual-property",
		title: "Intellectual Property and Copyright",
	},
	{
		id: "confidentiality-nda",
		slug: "nda",
		aliases: ["confidentiality", "confidential", "non-disclosure"],
		href: "/legal/nda#confidentiality-nda",
		title: "Confidentiality and NDA Expectations",
	},
	{
		id: "medical-professional-disclaimer",
		slug: "disclaimer",
		aliases: ["medical-disclaimer", "professional-disclaimer"],
		href: "/legal/disclaimer#medical-professional-disclaimer",
		title: "Medical and Professional Disclaimer",
	},
	{
		id: "no-guarantees",
		slug: "guarantees",
		aliases: ["no-guarantees", "warranties"],
		href: "/legal/guarantees#no-guarantees",
		title: "No Guarantees",
	},
	{
		id: "payments-refunds",
		slug: "payments",
		aliases: ["refunds", "billing", "commercial-terms"],
		href: "/legal/payments#payments-refunds",
		title: "Payments, Refunds, and Future Commercial Terms",
	},
	{
		id: "third-party-links",
		slug: "third-party",
		aliases: ["links", "external-services", "third-party-links"],
		href: "/legal/third-party#third-party-links",
		title: "Third-Party Links and External Services",
	},
	{
		id: "liability",
		slug: "liability",
		aliases: ["limitation-of-liability"],
		href: "/legal/liability#liability",
		title: "Limitation of Liability",
	},
	{
		id: "indemnification",
		slug: "indemnification",
		aliases: ["indemnity"],
		href: "/legal/indemnification#indemnification",
		title: "Indemnification",
	},
	{
		id: "governing-law",
		slug: "governing-law",
		aliases: ["law", "disputes", "jurisdiction"],
		href: "/legal/governing-law#governing-law",
		title: "Governing Law and Disputes",
	},
	{
		id: "changes-contact",
		slug: "contact",
		aliases: ["changes", "legal-contact"],
		href: "/legal/contact#changes-contact",
		title: "Changes and Contact",
	},
]

export const footerLegalLinks = [
	{label: "Terms", href: "/legal/terms#overview"},
	{label: "Privacy", href: "/legal/privacy#privacy-data-use"},
	{label: "Copyright", href: "/legal/copyright#intellectual-property"},
	{label: "NDA", href: "/legal/nda#confidentiality-nda"},
	{label: "Liability", href: "/legal/liability#liability"},
]

export function resolveLegalSection(input) {
	if (!input) return null

	const normalized = String(input)
		.toLowerCase()
		.replace(/^\/+|\/+$/g, "")
	return (
		legalSections.find(
			(section) =>
				section.slug === normalized ||
				section.id === normalized ||
				(section.aliases || []).includes(normalized),
		) || null
	)
}

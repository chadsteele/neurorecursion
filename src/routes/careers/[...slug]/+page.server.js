import jobs from "../../../data/Jobs.js"

export const prerender = true

export function entries() {
	return jobs.map((job) => ({
		slug: job.id,
	}))
}

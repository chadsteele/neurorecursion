import {redirect} from "@sveltejs/kit"

export const actions = {
	default: async ({request}) => {
		if (request.method !== "POST") {
			return {success: false}
		}

		// Simply redirect to success page
		// Netlify Forms automatically captures the form data
		throw redirect(303, "/success")
	},
}

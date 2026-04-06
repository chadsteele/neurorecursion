import {redirect} from "@sveltejs/kit"

export const actions = {
	default: async ({request}) => {
		if (request.method !== "POST") {
			return {success: false}
		}

		// Redirect to success page after form submission
		// Netlify Forms automatically captures the form data
		throw redirect(303, "/success?redirectTo=/")
	},
}

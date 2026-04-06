import {redirect} from "@sveltejs/kit"

export const actions = {
	default: async ({request}) => {
		if (request.method !== "POST") {
			return {success: false}
		}

		// Redirect to success page with consent as next destination
		throw redirect(303, "/success?redirectTo=/consent")
	},
}

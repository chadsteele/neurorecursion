<script>
	import {page} from "$app/stores"
	import LegalPage from "$lib/LegalPage.svelte"

	const activeSection = $derived($page.params.section || "")
</script>

<LegalPage {activeSection} />
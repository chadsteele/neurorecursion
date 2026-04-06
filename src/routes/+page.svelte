<script>
	import Intro from "$lib/Intro.svelte"
	import Partners from "$lib/Partners.svelte"
	import References from "$lib/References.svelte"
	import SignUp from "$lib/SignUp.svelte"
	import Skeleton from "$lib/Skeleton.svelte"
	import Featured from "$lib/Featured.svelte"
	import Alert from "$lib/Alert.svelte"
	import Parallax from "$lib/Parallax.svelte"
</script>

<Parallax background="/backgrounds/children.jpg">
	<Intro class="paper container" />

	<References class="paper container" />
</Parallax>

<SignUp class="paper container" />
<Partners class="paper container" />
<Alert class="paper container" />
<Featured class="paper container" />

<style>
</style>

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

<div class="container">
	<Parallax background="/backgrounds/children.jpg">
		<Intro class="paper container" />
	</Parallax>
	<References />
	<SignUp />
	<Partners />
	<Alert />
	<Featured />
</div>

<style>
</style>

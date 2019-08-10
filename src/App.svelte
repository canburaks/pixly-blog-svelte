<script>
  import { onMount } from 'svelte';
  import { Router, Link, Route } from "svelte-routing";

  import Navbar from "./components/Navbar.svelte";
  import Footer from "./components/Footer.svelte";
  //import Main from "./Main.svelte";

  import PostItem from "./components/PostItem.svelte";
  import BlogPage from "./pages/BlogPage.svelte";
  import PostPage from "./pages/PostPage.svelte";

  import { Store, updateStore, queryStore} from "./functions/store.js"
  import { getBlog } from "./functions/queries.js";

  export let url = window.location.href.includes("localhost") ? "http://localhost:5000/" : "https://blog.pixly.app"
  
  onMount(() => {
	  //Get Blog posts and update local store
	  getBlog()
  })
 
 let storePosts;
	const unsubscribe = Store.subscribe(value => {
		storePosts = value;
	});
	console.log("store posts",storePosts.length)

</script>

<style>
	.App {
		position: relative;
		display: flex;
		width: 100%;
		height: auto;
		flex-direction: column;
		/*font-family: "Open Sans", sans-serif;*/
		position: absolute;
		background: var(--color-light);
		background-blend-mode: multiply;
		font-size: 16;
		scroll-behavior: smooth !important;

	}
	.main-content-container {
		position: relative;
		min-height: calc(100vh - (var(--navbar-height) + var(--footer-height)) );
		margin-top: var(--navbar-height);
		margin-bottom: var(--footer-height);

		background-color: var(--color-light);
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		padding: 5vw 3vw;
		/*margin-right:5%;
			margin-left:5%;
			*/
	}
</style>

<div class="App">

  <Router>
	<Navbar />
		<main class="main-content-container">
			<h6>store: </h6>
			{#if Object.keys(storePosts).length > 0}
				<ul>
					{#each Object.keys(storePosts) as id}
						<li>id:{id} - {storePosts[id].header}</li>
					{/each}
				</ul>
			{/if}
			<Route path="post/:slug" component="{PostPage}" />
			<Route path="blog/:page" component="{BlogPage}" />
			<Route path="blog" component="{BlogPage}" />
			<Route path="/" component="{BlogPage}" />
		</main>
	<Footer />
  
  </Router>
  
</div>

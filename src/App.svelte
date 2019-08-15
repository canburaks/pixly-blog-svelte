<script>
	import { onMount } from 'svelte';
	import { Router,  Route, links } from "svelte-routing";

	import Navbar from "./components/Navbar.svelte";
	import Footer from "./components/Footer.svelte";
	//import Main from "./Main.svelte";

	import PostItem from "./components/PostItem.svelte";
	import BlogPage from "./pages/BlogPage.svelte";
	import PostPage from "./pages/PostPage.svelte";

	import { Store } from "./functions/store.js"
	

	$: pathname = window.location.pathname
	let storePosts;
	const unsubscribe = Store.subscribe(value => {
		storePosts = value;
	});
</script>

<div class="App" use:links  itemscope itemtype="http://schema.org/Blog">
    <meta itemprop="about" content="Tech and Cinema posts written by official pixly members." />
    <meta itemprop="genre" content="Tech"/>
    <meta itemprop="genre" content="Cinema"/>

  <Router>
	<Navbar />
		<main class="main-content-container">
			<Route path="post/:slug" component="{PostPage}" />
			<Route path="/:page" component="{BlogPage}" />
			<Route path="blog" component="{BlogPage}" />
			<Route path="/" component="{BlogPage}" />
		</main>
	<Footer />
  
  </Router>
  
</div>



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
		padding: 0vw 5vw;
		/*margin-right:5%;
			margin-left:5%;
			*/
	}
</style>

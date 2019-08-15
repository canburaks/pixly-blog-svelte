<script>
    import { onMount } from 'svelte';

    import PostItem from "../components/PostItem.svelte";
    import { Store} from "../functions/store.js"
	import { blogRequest } from "../functions/queries.js";

    export let page;
	onMount(() => {
		//Get Blog posts and update local store
		blogRequest(page).catch(e => console.log("eee", e.message))
    })
    
    let storePosts;
    const unsubscribe = Store.subscribe(value => {
        storePosts = value;
    });
    //$:postKeys = Object.keys(storePosts)
</script>

<div class="page-container blog-page">


	<div class="breadcrumb">
		{#if window.location.pathname !== "/"}
			<button class="back-button" on:click={() => window.history.back()}>
				Back
			</button>
		{/if}
	</div>

    {#if Object.keys(storePosts).length > 0 }
        {#each Object.keys(storePosts) as key }
            <PostItem post={storePosts[key]} />
        {/each}
    {/if}

    {#if window.location.href.includes("pixly")}
        <ins class="adsbygoogle"
            style="display:block"
            data-ad-format="fluid"
            data-ad-layout-key="-f7+5u+4t-da+6l"
            data-ad-client="ca-pub-9259748524746137"
            data-ad-slot="3122895789">
        </ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
    {/if}
</div>


<style>
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
</style>


<!--
    {#await blog}
        Loading...
    {:then data}
        {#each data.blogPosts as post}
        <PostItem post={post} />

        {/each}
    {:catch error}
        Error: {error.message}
    {/await}
-->
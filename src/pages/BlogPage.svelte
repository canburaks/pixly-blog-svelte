<script>
  import { writable } from 'svelte/store';
  import PostItem from "../components/PostItem.svelte";
  import { getBlog } from "../functions/queries.js";
  import { Store, updateStore, queryStore} from "../functions/store.js"



  const blog = getBlog().catch(error => console.error(error));


</script>

<style>
  .page-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
</style>


<div class="page-container">
    {#await blog}
        Loading...
    {:then data}
        {#each data.blogPosts as post}
        <PostItem post={post} />

        {/each}
    {:catch error}
        Error: {error.message}
    {/await}

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
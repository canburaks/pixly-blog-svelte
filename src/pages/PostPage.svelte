<script>
  //import { getClient, query } from 'svelte-apollo';
  //import { GET_BLOG, GET_POST } from './queries';
  import PostItem from "../components/PostItem.svelte";
  import { getPost } from "../functions/queries.js";

  const post = getPost(3).catch(error => console.error(error));
  console.log("post", post)
  //const content = document.querySelector("#post")
  //content.innerHTML = post.text;
  console.log(window.location)
</script>


<div class="page-container">
    {#if window.location.href.includes("pixly")}
		<ins class="adsbygoogle"
			style="display:block"
			data-ad-format="fluid"
			data-ad-layout-key="-f9+5v+4m-d8+7b"
			data-ad-client="ca-pub-9259748524746137"
			data-ad-slot="3942041487">
		</ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
    {/if}


	{#await post}
		Loading...
	{:then data}

		<article class="message-box">
			<section class="top-box">
				<h2 class="post-item-header">{data.post.header}</h2>
				<div class="top-bottom">
					<a target="_blank" class="author" href={`https://pixly.app/user/${data.post.author.username}`}>
						{data.post.author.name}
					</a>
					<p class="post-item-date">{data.post.updatedAt.slice(0,10)}</p>
				</div>
			</section>

			<hr>

			<section id="post" class="content-box">
				{@html data.post.text}
			</section>

		</article>

	{:catch error}
		Error: {error}
    {/await}
</div>

<style>
	.message-box{
		margin: 15px 0;
		width: 100% !important;
		max-width:92vw;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		border: 1px solid rgba(40,40,40, 0.4);
		box-shadow: 1px 5px 8px -8px rgba(0,0,0, 0.9);
		box-sizing: border-box !important;
		overflow: hidden;
		padding:8px 16px;

	}
	.top-box {
		width: 100% ;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		flex-grow:1;
	}
	.top-bottom{
		display: flex;
		justify-content: flex-start;
		align-items: flex-end;
		flex-wrap: wrap;
		width: 100%;
		margin-top: 16px;
	}
	a.author{
		font-size: 14px;
	}
	.content-box{
		width: 100%;
		margin-top: 40px;
	}
	.post-item-date{
		margin-left: 16px;
		font-size: 14px;
		opacity: 0.7;
	}
	hr{
		width:100%;
		margin:8px 0;
		opacity: 0.5;
	}
	#post.content-box{
		line-height: 1.6;
	}

@media all and (min-width: 300px) { 
	.post-item-header{
		font-size: 20px;
	}

}
@media all and (min-width: 480px) { 
	.post-item-header{
		font-size: 24px;
	}

}
</style>
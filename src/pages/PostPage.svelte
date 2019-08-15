<script>
	import { onMount } from 'svelte';
	//import { getClient, query } from 'svelte-apollo';
	//import { GET_BLOG, GET_POST } from './queries';
	import PostItem from "../components/PostItem.svelte";
	import PublisherData from "../richdata/PublisherData.svelte";

	import { Store, updateStore, getPostBySlug, getServerPostBySlug} from "../functions/store.js"
	
	export let slug;
	let postBody;

	let post;
	onMount(async () => {
		post = await getPostBySlug(slug)
		//console.log("onmount:", post)
	})
	/*
	*/


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

	{#if post && post.header}
	
	<article class="message-box" 
		itemscope itemtype="http://schema.org/BlogPosting"
		itemid={`https://blog.pixly.app/post/${post.slug}`}
		>
		<section class="top-box">
			<h2 class="post-item-header" itemprop="headline">{post.header}</h2>

			<div class="top-bottom">
				<a 
					target="_blank" 
					class="author underline" 
					href={`https://pixly.app/user/${post.author.username}`}
					>
					<div itemprop="author" itemtype="http://schema.org/Person">
						{post.author.name ? post.author.name : post.author.username}
					</div>
				</a>

				<meta itemprop="datePublished" content={post.updatedAt}>
				<meta itemprop="dateCreated" content={post.createdAt}>
				<meta itemprop="dateModified" content={post.updatedAt}>
				<p class="post-item-date" itemprop="datePublished"  >{post.updatedAt.slice(0,10)}</p>
			</div>
		</section>

		<hr>

		<section id="post" class="content-box" itemprop="articleBody" bind:this={postBody}>
			<img 
				class="structure-image" 
				alt="post image" itemtype="http://schema.org/ImageObject"
				style="width:80%; height:300px; margin-left:10%; margin-bottom:30px;"
				itemprop="image"  src={post.imageUrl ? post.imageUrl : `https://cbs-static.s3.amazonaws.com/static/media/${post.image}` }
					/>
			{@html post.text}


		</section>
		<PublisherData />
		
	</article>
	{/if}

	<div class="breadcrumb">
		{#if window.location.pathname !== "/"}
			<span on:click={() =>window.history.back()}>
				<svg 
					aria-hidden="true" focusable="false" data-prefix="fas" 
					data-icon="long-arrow-alt-left" class="left-arrow" 
					role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
				>
					<path fill="currentColor" d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"></path>
				</svg>
				BACK
			</span>
		{/if}
	</div>
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
		margin-top: 10px;
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
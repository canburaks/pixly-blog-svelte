<script>
  import { Router, Link, Route } from "svelte-routing";

  export let post
</script>



<div class="message-box">

    <div class="top-box">
        <div class="text-box">
            <article class="post-item-article">
                <h2 class="post-item-header">{post.header}</h2>
                <p class="post-item-summary">{post.summary}</p>
            </article>
                <a target="_blank" class="author" href={`https://pixly.app/user/${post.author.username}`}>
                    {post.author.name}
                </a>
        </div>

        <div class="image-box">
             <img src={post.imageUrl ? post.imageUrl : post.image} alt="Post image" />
        </div>
    </div>
</div>

<style>
    .message-box{
        margin: 15px 0;
        width: 100% !important;
        max-width:92vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        border: 1px solid rgba(40,40,40, 0.4);
        box-shadow: 1px 5px 8px -8px rgba(0,0,0, 0.9);
        box-sizing: border-box !important;
        overflow: hidden;
    }
    .top-box{
        font-family:Montserrat, sans-serif;
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        box-sizing: border-box;
        align-items: stretch;
        border-bottom: 1px solid rgba(40,40,40, 0.4);
        padding: 12px 16px;
        max-height:300px;
    }
    .text-box {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-grow:1;
    }
    .image-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width:30%;
        overflow: hidden;
    }
    .image-box img {
        width:100%;
        max-height:150px;
    }
    a.author{
        font-size: 14px;
        margin:16px 0 0 0;
    }
@media all and (min-width: 300px) { 
    .text-box{
        width:100%;
        margin-top: 20px;
        order:1;
    }
    .image-box{
        width:100%;
        order:0;
    }
    .image-box img {
        width:80%;
    }
    .post-item-summary{
        margin-top: 8px;
    }
    .post-item-header{
        font-size: 18px;
        font-weight: bold;
    }
}
@media all and (min-width: 480px) { 
    .text-box{
        width:65%;
        order:0
    }
    .image-box{
        width:34%;
        order:1;
    }
    .post-item-summary{
        margin-top: 8px;
    }
    .post-item-header{
        font-size: 18px;
    }

    .image-box img {
        max-width:250px;
    }
}
@media all and (min-width: 736px) { 
    .text-box{
        width:70%;
        order:0
    }
    .image-box{
        width:30%;
        order:1;
    }
    .post-item-summary{
        margin-top: 8px;
    }
    .post-item-header{
        font-size: 20px;
    }

    .image-box img {
        max-width:150px;
    }
}
@media all and (min-width: 980px) { 

}

@media all and (min-width: 1280px) { 

}

@media all and (min-width: 1581px) { 

}

</style>
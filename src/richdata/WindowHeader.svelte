<script>
    export let post;
    let richdata;

    function blogPostRichData(post){
        const data = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://blog.pixly.app"
            },
            "headline": `${post.header}`,
            //"image": [
            //    `${post.imageUrl}`,
            //],
            "datePublished": `${post.publishedAt}` ,
            "dateModified":  `${post.updatedAt}`,
            "author": {
                "@type": "Person",
                "name": post.author.name ? `${post.author.name}` : post.author.username
            },
            "publisher": {
                "@type": "Organization",
                "name": "Pixly",
                "logo": {
                "@type": "ImageObject",
                "url": "https://cbs-static.s3.eu-west-2.amazonaws.com/static/images/favicon-small.png"
                }
            },
            "description": post.summary
        }
        return data

}

    $:if (Object.keys(post).length > 0){
            richdata = blogPostRichData(post)
            const el = document.querySelector("#richdata")
            el.innerHTML = JSON.stringify(richdata)
            //console.log("rich", richdata)
        } 

</script>


<!--

<svelte:head>
    {#if  richdata}
        <script type="application/ld+json">{@html post.text}</script>
    {/if}
</svelte:head>
-->
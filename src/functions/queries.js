import { GraphQLClient } from 'graphql-request'
import { Store, updateStore } from "./store.js"

// ... or create a GraphQL client instance to send requests
//const client = new GraphQLClient("https://blog.pixly.app/graphql", { headers: {} })
//client.request(query, variables).then(data => console.log(data))


export async function getBlog(first=20, skip=0) {
    const endpoint = "https://blog.pixly.app/graphql"

    const client = new GraphQLClient(endpoint, {
        headers: {},
    })

    const BLOG_QUERY = `query blogPosts($first: Int, $skip: Int) {
        blogPosts(first: $first, skip: $skip) {
			id, header, summary, image, poster, text, slug,  postType, createdAt, updatedAt,
			author{
				username, name
			},
			tag{
				customId,
				movielensId,
				name
			}
        }
    }`
    const data = await client.request(BLOG_QUERY, {first, skip})
    //console.log("blog query data: ",data)
    // Add aws s3 prefix to image, cant be done on server
    if (data){
        data.blogPosts.forEach(
            p => p.imageUrl = "https://cbs-static.s3.amazonaws.com/static/media/" + p.image
		)
	}
	//Update local store
	if (data && data.blogPosts){
		console.log("data bp:", data.blogPosts)
		data.blogPosts.forEach(p => {
			var newPost = {};
			newPost[p.id] = p;
			Store.update(s  => ({...s, ...newPost}) )
		})
	}

    return data
}

export async function getPost(id) {
  const endpoint = "https://blog.pixly.app/graphql"

  const client = new GraphQLClient(endpoint, {
    headers: {},
  })

  const POST_QUERY = `query post($id: Int) {
    post(id: $id) {
	  id, header, image, poster, text, slug,  postType, createdAt, updatedAt,
	  author{
		  username, name
	  },
	  tag{
		  customId,
		  movielensId,
		  name
	  }
    }
  }`
	const data = await client.request(POST_QUERY, { id })
	console.log("post query data: ",data)
  // Add aws s3 prefix to image, cant be done on server

  return data
}




export const BLOG_QUERY = `query blogPosts($first: Int, $skip: Int) {
  blogPosts(first: $first, skip: $skip) {
    id, header, slug,  postType, createdAt, updatedAt
  }
}`


export const POST_QUERY = `query post($id: Int) {
  post(id: $id) {
    id, header, text, slug,author, tag, postType, createdAt, updatedAt
  }
}`

/*

	new Promise(resolve => {
		setTimeout(() => {
			const queryResults = movies.filter(movie => movie.name.toLowerCase().includes(input));
			//console.log("result returned", result)
			resolve(queryResults)
		}, 300)
	});
*/
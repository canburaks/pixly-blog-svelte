import { GraphQLClient } from 'graphql-request'
import { Store, updateStore } from "./store.js"

// ... or create a GraphQL client instance to send requests
//const client = new GraphQLClient("https://blog.pixly.app/graphql", { headers: {} })
//client.request(query, variables).then(data => console.log(data))


export async function blogRequest(page) {
    const endpoint = "https://blog.pixly.app/graphql"
	if(!page){
		page = 1
	}
	const first = 20;
	const skip = (page - 1) * 20

	const client = new GraphQLClient(endpoint, {
        headers: {},
    })

    const BLOG_QUERY = `query blogPosts($first: Int, $skip: Int) {
        blogPosts(first: $first, skip: $skip) {
			id, header, summary, image,  text, slug,  postType, createdAt, updatedAt,
			author{
				username, name
			},
			tag{
				customId,
				movielensId,
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
		//console.log("data bp:", data.blogPosts)
		data.blogPosts.forEach(p => {
			var newPost = {};
			newPost[p.id] = p;
			Store.update(s  => ({...s, ...newPost}) )
		})
	}

    return data
}

export async function postRequestById(id) {
  const endpoint = "https://blog.pixly.app/graphql"

  const client = new GraphQLClient(endpoint, {
    headers: {},
  })

  const POST_QUERY = `query post($id: Int, $slug: String) {
    post(id: $id, slug: $slug) {
		id, header, summary, image,  text, slug,  postType, createdAt, updatedAt,
		author{
			username, name
		},
		tag{
			customId,
			movielensId,
		}
    }
  }`
	const data = await client.request(POST_QUERY, { id })
	//console.log("post query data: ",data)
  // Add aws s3 prefix to image, cant be done on server
	//Update local store
	if (data && data.post) {
		//console.log("post query data.post:", data.post)
		const newPost = {}
		newPost[data.post.id] = data.post
		Store.update(s => ({ ...s, ...newPost}))
	}
	if (data && data.post) return data.post
  return data.post
}

export async function postRequestBySlug(slug) {
	const endpoint = "https://blog.pixly.app/graphql"

	const client = new GraphQLClient(endpoint, {
		headers: {},
	})

	const POST_QUERY = `query post($id: Int, $slug: String) {
    post(id: $id, slug: $slug) {
		id, header, summary, image,  text, slug,  postType, createdAt, updatedAt,
		author{
			username, name
		},
		tag{
			customId,
			movielensId,
		}
    }
  }`
	const data = await client.request(POST_QUERY, { slug })
	//console.log("post query data: ", data)
	// Add aws s3 prefix to image, cant be done on server
	//Update local store
	if (data && data.post) {
		//console.log("post query data.post:", data.post)
		const newPost = {}
		newPost[data.post.id] = data.post
		Store.update(s => ({ ...s, ...newPost }))
	}
	if (data && data.post) return data.post
	return data.post
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
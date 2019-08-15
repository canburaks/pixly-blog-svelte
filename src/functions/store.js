import { writable } from 'svelte/store';
import { postRequestBySlug, postRequestById } from "./queries"

export const Store = writable({});

let localstore;
Store.subscribe(value => {
    localstore = value;
});


export function updateStore(post){
    const newPost = {}
    newPost[post.id] = post
    Store.update(s => ({ ...s, ...newPost }))
}


// Get Post whether its in the store or in the server
export async function getPostBySlug(slug){
    //first query store
    var storePost =  getStorePostBySlug(slug)
    if (storePost && storePost.header){
        return storePost
    }
    else{
        const serverPost = await getServerPostBySlug(slug)
        //console.log("serverPost", serverPost)
        if (serverPost && serverPost.header){
            return serverPost
        }
        ////console.log("sdata", sdata)
        //return sdata
    }
}

//STORE QUERY
export function getStorePostById(postId){
    if (Store[postId]){
        //console.log("id found in store")
        return Store[postId]
    }
}
export function getStorePostBySlug(slug){
    Object.keys(localstore).map(key => {
        if (localstore[key].slug === slug){
            //console.log("slug found in store: ", localstore[key])
            return localstore[key]
        }
    })
}


// SERVER REQUESTS
export function getServerPostBySlug(slug){
    const post = postRequestBySlug(slug);
    if (post){
        return post
    }
}
export function getServerPostById(postId) {
    const post = postRequestById(postId);
    if (post) {
        return post
    }
}
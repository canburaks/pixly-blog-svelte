import { get, writable } from 'svelte/store';

export const Store = writable({});

export function updateStore(post){
    const newStore = Store[post.id] = post
    Store.update(newStore)
}

export function queryStore(postId){
    const posts = get(Store);
    if (posts[postId])return posts[postId]
}

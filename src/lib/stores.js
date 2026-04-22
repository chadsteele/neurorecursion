import {writable} from "svelte/store"

export const searchOpen = writable(false)
export const searchQuery = writable("")
export const currentMatchIndex = writable(-1)
export const totalMatches = writable(0)
export const pageBackground = writable({src: "", blur: 0})

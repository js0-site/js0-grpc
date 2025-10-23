import { fBin } from "./f.js"

let BASE

export const setBase = (url) => {
	BASE = url
}

export default (name, E, D) =>
	async (...args) =>
		D(await fBin(BASE + name, E(args)))

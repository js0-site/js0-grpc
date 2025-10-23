let REJECT

const Fetch = (kind) => {
		const send = async (url, opt) => {
			try {
				const r = await fetch(url, opt)
				if (
					[
						200,
						0, // no-cors will set status = 0
						304,
					].includes(r.status)
				) {
					return await r[kind]()
				}
				throw r
			} catch (err) {
				return REJECT(send, url, opt, err)
			}
		}
		return send
	},
	_fBin = Fetch("arrayBuffer")

export const setReject = (reject) => {
		REJECT = reject
	},
	fTxt = Fetch("text"),
	fJson = Fetch("json"),
	fBin = async (url, opt) => new Uint8Array(await _fBin(url, opt))

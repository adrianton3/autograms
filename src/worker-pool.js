(() => {
	'use strict'

	function makePool (sizeMax, output) {
		let size = sizeMax

		const queue = []

		const workers = []
		const status = []

		function dispatch () {
			if (queue.length <= 0) {
				return
			}

			while (queue.length > 0) {
				let allBusy = true

				for (let i = 0; i < size; i++) {
					if (status[i].state === 'idle') {
						const entry = queue.shift()

						workers[i].postMessage(entry)

						status[i] = {
							state: 'busy',
							prefix: entry.parameters.prefix,
							fudge: entry.parameters.fudge,
						}

						allBusy = false
						break
					}
				}

				if (allBusy) {
					break
				}
			}
		}

		function makeMessageHandler (index) {
			return ({ data }) => {
				if (data.type === 'end') {
					const cooldown = Math.max(4, Math.min(500, data.time / 2))

					status[index] = { state: 'cooldown' }
					output({ type: 'status', data: status })

					setTimeout(() => {
						status[index] = { state: 'idle' }
						dispatch()
						output({ type: 'status', data: status })
					}, cooldown)
				}

				output(data)
			}
		}

		for (let i = 0; i < sizeMax; i++) {
			const worker = new Worker('src/worker.js')

			worker.addEventListener('message', makeMessageHandler(i))

			workers.push(worker)
			status.push({ state: 'idle' })
		}

		output({ type: 'status', data: status })

		return {
			post (message) {
				queue.push(message)
				dispatch()
				output({ type: 'status', data: status })
			},
			getSize () {
				return size
			},
			setSize (newSize) {
				size = Math.min(sizeMax, newSize)
			}
		}
	}
	
	Object.assign(auto, {
		makePool,
	})
})()
(() => {
	'use strict'

	function makePool (sizeMax, cooldown, output) {
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
					if (status[i] === 'idle') {
						workers[i].postMessage(queue.shift())
						status[i] = 'busy'
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
					status[index] = 'cooldown'
					output({ type: 'status', data: status })

					setTimeout(() => {
						status[index] = 'idle'
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
			status.push('idle')
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
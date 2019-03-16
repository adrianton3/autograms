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

					setTimeout(() => {
						status[index] = 'idle'
						dispatch()
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

		return {
			post (message) {
				queue.push(message)
				dispatch()
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
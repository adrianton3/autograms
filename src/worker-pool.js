(() => {
	'use strict'

	function makePool (size, cooldown, output) {
		const queue = []

		const workers = []
		const status = []

		function dispatch () {
			if (queue.length <= 0) {
				return
			}

			while (queue.length > 0) {
				const idleWorkerIndex = status.findIndex((status) => status === 'idle')

				if (idleWorkerIndex < 0) {
					return
				}

				workers[idleWorkerIndex].postMessage(queue.shift())
				status[idleWorkerIndex] = 'busy'
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

		for (let i = 0; i < size; i++) {
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
		}
	}
	
	Object.assign(auto, {
		makePool,
	})
})()
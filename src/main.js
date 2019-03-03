(() => {
	'use strict'

	document.getElementById('run').addEventListener('click', () => {
		document.getElementById('out').value = 'searching'

		const prefix = (() => {
			const first = Number(document.getElementById('first').value)
			const second = Number(document.getElementById('second').value)

			if (first === -1) {
				return null
			}

			if (second === -1) {
				return [first]
			}

			return [first, second]
		})()

		const fudge = Number(document.getElementById('fudge').value)

		const intro = document.getElementById('intro').value
		const lastSeparator = document.getElementById('last-separator').value

		const output = (string) => {
			document.getElementById('out').value += `\n${string}`
		}

		setTimeout(() => {
			const startTime = performance.now()

			auto.runner.run(
				auto.languages['italian'],
				`${intro} ${lastSeparator}`,
				fudge,
				prefix,
				output,
			)

			const endTime = performance.now()
			output(`time: ${endTime - startTime}`)
		}, 4)
	})

	// console.time()
	// auto.runner.run(auto.languages['italian'], 'Questa frase contiene e', 10, [5])
	// auto.runner.run(auto.languages['italian'], 'Questa frase contiene e', 20, [5, 8, 8, 12, 14])
	// console.timeEnd()
})()
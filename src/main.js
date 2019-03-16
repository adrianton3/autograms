(() => {
	'use strict'

	const languageElement = document.getElementById('language')

	Object.keys(auto.languages).forEach((language) => {
		const option = document.createElement('option')
		option.textContent = language

		languageElement.appendChild(option)
	})

	function output (type, data) {
		const outElement = document.getElementById('out')

		if (type === 'log') {
			outElement.value += `\n${data}`
		} else if (type === 'solution') {
			outElement.value += `\nsolution:\n${data}`
		} else if (type === 'time') {
			const value = data >= 1000 * 60 * 60 ? `${(data / (1000 * 60 * 60)).toFixed(1)} h`
				: data >= 1000 * 60 ? `${(data / (1000 * 60)).toFixed(1)} m`
				: data >= 1000 ? `${(data / 1000).toFixed(1)} s`
				: `${data.toFixed(1)} ms`

			outElement.value += `\ntime: ${value}`
		} else if (type === 'cache') {
			outElement.value += `\ncached solutions:\n${data.join('\n')}`
		}
	}

	function getParameters () {
		const language = languageElement.value

		const fudgeStart = Number(document.getElementById('fudge-start').value)

		const startStrings = auto.languages[language].intros.flatMap((intro) =>
			auto.languages[language].lastSeparators.map((lastSeparator) =>
				`${intro} ${lastSeparator}`
			)
		)

		return {
			language,
			fudge: fudgeStart,
			prefix: null,
			startStrings,
		}
	}

	const worker = new Worker('src/worker.js')

	let parameters

	let fudgeExtra
	let fudgeTimeMin

	let partials
	let partialsIndex

	worker.addEventListener('message', ({ data }) => {
		if (data.type === 'time') {
			if (fudgeExtra < 10 && data.data < fudgeTimeMin) {
				fudgeExtra++

				setTimeout(() => {
					worker.postMessage({
						type: 'solve',
						parameters: {
							...parameters,
							fudge: parameters.fudge + fudgeExtra,
							prefix: partials[partialsIndex],
						},
					})
				}, 1000)
			} else if (partialsIndex < partials.length) {
				output('log', `max fudge ${parameters.fudge + fudgeExtra}`)

				fudgeExtra = 0
				partialsIndex++

				output('log', `new partial ${partials[partialsIndex].join(' ')}`)

				setTimeout(() => {
					worker.postMessage({
						type: 'solve',
						parameters: {
							...parameters,
							prefix: partials[partialsIndex],
						},
					})
				}, 1000)
			}
		} else {
			output(data.type, data.data)
		}
	})

	document.getElementById('run').addEventListener('click', () => {
		document.getElementById('out').value = '=== info'

		parameters = getParameters()

		fudgeExtra = 0
		fudgeTimeMin = Number(document.getElementById('fudge-time-min').value) * 1000

		partials = []
		partialsIndex = 0

		auto.runner.getInfo(
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefix,
			output
		)

		auto.runner.runPartial(
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			parameters.fudge,
			2,
			(type, data) => {
				// output('log', data.join(' '))
				if (type === 'partial') {
					partials.push(data)
				} else {
					output(type, data)
				}
			}
		)

		output('log', '\n=== partials')
		output('log', `count ${partials.length}`)

		output('log', '\n=== searching')

		output('log', `new partial ${partials[partialsIndex].join(' ')}`)
		worker.postMessage({ type: 'solve', parameters })
	})
})()
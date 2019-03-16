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

	const pool = auto.makePool(
		Math.max(1, navigator.hardwareConcurrency - 1),
		500,
		handleMessage,
	)

	let parameters

	let fudgeTimeMin

	let partials
	let partialsIndex

	function handleMessage (message) {
		if (message.type === 'end') {
			if (
				message.fudge < parameters.fudge + 10 &&
				message.time < fudgeTimeMin
			) {
				pool.post({
					type: 'solve',
					parameters: {
						...parameters,
						fudge: message.fudge + 1,
						prefix: message.prefix,
					},
				})
			} else if (partialsIndex < partials.length) {
				output('log', `max fudge ${message.fudge}`)

				partialsIndex++

				output('log', `new partial ${partials[partialsIndex].join(' ')}`)

				pool.post({
					type: 'solve',
					parameters: {
						...parameters,
						prefix: partials[partialsIndex],
					},
				})
			}
		} else {
			output(message.type, message.data)
		}
	}

	document.getElementById('run').addEventListener('click', () => {
		document.getElementById('out').value = '=== info'

		parameters = getParameters()

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

		pool.post({
			type: 'solve',
			parameters,
		})
	})
})()
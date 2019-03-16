(() => {
	'use strict'

	const languageElement = document.getElementById('language')

	Object.keys(auto.languages).forEach((language) => {
		const option = document.createElement('option')
		option.textContent = language

		languageElement.appendChild(option)
	})

	const outLogElement = document.getElementById('out-log')
	const outSolutionsElement = document.getElementById('out-solutions')
	const outStatusElement = document.getElementById('out-status')

	function output (type, data) {
		if (type === 'log') {
			outLogElement.value += `${data}\n`
		} else if (type === 'solution') {
			console.log(data)
			outSolutionsElement.value += `solution:\n${data}\n`
		} else if (type === 'status') {
			outStatusElement.value = data.map((status, index) => `thread ${index}: ${status}`).join('\n')
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

	const cooldown = 500

	const pool = auto.makePool(
		Math.max(1, navigator.hardwareConcurrency - 1),
		cooldown,
		handleMessage,
	)

	let parameters

	let fudgeTimeMin

	let partials
	let partialsIndex

	function stringifyTime (ms) {
		return ms >= 1000 * 60 * 60 ? `${(ms / (1000 * 60 * 60)).toFixed(1)} h`
			: ms >= 1000 * 60 ? `${(ms / (1000 * 60)).toFixed(1)} m`
			: ms >= 1000 ? `${(ms / 1000).toFixed(1)} s`
			: `${ms.toFixed(1)} ms`
	}

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
				output('log', `max fudge ${message.fudge} for ${message.prefix}`)

				pool.post({
					type: 'solve',
					parameters: {
						...parameters,
						prefix: partials[partialsIndex],
					},
				})

				partialsIndex++
			}
		} else {
			output(message.type, message.data)
		}
	}

	const threadCountMaxElement = document.getElementById('thread-count-max')

	threadCountMaxElement.addEventListener('change', () => {
		pool.setSize(Number(threadCountMaxElement.value))
	})

	document.getElementById('run').addEventListener('click', () => {
		outLogElement.value = '=== info\n'

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
		output('log', `estimated min time ${stringifyTime(partials.length * (fudgeTimeMin + cooldown))}`)

		output('log', '\n=== searching')

		const poolSize = Number(threadCountMaxElement.value)

		pool.setSize(poolSize)

		for (let i = 0; i < poolSize; i++) {
			pool.post({
				type: 'solve',
				parameters: {
					...parameters,
					prefix: partials[partialsIndex],
				},
			})

			partialsIndex++
		}
	})
})()
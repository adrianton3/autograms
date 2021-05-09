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
			outStatusElement.value = data.map((status, index) => `thread ${index}: ${status.state}`).join('\n')
		}
	}

	const pool = auto.makePool(
		Math.max(1, navigator.hardwareConcurrency - 1),
		handleMessage,
	)

	let parameters = {}

	let partials = []
	let partialsIndex = 0

	let timeSum = 0
	let timeCount = 0

	function getParameters () {
		const language = languageElement.value

		const triesMax = Number(document.getElementById('tries-max').value)

		const optionAutogram = document.getElementById('option-autogram').checked

		const startStrings = (() => {
			if (optionAutogram) {
				return auto.languages[language].intros.flatMap((intro) =>
					auto.languages[language].lastSeparators.map((lastSeparator) =>
						`${intro} ${lastSeparator}`
					)
				)
			}

			return []
		})()

		return {
			language,
			triesMax,
			prefix: null,
			startStrings,
		}
	}

	function stringifyTime (ms) {
		return ms >= 1000 * 60 * 60 ? `${(ms / (1000 * 60 * 60)).toFixed(1)} h`
			: ms >= 1000 * 60 ? `${(ms / (1000 * 60)).toFixed(1)} m`
			: ms >= 1000 ? `${(ms / 1000).toFixed(1)} s`
			: `${ms.toFixed(1)} ms`
	}

	const threadCountMaxElement = document.getElementById('thread-count-max')

	const partialsIndexElement = document.getElementById('partials-index')
	const partialsCountElement = document.getElementById('partials-count')
	const estimatedTimeElement = document.getElementById('estimated-time')

	function postPartial () {
		if (partialsIndex >= partials.length) {
			partialsIndex = 0
		}

		pool.post({
			type: 'solve-random',
			parameters: {
				...parameters,
				prefix: partials[partialsIndex],
			},
		})

		partialsIndex++

		partialsIndexElement.textContent = `${partialsIndex}`

		const timeAverage = timeSum / timeCount
		const estimatedTime = (partials.length - partialsIndex) * (timeAverage + 500) / Number(threadCountMaxElement.value)
		estimatedTimeElement.textContent = stringifyTime(estimatedTime)
	}

	function handleMessage (message) {
		if (message.type === 'end') {
			timeCount++
			timeSum += message.time

			output('log', `${message.prefix.join(' ')}:    max time ${stringifyTime(message.time)}`)
			postPartial()
		} else {
			output(message.type, message.data)
		}
	}

	threadCountMaxElement.addEventListener('change', () => {
		const poolSizeOld = pool.getSize()
		const poolSizeNew = Number(threadCountMaxElement.value)

		pool.setSize(poolSizeNew)

		for (let i = poolSizeOld; i < poolSizeNew; i++) {
			postPartial()
		}
	})

	document.getElementById('run').addEventListener('click', () => {
		outLogElement.value = '=== info\n'

		parameters = getParameters()

		partials = []
		partialsIndex = 0

		auto.runner.getInfo(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			1000,
			parameters.prefix,
			output
		)

		auto.runner.runPartial(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			1000,
			3,
			(prefix) => { partials.push(prefix) }
		)

		partialsCountElement.textContent = `${partials.length}`

		output('log', '\n=== partials')
		output('log', `count ${partials.length}`)
		output('log', `estimated min time ${stringifyTime(partials.length * 500 * 2)}`)

		output('log', '\n=== searching')

		const poolSize = Number(threadCountMaxElement.value)

		pool.setSize(poolSize)

		for (let i = 0; i < poolSize; i++) {
			postPartial()
		}
	})

	document.getElementById('info').addEventListener('click', () => {
		outLogElement.value = '=== info\n'

		parameters = getParameters()

		auto.runner.getInfo(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			1000,
			parameters.prefix,
			output
		)
	})
})()

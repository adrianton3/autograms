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
			outStatusElement.value = data.map(
				(status, index) =>
					status.state === 'busy'
						? `thread ${index}: ${status.state} [${status.prefix.join(' ')}]`
						: `thread ${index}: ${status.state}`
			).join('\n')
		}
	}

	const cooldown = 500

	const pool = auto.makePool(
		Math.max(1, navigator.hardwareConcurrency - 1),
		cooldown,
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

		const countMax = document.getElementById('count-max').checked
		const countAverage = document.getElementById('count-average').checked

		const startStrings = (() => {
			if (optionAutogram) {
				return auto.languages[language].intros.flatMap((intro) =>
					auto.languages[language].lastSeparators.map((lastSeparator) =>
						`${intro} ${lastSeparator}`
					)
				)
			}

			return ['']
		})()

		return {
			language,
			options: {
				count: countMax ? 'max' : countAverage ? 'average' : 'median',
			},
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
		const estimatedTime = (partials.length - partialsIndex) * (timeAverage + cooldown) / Number(threadCountMaxElement.value)
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
			parameters.options,
			parameters.startStrings,
			1000,
			parameters.prefix,
			output
		)

		auto.runner.runPartial(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.options,
			parameters.startStrings,
			1000,
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

		partialsCountElement.textContent = `${partials.length}`

		output('log', '\n=== partials')
		output('log', `count ${partials.length}`)
		output('log', `estimated min time ${stringifyTime(partials.length * cooldown * 2)}`)

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
			parameters.options,
			parameters.startStrings,
			1000,
			parameters.prefix,
			output
		)
	})
})()
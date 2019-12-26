(() => {
	'use strict'

	const ui = new auto.Ui({
		languages: auto.languages,
		handleFudgeTimeChange,
		handleThreadCountChange,
		handleRun,
		handleInfo,
	})

	const pool = auto.makePool(navigator.hardwareConcurrency, handleMessage)

	let parameters = {}

	let fudgeTimeMin = 1

	let partials = []
	let partialsIndex = 0

	let timeSum = 0
	let timeCount = 0

	let startTime = 0

	const solutions = new Set

	function output (type, data) {
		if (type === 'log') {
			ui.postLog(data)
		} else if (type === 'solution') {
			if (!solutions.has(data.count)) {
				solutions.add(data.count)

				console.log(data.count)
				ui.postSolution(data.count, data.inflated, performance.now() - startTime)
			}
		} else if (type === 'status') {
			ui.postThreads(data)
		}
	}

	function postPartial () {
		if (partialsIndex >= partials.length) {
			return
		}

		pool.post({
			type: 'solve',
			parameters: {
				...parameters,
				prefix: partials[partialsIndex],
			},
		})

		partialsIndex++

		ui.setPartialsIndex(partialsIndex)

		const timeAverage = timeSum / timeCount
		const estimatedTime = (partials.length - partialsIndex) * (timeAverage + 500) / ui.getRuntimeParameters().threadCountMax
		ui.setEstimatedTime(estimatedTime)
	}

	function handleMessage (message) {
		if (message.type === 'end') {
			timeCount++
			timeSum += message.time

			if (
				message.fudge < parameters.fudge + 10 &&
				message.time < fudgeTimeMin
			) {
				const fudgeIncrement = message.time < (fudgeTimeMin * .01) ? 3
					: message.time < (fudgeTimeMin * .1) ? 2
					: 1

				const fudgeNext = Math.min(parameters.fudge + 10, message.fudge + fudgeIncrement)

				pool.post({
					type: 'solve',
					parameters: {
						...parameters,
						fudge: fudgeNext,
						prefix: message.prefix,
					},
				})
			} else {
				output('log', `${message.prefix.join(' ')}:    max fudge ${message.fudge}    max time ${auto.stringifyTime(message.time)}`)
				postPartial()
			}
		} else {
			output(message.type, message.data)
		}
	}

	function handleFudgeTimeChange (fudgeTimeMinNew) {
		fudgeTimeMin = fudgeTimeMinNew
	}

	function handleThreadCountChange (poolSizeNew) {
		const poolSizeOld = pool.getSize()

		pool.setSize(poolSizeNew)

		for (let i = poolSizeOld; i < poolSizeNew; i++) {
			postPartial()
		}
	}

	function handleRun () {
		startTime = performance.now()

		ui.clear()
		ui.lock()

		parameters = ui.getParameters()
		fudgeTimeMin = ui.getRuntimeParameters().fudgeTimeMin

		partials = []
		partialsIndex = 0

		auto.runner.getInfo(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.options,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefix,
			output,
		)

		auto.runner.runPartial(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.options,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefixLength,
			(type, data) => {
				if (type === 'partial') {
					partials.push(data)
				} else {
					output(type, data)
				}
			}
		)

		partials.sort((a, b) => {
			const deltaMax = Math.max(...a) - Math.max(...b)

			if (deltaMax !== 0) {
				return deltaMax
			}

			for (let i = 0; i < a.length; i++) {
				if (a[i] > b[i]) {
					return 1
				} else if (a[i] < b[i]) {
					return -1
				}
			}

			return 0
		})

		ui.setPartialsCount(partials.length)

		output('log', '\n=== partials')
		output('log', `count ${partials.length}`)
		output('log', `estimated min time ${auto.stringifyTime(partials.length * (fudgeTimeMin + 500))}`)

		output('log', '\n=== searching')

		const poolSize = ui.getRuntimeParameters().threadCountMax

		pool.setSize(poolSize)

		for (let i = 0; i < poolSize; i++) {
			postPartial()
		}
	}

	function handleInfo () {
		ui.clear()

		parameters = ui.getParameters()

		auto.runner.getInfo(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.options,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefix,
			output,
		)
	}
})()

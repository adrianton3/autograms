(() => {
	'use strict'

	self.auto = {}

	importScripts('runner/common.js')
	importScripts('runner/brute.js')
	importScripts('runner/random.js')

	;[
		'italian',
		'romanian',
		'latin',
        'english',
        'french',
	].forEach((language) => {
		importScripts(`../languages/${language}.js`)
	})

	self.addEventListener('message', ({ data }) => {
		if (data.type === 'solve') {
			const { parameters } = data

			const startTime = performance.now()

			auto.runner.runBrute(
				auto.languages[parameters.language].alphabet,
				auto.languages[parameters.language].numerals,
				parameters.options,
				parameters.startStrings,
				parameters.fudge,
				parameters.prefix,
				(type, data) => { postMessage({ type, data }) },
			)

			const endTime = performance.now()

			postMessage({
				type: 'end',
				fudge: parameters.fudge,
				prefix: parameters.prefix,
				time: endTime - startTime,
			})
		} else if (data.type === 'solve-random') {
			const { parameters } = data

			const startTime = performance.now()

			auto.runner.runRandom(
				auto.languages[parameters.language].alphabet,
				auto.languages[parameters.language].numerals,
				parameters.options,
				parameters.startStrings,
				parameters.triesMax,
				parameters.prefix,
				(type, data) => { postMessage({ type, data }) },
			)

			const endTime = performance.now()

			postMessage({
				type: 'end',
				fudge: parameters.fudge,
				prefix: parameters.prefix,
				time: endTime - startTime,
			})
		}
	})
})()

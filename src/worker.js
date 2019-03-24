(() => {
	'use strict'

	self.auto = {}

	importScripts('runner.js')

	;[
		'italian',
		'romanian',
	].forEach((language) => {
		importScripts(`../languages/${language}.js`)
	})

	self.addEventListener('message', ({ data }) => {
		if (data.type === 'solve') {
			const { parameters } = data

			const startTime = performance.now()

			auto.runner.run(
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
		}
	})
})()
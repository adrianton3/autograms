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
				auto.languages[parameters.language].numerals,
				`${parameters.intro} ${parameters.lastSeparator}`,
				parameters.fudge,
				parameters.prefix,
				(type, data) => { postMessage({ type, data }) },
			)

			const endTime = performance.now()
			postMessage({ type: 'log', data: `time: ${endTime - startTime}` })
		}
	})
})()
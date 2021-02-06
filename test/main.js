(() => {
	'use strict'

	function run (parameters) {
		const messages = []

		auto.runner.runBrute(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefix,
			(data) => { messages.push(data.count) },
		)

		return messages
	}

	function reflexicon (language, prefix, fudge, expected) {
		return {
			input: {
				language,
				startStrings: [''],
				fudge,
				prefix,
			},
			expected: [expected],
		}
	}

	[
		reflexicon('italian', [0, 0, 0], 6, '0 0 0 3 0 0 0 3 0 0 0 7 7'),
		reflexicon('italian', [4, 3, 5], 6, '4 3 5 3 4 0 8 6 3 2 6 8 12'),
		reflexicon('italian', [5, 7, 6], 6, '5 7 6 3 5 0 2 3 0 5 10 12 5'),
	].forEach(({ input, expected }) => {
		const actual = run(input)

		const actualStr = JSON.stringify(actual)
		const expectedStr = JSON.stringify(expected)

		if (actualStr !== expectedStr) {
			console.error({
				message: 'Test failed',
				input,
				actual,
				expected,
			})
		}
	})
})()

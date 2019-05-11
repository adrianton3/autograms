(() => {
	'use strict'

	function run (parameters) {
		const messages = []

		auto.runner.runBrute(
			auto.languages[parameters.language].alphabet,
			auto.languages[parameters.language].numerals,
			parameters.options,
			parameters.startStrings,
			parameters.fudge,
			parameters.prefix,
			(type, data) => { messages.push({ type, data }) },
		)

		return messages
	}

	function reflexicon (language, prefix, fudge, expected) {
		return {
			input: {
				language: 'italian',
				options: { count: 'max' },
				startStrings: [''],
				fudge,
				prefix,
			},
			expected: [{ type: 'solution', data: expected }],
		}
	}

	[
		reflexicon('italian', [0, 0, 0], 6, '0 0 0 0 0 0 3 3 0 0 7 0 7'),
		reflexicon('italian', [3, 4, 5], 6, '3 4 5 4 2 8 6 3 0 3 8 6 12'),
		reflexicon('italian', [7, 5, 6], 6, '7 5 6 5 5 2 3 3 0 0 12 10 5'),
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
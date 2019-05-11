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

	[{
		input: {
			language: 'italian',
			options: { count: 'max' },
			startStrings: [''],
			fudge: 6,
			prefix: [0, 0],
		},
		expected: [{ type: 'solution', 'data': '0 0 0 0 0 0 3 3 0 0 7 0 7' }],
	}].forEach(({ input, expected }) => {
		const actual = run(input)

		const actualStr = JSON.stringify(actual)
		const expectedStr = JSON.stringify(expected)

		if (actualStr !== expectedStr) {
			throw {
				message: 'Test failed',
				input,
				actual,
				expected,
			}
		}
	})
})()
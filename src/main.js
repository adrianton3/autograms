(() => {
	'use strict'

	const languageElement = document.getElementById('language')

	Object.keys(auto.languages).forEach((language) => {
		const option = document.createElement('option')
		option.textContent = language

		languageElement.appendChild(option)
	})

	function updateIntros () {
		const introsElement = document.getElementById('intros')

		while (introsElement.firstChild != null) {
			introsElement.removeChild(introsElement.firstChild)
		}

		const language = languageElement.value

		auto.languages[language].intros.forEach((intro) => {
			const option = document.createElement('option')
			option.textContent = intro

			introsElement.appendChild(option)
		})
	}

	updateIntros()
	languageElement.addEventListener('change', updateIntros)

	function updateLastSeparators () {
		const lastSeparatorsElement = document.getElementById('last-separators')

		while (lastSeparatorsElement.firstChild != null) {
			lastSeparatorsElement.removeChild(lastSeparatorsElement.firstChild)
		}

		const language = languageElement.value

		auto.languages[language].lastSeparators.forEach((intro) => {
			const option = document.createElement('option')
			option.textContent = intro

			lastSeparatorsElement.appendChild(option)
		})
	}

	updateLastSeparators()
	languageElement.addEventListener('change', updateLastSeparators)

	function updateLetters () {
		const language = languageElement.value

		const numerals = auto.languages[language].numerals
		const letters = auto.runner.getLetters(numerals)
		const signatures = auto.runner.getSignatures(letters, numerals)
		const countMax = auto.runner.getCountMax(letters, signatures)

		const firstLetterElement = document.getElementById('first-letter')
		firstLetterElement.textContent = letters[0]
		firstLetterElement.title = `Count max: ${countMax[0]}`

		const secondLetterElement = document.getElementById('second-letter')
		secondLetterElement.textContent = letters[1]
		secondLetterElement.title = `Count max: ${countMax[1]}`
	}

	updateLetters()
	languageElement.addEventListener('change', updateLetters)

	document.getElementById('run').addEventListener('click', () => {
		document.getElementById('out').value = 'searching'

		const language = languageElement.value

		const prefix = (() => {
			const first = Number(document.getElementById('first').value)
			const second = Number(document.getElementById('second').value)

			if (first === -1) {
				return null
			}

			if (second === -1) {
				return [first]
			}

			return [first, second]
		})()

		const fudge = Number(document.getElementById('fudge').value)

		const intro = document.getElementById('intro').value
		const lastSeparator = document.getElementById('last-separator').value

		const output = (string) => {
			document.getElementById('out').value += `\n${string}`
		}

		setTimeout(() => {
			const startTime = performance.now()

			auto.runner.run(
				auto.languages[language].numerals,
				`${intro} ${lastSeparator}`,
				fudge,
				prefix,
				output,
			)

			const endTime = performance.now()
			output(`time: ${endTime - startTime}`)
		}, 4)
	})

	// console.time()
	// auto.runner.run(auto.languages['italian'], 'Questa frase contiene e', 10, [5])
	// auto.runner.run(auto.languages['italian'], 'Questa frase contiene e', 20, [5, 8, 8, 12, 14])
	// console.timeEnd()
})()
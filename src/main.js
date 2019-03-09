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

	function output (type, data) {
		const outElement = document.getElementById('out')

		if (type === 'log') {
			outElement.value += `\n${data}`
		} else if (type === 'solution') {
			// if (!cache[key].includes(data)) {
			// 	cache[key].push(data)
			// }

			// localStorage.setItem('autograms-cache', JSON.stringify(cache))

			outElement.value += `\nsolution:\n${data}`
		} else if (type === 'time') {
			const value = data >= 1000 * 60 * 60 ? `${(data / (1000 * 60 * 60)).toFixed(1)} h`
				: data >= 1000 * 60 ? `${(data / (1000 * 60)).toFixed(1)} m`
				: data >= 1000 ? `${(data / 1000).toFixed(1)} s`
				: `${data} ms`

			outElement.value += `\ntime: ${value}`
		} else if (type === 'cache') {
			outElement.value += `\ncached solutions:\n${data.join('\n')}`
		}
	}

	const worker = new Worker('src/worker.js')

	worker.addEventListener('message', ({ data }) => {
		output(data.type, data.data)
	})

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

		
		const parameters = {
			language,
			intro,
			lastSeparator,
			fudge,
			prefix,
		}

		// const key = JSON.stringify(parameters)

		// const cache = (() => {
		// 	const cacheString = localStorage.getItem('autograms-cache')
		// 	if (cacheString == null) {
		// 		localStorage.setItem('autograms-cache', JSON.stringify({}))
		// 		return {}
		// 	} else {
		// 		return JSON.parse(cacheString)
		// 	}
		// })()

		// if (cache.hasOwnProperty(key)) {
		// 	output('cache', cache[key])
		// } else {

				// if (!cache.hasOwnProperty(key)) {
				// 	cache[key] = []
				// 	localStorage.setItem('autograms-cache', JSON.stringify(cache))
				// }

				worker.postMessage({ type: 'solve', parameters })

		// }
	})
})()
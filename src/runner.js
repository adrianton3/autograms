(() => {
	'use strict'

	function isLetter (char) {
		const code = char.charCodeAt(0)

		return ('A' <= char && char <= 'Z') ||
			('a' <= char && char <= 'z') ||
			(192 <= code && code < 592)
	}

	function getLetters (numerals) {
		const set = new Set

		numerals.forEach((numeral) => {
			[...numeral].forEach((char) => {
				const charLower = char.toLowerCase()

				if (isLetter(charLower)) {
					set.add(charLower)
				}
			})
		})

		const keys = [...set]
		keys.sort()

		return keys
	}

	function getLettersSorted (numerals) {
		const max = new Map

		numerals.forEach((numeral) => {
			const map = new Map

			;[...numeral.toLowerCase()].forEach((char) => {
				if (isLetter(char)) {
					if (map.has(char)) {
						map.set(char, map.get(char) + 1)
					} else {
						map.set(char, 1)
					}
				}
			})

			map.forEach((value, char) => {
				if (max.has(char)) {
					max.set(char, Math.max(max.get(char), value))
				} else {
					max.set(char, value)
				}
			})
		})

		const entries = [...max]
		entries.sort((a, b) => a[1] - b[1])
		return entries.map((entry) => entry[0])
	}

	function getSignature (letters, numeral) {
		return new Int8Array(letters.map((letter) => {
			const regex = new RegExp(letter, 'g')
			const match = numeral.match(regex)

			return match != null ? match.length : 0
		}))
	}

	function getSignatures (letters, numerals) {
		return numerals.map((numeral) => getSignature(letters, numeral))
	}

	function getCountMax (letters, signatures) {
		const max = new Int8Array(letters.length)

		signatures.forEach((signature) => {
			signature.forEach((value, index) => {
				max[index] = Math.max(max[index], value)
			})
		})

		return max
	}

	function getCountNonLetters (letters, string) {
		const map = new Map

		;[...string.toLowerCase()].forEach((char) => {
			if (
				(isLetter(char)) &&
				(!letters.includes(char))
			) {
				map.set(
					char,
					map.has(char) ? map.get(char) : 1
				)
			}
		})

		return map
	}

	function inflateNonLetters (numerals, countNonLetters, string) {
		const parts = [string]

		countNonLetters.forEach((value, key) => {
			const numeral = numerals[value + 1]
			parts.push(numeral.replace(/@/g, key))
		})

		return parts.join(' ')
	}

	function getCountLetters (letters, string) {
		const count = new Int8Array(letters.length)

		;[...string.toLowerCase()].forEach((char) => {
			const index = letters.indexOf(char)

			if (index > -1) {
				count[letters.indexOf(char)]++
			}
		})

		return count
	}

	function getCountMin (numerals, letters, startStrings) {
		const min = new Int8Array(letters.length).fill(127)

		startStrings.forEach((startString) => {
			const countNonLetters = getCountNonLetters(letters, startString)
			const inflated = inflateNonLetters(numerals, countNonLetters, startString)
			const countLetters = getCountLetters(letters, inflated)

			letters.forEach((letter, index) => {
				min[index] = Math.min(min[index], countLetters[index])
			})
		})

		return min
	}

	function getCountRest (numerals, letters, startStrings, countStartMin) {
		return startStrings.map((startString) => {
			const countNonLetters = getCountNonLetters(letters, startString)
			const inflated = inflateNonLetters(numerals, countNonLetters, startString)
			const countLetters = getCountLetters(letters, inflated)

			return new Int8Array(countLetters.map((value, index) => value - countStartMin[index]))
		})
	}

	function getInfo (numerals, startStrings, fudge, prefix, output) {
		output('log', `numerals: ${numerals.length}`)

		const letters = getLetters(numerals)
		output('log', 'letters:')
		output('log', letters.join(' '))

		const signatures = getSignatures(letters, numerals)
		const countMax = getCountMax(letters, signatures)

		output('log', 'count max:')
		output('log', countMax)

		const countStartMin = getCountMin(numerals, letters, startStrings)
		const countStartRest = getCountRest(numerals, letters, startStrings, countStartMin)

		output('log', 'count start min:')
		output('log', countStartMin)

		output('log', 'count start rest:')
		output('log', countStartRest)
	}

	function run (numerals, startStrings, fudge, prefix, output) {
		const letters = getLetters(numerals)

		const signatures = getSignatures(letters, numerals)
		const indexMax = letters.length
		const countMax = getCountMax(letters, signatures)
		const maxMax = numerals.length - 1

		const countStartMin = getCountMin(numerals, letters, startStrings)
		const countStartRest = getCountRest(numerals, letters, startStrings, countStartMin)

		const solution = new Int8Array(letters.length)
		const sum = countStartMin.slice()

		const restCandidate = new Int8Array(letters.length)

		function bt (index) {
			if (index < indexMax - 1) {
				// find min from partial
				const min = sum[index]
				const max = Math.min(
					min + Math.min(fudge, (indexMax - index) * countMax[index] + 1 /* self @ */),
					maxMax,
				)

				for (let i = min; i <= max; i++) {
					// apply partial
					solution[index] = i
					const signature = signatures[i]
					for (let j = 0; j < indexMax; j++) {
						sum[j] += signature[j]
					}

					// apply itself
					if (i > 0) {
						sum[index]++
					}

					// validate partial
					let partial = true
					for (let j = 0; j <= index; j++) {
						if (sum[j] > solution[j]) {
							partial = false
							break
						}
					}

					if (partial) {
						// recurse
						bt(index + 1)
					}

					// remove partial
					for (let j = 0; j < indexMax; j++) {
						sum[j] -= signature[j]
					}

					// remove itself
					if (i > 0) {
						sum[index]--
					}
				}
			} else {
				const min = sum[index]
				const max = Math.min(
					min + countMax[index] + 1 /* self @ */,
					maxMax,
				)

				for (let i = min; i <= max; i++) {
					solution[index] = i
					const signature = signatures[i]

					for (let j = 0; j < indexMax; j++) {
						restCandidate[j] = -(sum[j] + signature[j] + (i > 0 ? 1 : 0) - solution[j])
					}

					for (let j = 0; j < countStartRest.length; j++) {
						const rest = countStartRest[j]

						let valid = true
						for (let k = 0; k < indexMax; k++) {
							if (rest[k] !== restCandidate[k]) {
								valid = false
								break
							}
						}

						if (valid && solution.some(Boolean)) {
							output('solution', solution.join(' '))
						}
					}
				}
			}
		}

		function setPrefix (prefix) {
			for (let index = 0; index < prefix.length; index++) {
				// apply partial
				solution[index] = prefix[index]
				const signature = signatures[solution[index]]
				for (let j = 0; j < indexMax; j++) {
					sum[j] += signature[j]
				}

				// apply itself
				if (solution[index] > 0) {
					sum[index]++
				}
			}

			bt(prefix.length)
		}

		if (prefix != null) {
			setPrefix(prefix)
		} else {
			bt(0)
		}
	}



	auto.runner = auto.runner || {}
	Object.assign(auto.runner, {
		run,
		getInfo,
		getLetters,//: getLettersSorted,
		getSignatures,
		getCountMax,
	})
})()
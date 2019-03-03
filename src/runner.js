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

	function getSignature (letters, numeral) {
		return letters.map((letter) => {
			const regex = new RegExp(letter, 'g')
			const match = numeral.match(regex)

			return match != null ? match.length : 0
		})
	}

	function getSignatures (letters, numerals) {
		return numerals.map((numeral) => getSignature(letters, numeral))
	}

	function getCountMax (letters, numbers) {
		const max = new Uint8Array(letters.length)

		numbers.forEach((number) => {
			number.forEach((value, index) => {
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
		const count = new Uint8Array(letters.length)

		;[...string.toLowerCase()].forEach((char) => {
			const index = letters.indexOf(char)

			if (index > -1) {
				count[letters.indexOf(char)]++
			}
		})

		return count
	}

	function run (numerals, startString, fudge, prefix, out) {
		const letters = getLetters(numerals)
		out('letters:')
		out(letters.join(' '))

		const signatures = getSignatures(letters, numerals)
		const indexMax = letters.length
		const countMax = getCountMax(letters, signatures)

		const countNonLetters = getCountNonLetters(letters, startString)
		const inflated = inflateNonLetters(numerals, countNonLetters, startString)
		const countLetters = getCountLetters(letters, inflated)

		out('inflated:')
		out(inflated)

		out('starting from:')
		out(countLetters.join(' '))

		const solution = new Uint8Array(letters.length)
		const sum = countLetters.slice()

		function bt (index) {
			if (index < indexMax - 1) {
				// find min from partial
				const min = sum[index]
				const max = min + Math.min(fudge, (indexMax - index) * countMax[index])

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
					for (let j = 0; j < index; j++) {
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
				const max = min + countMax[index]

				for (let i = min; i <= max; i++) {
					solution[index] = i
					const signature = signatures[i]

					let valid = true
					for (let j = 0; j < indexMax; j++) {
						if (sum[j] + signature[j] + (i > 0 ? 1 : 0) !== solution[j]) {
							valid = false
							break
						}
					}

					if (valid) {
						out('solution:')
						out(solution.join(' '))
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
		getLetters,
	})
})()
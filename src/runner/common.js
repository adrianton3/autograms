(() => {
	'use strict'

	function isLetter (char) {
		const code = char.charCodeAt(0)

		return ('A' <= char && char <= 'Z') ||
			('a' <= char && char <= 'z') ||
			(192 <= code && code < 592)
	}

	function getLettersAlphabetic (numerals) {
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
		const max = new Array(letters.length).fill(0)

		signatures.forEach((signature) => {
			signature.forEach((value, index) => {
				max[index] = Math.max(max[index], value)
			})
		})

		return max
	}

	function getCountAverage (letters, signatures) {
		const sum = new Array(letters.length).fill(0)

		signatures.forEach((signature) => {
			signature.forEach((value, index) => {
				sum[index] += value
			})
		})

		return sum.map((value) => value / signatures.length)
	}

	function getCountMedian (letters, signatures) {
		const entries = new Array(letters.length).fill(null).map(() => [])

		signatures.forEach((signature) => {
			signature.forEach((value, index) => {
				entries[index].push(value)
			})
		})

		entries.forEach((values) => { values.sort() })

		return entries.map(
			(values) => values.length % 2 === 0
				? (values[values.length / 2] + values[values.length / 2 + 1]) / 2
				: values[Math.floor(values.length / 2) + 1]
		)
	}

	function getCount (letters, signatures, count) {
		return count === 'max' ? getCountMax(letters, signatures)
			: count === 'average' ? getCountAverage(letters, signatures)
			: getCountMedian(letters, signatures)
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

	function getMax (entries) {
		const max = new Int8Array(entries[0].length).fill(0)

		entries.forEach((entry) => {
			entry.forEach((value, index) => {
				max[index] = Math.max(max[index], value)
			})
		})

		return max
	}

	function getSpanForIndex (countMax, countStartRestMax, fudge) {
		return new Int8Array(
			countMax.map(
				(value, index) => Math.min(
					fudge,
					Math.ceil((countMax.length - index) * countMax[index]) + countStartRestMax[index] + 1
				)
			)
		)
	}

	function generateRelated (alphabet, letters, numeralOne, string) {
		const nonLetters = [...getCountNonLetters(letters, string).keys()]

		const freeNonLetters = [...alphabet].filter((candidate) =>
			!letters.includes(candidate) && !nonLetters.includes(candidate)
		)

		return freeNonLetters.map((_value, index) => {
			const freeSuffix = freeNonLetters.slice(0, index + 1)
				.map((freeNonLetter) => numeralOne.replace('@', freeNonLetter))

			return `${string} ${freeSuffix.join(' ')}`
		})
	}

	function sortLetters (letters, countMax) {
		return letters.map((letter, index) => ({ letter, weight: countMax[index] }))
			.sort((a, b) => a.weight - b.weight)
			.map(({ letter }) => letter)
	}

	function prepare (alphabet, numerals, options, startStringsRaw, fudge) {
		const lettersRaw = getLettersAlphabetic(numerals)

		const startStrings = (() => {
			if (startStringsRaw.length > 0 && startStringsRaw[0].length > 0) {
				return startStringsRaw.flatMap((string) => [
					string,
					...generateRelated(alphabet, lettersRaw, numerals[1], string)
				])
			}

			return startStringsRaw
		})()

		const signaturesRaw = getSignatures(lettersRaw, numerals)
		const countRaw = getCount(lettersRaw, signaturesRaw, options.count)

		{
			const letters = sortLetters(lettersRaw, countRaw)
			const signatures = getSignatures(letters, numerals)
			const count = getCount(letters, signatures, options.count)
			const countStartMin = getCountMin(numerals, letters, startStrings)
			const countStartRest = getCountRest(numerals, letters, startStrings, countStartMin)
			const countStartRestMax = getMax(countStartRest)
			const spanForIndex = getSpanForIndex(count, countStartRestMax, fudge)

			return {
				letters,
				count,
				signatures,
				countStartMin,
				countStartRest,
				spanForIndex,
			}
		}
	}

	function getInfo (alphabet, numerals, _options, startStrings, fudge, prefix, output) {
		output('log', `numerals ${numerals.length}`)

		const letters = getLettersAlphabetic(numerals)
		output('log', 'letters:')
		output('log', letters.join(' '))

		const countStartMin = getCountMin(numerals, letters, startStrings)

		output('log', 'count start min:')
		output('log', countStartMin.join(' '))

		const preMax = prepare(alphabet, numerals, { count: 'max' }, startStrings, fudge)

		output('log', 'sorted max:')
		output('log', preMax.letters.join(' '))
		output('log', preMax.spanForIndex.join(' '))
	}

	function inflate (alphabet, letters, count, numerals) {
		return [...alphabet].filter((letter) => letters.includes(letter))
			.map((letter) => {
				const index = letters.indexOf(letter)
				return numerals[count[index]].replace(/@/g, letter)
			})
			.filter((element) => element.length > 0)
			.join(', ')
	}

	auto.runner = auto.runner || {}
	Object.assign(auto.runner, {
		getInfo,
		prepare,
		inflate,
	})
})()

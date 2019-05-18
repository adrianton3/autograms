(() => {
	'use strict'

	const {
		prepare,
		inflate,
	} = auto.runner

	function runBrute (alphabet, numerals, options, startStrings, fudge, prefix, output) {
		const {
			letters,
			signatures,
			countStartMin,
			countStartRest,
			spanForIndex,
		} = prepare(alphabet, numerals, options, startStrings, fudge)

		const indexMax = letters.length
		const maxMax = numerals.length - 1

		const solution = new Int8Array(letters.length)
		const sum = countStartMin.slice()

		const restCandidate = new Int8Array(letters.length)

		function bt (index) {
			if (index < indexMax - 1) {
				// find min from partial
				const min = sum[index]
				const max = Math.min(min + spanForIndex[index], maxMax)

				if (min === 0) {
					solution[index] = 0
					bt(index + 1)
				}

				for (let i = min === 0 ? 1 : min; i <= max; i++) {
					// apply partial
					solution[index] = i
					const signature = signatures[i]
					for (let j = 0; j < indexMax; j++) {
						sum[j] += signature[j]
					}

					sum[index]++

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
					sum[index]--
				}
			} else {
				const min = sum[index]
				const max = Math.min(min + spanForIndex[index],	maxMax)

				for (let i = min; i <= max; i++) {
					solution[index] = i
					const signature = signatures[i]

					for (let j = 0; j < indexMax; j++) {
						restCandidate[j] = -(sum[j] + signature[j] - solution[j])
					}

					if (i > 0) {
						restCandidate[index]--
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
							output('solution', {
								count: solution.join(' '),
								inflated: inflate(alphabet, letters, solution, numerals),
							})
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

	function runPartial (alphabet, numerals, options, startStrings, _fudge, indexMax, output) {
		const {
			letters,
			signatures,
			countStartMin,
			spanForIndex,
		} = prepare(alphabet, numerals, options, startStrings, 1000)

		const maxMax = numerals.length - 1

		const solution = new Int8Array(letters.length)
		const sum = countStartMin.slice()

		function bt (index) {
			if (index < indexMax - 1) {
				// find min from partial
				const min = sum[index]
				const max = Math.min(min + spanForIndex[index], maxMax)

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
				const max = Math.min(min + spanForIndex[index], maxMax)

				for (let i = min; i <= max; i++) {
					solution[index] = i
					output('partial', solution.slice(0, index + 1))
				}
			}
		}

		bt(0)
	}

	auto.runner = auto.runner || {}
	Object.assign(auto.runner, {
		runBrute,
		runPartial,
	})
})()
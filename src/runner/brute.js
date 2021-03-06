(() => {
	'use strict'

	const {
		prepare,
		inflate,
		stringifyArray,
	} = auto.runner

	function runBrute (alphabet, numerals, startStringsRaw, fudge, prefix, output) {
		const {
			letters,
			signatures,
			countStartMin,
			countStartRest,
            spanForIndex,
            startStrings,
		} = prepare(alphabet, numerals, startStringsRaw, fudge)

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

				sum[index]++

				for (let i = min === 0 ? 1 : min; i <= max; i++) {
					// apply partial
					solution[index] = i
					const signature = signatures[i]
					for (let j = 0; j < indexMax; j++) {
						sum[j] += signature[j]
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
				}

				sum[index]--
			} else {
				const min = sum[index]
				const max = Math.min(min + spanForIndex[index], maxMax)

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
							output({
								count: stringifyArray(solution),
								inflated: inflate(alphabet, letters, solution, numerals, startStrings.length <= 0 ? null : startStrings[j]),
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


		}

		if (prefix == null) {
			bt(0)
		} else {
			setPrefix(prefix)
			bt(prefix.length)
		}
	}

	function runPartial (alphabet, numerals, startStringsRaw, fudge, indexMax, output) {
		const {
			letters,
			signatures,
			countStartMin,
			spanForIndex,
		} = prepare(alphabet, numerals, startStringsRaw, fudge)

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
						output(solution.slice(0, index + 1))
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

(() => {
	'use strict'

	const {
		prepare,
	} = auto.runner

	function runRandom (alphabet, numerals, options, startStrings, triesMax, prefix, output) {
		const {
			letters,
			signatures,
			countStartMin,
			countStartRest,
			spanForIndex,
		} = prepare(alphabet, numerals, options, startStrings, 1000)

		const indexMax = letters.length
		const maxMax = numerals.length - 1

		const solution = new Int8Array(letters.length)
		const sum = countStartMin.slice()

		const sumInitial = countStartMin.slice()
		const restCandidate = new Int8Array(letters.length)

		function walk (index) {
			while (index < indexMax - 1) {
				// find min from partial
				const min = sum[index]
				const i = Math.min(min + Math.floor(Math.random() * (spanForIndex[index] + 1)), maxMax)

				// apply partial
				solution[index] = i
				const signature = signatures[i]
				for (let j = 0; j < indexMax; j++) {
					sum[j] += signature[j]
				}

				if (i > 0) {
					sum[index]++
				}

				index++
			}

			// validate partial
			for (let j = 0; j < index; j++) {
				if (sum[j] > solution[j]) {
					return
				}
			}

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
						output('solution', solution.join(' '))
					}
				}
			}
		}

		function walkBatch (index) {
			for (let i = 0; i < indexMax; i++) {
				sumInitial[i] = sum[i]
			}

			for (let i = 0; i < triesMax; i++) {
				for (let j = 0; j < indexMax; j++) {
					sum[j] = sumInitial[j]
				}

				walk(index)
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

			walkBatch(prefix.length)
		}

		if (prefix != null) {
			setPrefix(prefix)
		} else {
			walkBatch(0)
		}
	}

	auto.runner = auto.runner || {}
	Object.assign(auto.runner, {
		runRandom,
	})
})()
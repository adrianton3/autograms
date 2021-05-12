'use strict'

const { prepare } = require('./runner/common')

function makeLinesAccumulator () {
	const accumulator = []

	return {
		push (...lines) { accumulator.push(...lines) },
		stringify () { return accumulator.join('\n') },
	}
}

function generateCommon (alphabet, numerals, startStrings, fudge) {
	const { push, stringify } = makeLinesAccumulator()

	const {
		signatures,
		countStartMin,
	} = prepare(alphabet, numerals, startStrings, fudge)

	push(`constexpr std::array<std::array<int, ${signatures[0].length}>, ${signatures.length}> signatures {{`)

	signatures.forEach((signature) => { push(`	{ ${signature.join(', ')} }, `) })

	push(`}};`)

	push(`constexpr std::array<int, ${countStartMin.length}> countStartMin { ${countStartMin.join(', ')} };`)

	return stringify()
}

function generateBrute (alphabet, numerals, startStrings, fudge) {
	const { push, stringify } = makeLinesAccumulator()

	const {
		letters,
		countStartRest,
		spanForIndex,
	} = prepare(alphabet, numerals, startStrings, fudge)

	const indexMax = letters.length
	const maxMax = numerals.length - 1

	push(`template<typename T>`)
	push(`void runBrute (const T& prefix) {`)

	push(`constexpr std::array<std::array<int, ${countStartRest[0].length}>, ${countStartRest.length}> countStartRest {{`)

	countStartRest.forEach((entry) => { push(`	{ ${entry.join(', ')} }, `) })

	push(`	}};`)

	push(`	constexpr std::array<int, ${spanForIndex.length}> spanForIndex { ${spanForIndex.join(', ')} };`)

	push(
		`	std::array<int, ${indexMax}> solution;`,
		`	auto sum = countStartMin;`,
		`	std::array<int, ${indexMax}> restCandidate;`,
		``,
	)

	push(
		`	std::function<void(int)> bt = [&] (auto index) {`,
		`		if (index < ${indexMax - 1}) {`,
		`			// find min from partial`,
		`			auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			if (min == 0) {`,
		`				solution[index] = 0;`,
		`				bt(index + 1);`,
		`				min = 1;`,
		`			}`,
		``,
		// `				sum[index]++;`, // moving this out somehow makes it slower
		`			for (auto i = min; i <= max; i++) {`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
		``,
		`				// apply partial`,
		`				for (auto j = 0; j < ${indexMax}; j++) {`,
		`					sum[j] += signature[j];`,
		`				}`,
		``,
		`				sum[index]++;`,
		``,
		`				// validate partial`,
		`				bool partial = true;`,
		`				for (auto j = 0; j <= index; j++) {`,
		`					if (sum[j] > solution[j]) {`,
		`						partial = false;`,
		`						break;`,
		`					}`,
		`				}`,
		``,
		`				if (partial) {`,
		`					// recurse`,
		`					bt(index + 1);`,
		`				}`,
		``,
		`				// remove partial`,
		`				for (auto j = 0; j < ${indexMax}; j++) {`,
		`					sum[j] -= signature[j];`,
		`				}`,
		``,
		`				sum[index]--;`,
		`			}`,
		// `				sum[index]--;`, // moving this out somehow makes it slower
		`		} else {`,
		`			const auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			for (auto i = min; i <= max; i++) {`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
		``,
		`				for (auto j = 0; j < ${indexMax}; j++) {`,
		`					restCandidate[j] = -(sum[j] + signature[j] - solution[j]);`,
		`				}`,
		``,
		`				if (i > 0) {`,
		`					restCandidate[index]--;`,
		`				}`,
		``,
	)

	if (countStartRest.length === 1 && countStartRest[0].every((count) => count === 0)) {
		push(
			`				bool valid = true;`,
			`				for (auto k = 0; k < ${indexMax}; k++) {`,
			`					if (restCandidate[k] != 0) {`,
			`						valid = false;`,
			`						break;`,
			`					}`,
			`				}`,
			``,
			`				if (valid) {`,
			`					outputComplete(solution);`,
			`				}`,
		)
	} else {
		push(
			`				for (const auto& rest : countStartRest) {`,
			`					bool valid = true;`,
			`					for (auto k = 0; k < ${indexMax}; k++) {`,
			`						if (rest[k] != restCandidate[k]) {`,
			`							valid = false;`,
			`							break;`,
			`						}`,
			`					}`,
			``,
			`					if (valid) {`,
			`						outputComplete(solution);`,
			`					}`,
			`				}`,
		)
	}

	push(
		`			}`,
		`		}`,
		`	};`,
		``,
	)

	push(
		`	const auto setPrefix = [&] (auto& prefix) {`,
		`		for (auto index = 0; index < prefix.size(); index++) {`,
		`			// apply partial`,
		`			solution[index] = prefix[index];`,
		`			const auto& signature = signatures[prefix[index]];`,
		`			for (auto j = 0; j < ${indexMax}; j++) {`,
		`				sum[j] += signature[j];`,
		`			}`,
		``,
		`			// apply itself`,
		`			if (prefix[index] > 0) {`,
		`				sum[index]++;`,
		`			}`,
		`		}`,
		`	};`,
		``,
	)

	push(
		`	setPrefix(prefix);`,
		`	bt(prefix.size());`,
	)

	push(`}`)

	return stringify()
}

function generatePartial (alphabet, numerals, startStrings, fudge) {
	const { push, stringify } = makeLinesAccumulator()

	const {	spanForIndex } = prepare(alphabet, numerals, startStrings, fudge)

	const maxMax = numerals.length - 1

	push(`void runPartial () {`)

	push(`	constexpr std::array<int, ${spanForIndex.length}> spanForIndex { ${spanForIndex.join(', ')} };`)

	push(
		`	std::array<int, prefixLength> solution;`,
		`	auto sum = countStartMin;`,
		``,
	)

	push(
		`	std::function<void(int)> bt = [&] (auto index) {`,
		`		if (index < prefixLength - 1) {`,
		`			// find min from partial`,
		`			const auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			for (auto i = min; i <= max; i++) {`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
		``,
		`				// apply partial`,
		`				for (auto j = 0; j < prefixLength; j++) {`,
		`					sum[j] += signature[j];`,
		`				}`,
		``,
		`				// apply itself`,
		`				if (i > 0) {`,
		`					sum[index]++;`,
		`				}`,
		``,
		`				// validate partial`,
		`				bool partial = true;`,
		`				for (auto j = 0; j <= index; j++) {`,
		`					if (sum[j] > solution[j]) {`,
		`						partial = false;`,
		`						break;`,
		`					}`,
		`				}`,
		``,
		`				if (partial) {`,
		`					// recurse`,
		`					bt(index + 1);`,
		`				}`,
		``,
		`				// remove partial`,
		`				for (auto j = 0; j < prefixLength; j++) {`,
		`					sum[j] -= signature[j];`,
		`				}`,
		``,
		`				// remove itself`,
		`				if (i > 0) {`,
		`					sum[index]--;`,
		`				}`,
		`			}`,
		`		} else {`,
		`			const auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			for (auto i = min; i <= max; i++) {`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
		``,
		`				// apply partial`,
		`				for (auto j = 0; j < prefixLength; j++) {`,
		`					sum[j] += signature[j];`,
		`				}`,
		``,
		`				// apply itself`,
		`				if (i > 0) {`,
		`					sum[index]++;`,
		`				}`,
		``,
		`				// validate partial`,
		`				bool partial = true;`,
		`				for (auto j = 0; j <= index; j++) {`,
		`					if (sum[j] > solution[j]) {`,
		`						partial = false;`,
		`						break;`,
		`					}`,
		`				}`,
		``,
		`				if (partial) {`,
		`					outputPartial(solution);`,
		`				}`,
		``,
		`				// remove partial`,
		`				for (auto j = 0; j < prefixLength; j++) {`,
		`					sum[j] -= signature[j];`,
		`				}`,
		``,
		`				// remove itself`,
		`				if (i > 0) {`,
		`					sum[index]--;`,
		`				}`,
		`			}`,
		`		}`,
		`	};`,
		``,
		`	bt(0);`,
	)

	push(`}`)

	return stringify()
}

Object.assign(module.exports, {
	generateCommon,
	generateBrute,
	generatePartial,
})

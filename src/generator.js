'use strict'

const { prepare } = require('./runner/common')

function makeLinesAccumulator () {
	const accumulator = []

	return {
		push (...lines) { accumulator.push(...lines) },
		stringify () { return accumulator.join('\n') },
	}
}

function generateCommon (alphabet, numerals, options, startStrings, fudge) {
	const { push, stringify } = makeLinesAccumulator()

	const {
		signatures,
		countStartMin,
	} = prepare(alphabet, numerals, options, startStrings, fudge)

	push(`constexpr std::array<std::array<int, ${signatures[0].length}>, ${signatures.length}> signatures {{`)

	signatures.forEach((signature) => { push(`	{ ${signature.join(', ')} }, `) })

	push(`}};`)

	push(`constexpr std::array<int, ${countStartMin.length}> countStartMin { ${countStartMin.join(', ')} };`)

	return stringify()
}

function generateBrute (alphabet, numerals, options, startStrings, fudge) {
	const { push, stringify } = makeLinesAccumulator()

	const {
		letters,
		countStartRest,
		spanForIndex,
	} = prepare(alphabet, numerals, options, startStrings, fudge)

	const indexMax = letters.length
	const maxMax = numerals.length - 1

	push(`void runBrute (const std::vector<int>& prefix = {}) {`)

	push(`	const std::array<std::array<int, ${countStartRest[0].length}>, ${countStartRest.length}> countStartRest {{`)

	countStartRest.forEach((entry) => { push(`		{ ${entry.join(', ')} }, `) })

	push(`	}};`)

	push(`	const std::array<int, ${spanForIndex.length}> spanForIndex { ${spanForIndex.join(', ')} };`)

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
		`			const auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			if (min == 0) {`,
		`				solution[index] = 0;`,
		`				bt(index + 1);`,
		`			}`,
		``,
		`			for (auto i = min == 0 ? 1 : min; i <= max; i++) {`,
		`				// apply partial`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
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
		`				// remove itself`,
		`				sum[index]--;`,
		`			}`,
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
		`			const auto& signature = signatures[solution[index]];`,
		`			for (auto j = 0; j < ${indexMax}; j++) {`,
		`				sum[j] += signature[j];`,
		`			}`,
		``,
		`			// apply itself`,
		`			if (solution[index] > 0) {`,
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

function generatePartial (alphabet, numerals, options, startStrings) {
	const { push, stringify } = makeLinesAccumulator()

	const {	spanForIndex } = prepare(alphabet, numerals, options, startStrings, 1000)

	const maxMax = numerals.length - 1

	push(`void runPartial (int indexMax) {`)

	push(`	const std::array<int, ${spanForIndex.length}> spanForIndex { ${spanForIndex.join(', ')} };`)

	push(
		`	std::vector<int> solution (indexMax);`,
		`	auto sum = countStartMin;`,
		``,
	)

	push(
		`	std::function<void(int)> bt = [&] (auto index) {`,
		`		if (index < indexMax - 1) {`,
		`			// find min from partial`,
		`			const auto min = sum[index];`,
		`			const auto max = std::min(min + spanForIndex[index], ${maxMax});`,
		``,
		`			for (auto i = min; i <= max; i++) {`,
		`				// apply partial`,
		`				solution[index] = i;`,
		`				const auto& signature = signatures[i];`,
		`				for (auto j = 0; j < indexMax; j++) {`,
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
		`				for (auto j = 0; j < indexMax; j++) {`,
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
		`				outputPartial(solution);`,
		`			}`,
		`		}`,
		`	};`,
		``,
		`	bt(0);`,
	)

	push(`}`)

	return stringify()
}

function generateMain ({ prefixLength, threadCount }) {
	const { push, stringify } = makeLinesAccumulator()

	push(
		`int main () {`,
			`runPartial(${prefixLength});`,
			`distribute(${threadCount});`,
			`return 0;`,
		`}`,
	)

	return stringify()
}

Object.assign(module.exports, {
	generateCommon,
	generateBrute,
	generatePartial,
	generateMain,
})

(() => {
	'use strict'

	const italian = {
		alphabet: 'abcdefghilmnopqrstuvz',
		intros: [
			'Questa frase contiene',
		],
		lastSeparators: [
			'e',
		],
		numerals: [
			'',
			'una @',
			'due @',
			'tre @',
			'quattro @',
			'cinque @',
			'sei @',
			'sette @',
			'otto @',
			'nove @',
			'dieci @',
			'undici @',
			'dodici @',
			'tredici @',
			'quattordici @',
			'quindici @',
			'sedici @',
			'diciassette @',
			'diciotto @',
			'diciannove @',
			'venti @',
			'ventuno @',
			'ventidue @',
			'ventitre @',
			'ventiquattro @',
			'venticinque @',
			'ventisei @',
			'ventisette @',
			'ventotto @',
			'ventinove @',
			'trenta @',
			'trentuno @',
			'trentadue @',
			'trentatre @',
			'trentaquattro @',
			'trentacinque @',
			'trentasei @',
			'trentasette @',
			'trentotto @',
			'trentanove @',
			'quaranta @',
		],
	}

	if (typeof window === 'undefined' && typeof WorkerGlobalScope === 'undefined') {
		Object.assign(module.exports, italian)
	} else {
		auto.languages = auto.languages || {}
		Object.assign(auto.languages, {
			italian,
		})
	}
})()

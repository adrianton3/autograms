(() => {
	'use strict'

	const french = {
		alphabet: 'abcdefghijklmnopqrstuvwxyz',
		intros: [
			'Cette phrase contient',
		],
		lastSeparators: [
			'et',
		],
		numerals: [
			'',
			'un @',
			'deux @',
			'trois @',
			'quatre @',
			'cinq @',
			'six @',
			'sept @',
			'huit @',
			'neuf @',
			'dix @',
			'onze @',
			'douze @',
			'treize @',
			'quatorze @',
			'quinze @',
			'seize @',
			'dix-sept @',
			'dix-huit @',
			'dix-neuf @',
			'vingt @',
			'vingt et un @',
			'vingt-deux @',
			'vingt-trois @',
			'vingt-quatre @',
			'vingt-cinq @',
			'vingt-six @',
			'vingt-sept @',
			'vingt-huit @',
			'vingt-neuf @',
			'trente @',
			'trente et un @',
			'trente-deux @',
			'trente-trois @',
			'trente-quatre @',
			'trente-cinq @',
			'trente-six @',
			'trente-sept @',
			'trente-huit @',
			'trente-neuf @',
			'quarante @',
		],
	}

	if (typeof window === 'undefined' && typeof WorkerGlobalScope === 'undefined') {
		Object.assign(module.exports, french)
	} else {
		auto.languages = auto.languages || {}
		Object.assign(auto.languages, {
			french,
		})
	}
})()

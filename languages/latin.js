(() => {
	'use strict'

	const latin = {
		alphabet: 'abcdefghiklmnopqrstuvxyz',
		intros: [
			'In hac sententia sunt',
		],
		lastSeparators: [
			'et',
		],
		numerals: [
			'',
			'una @',
			'duae @',
			'tres @',
			'quattuor @',
			'quinque @',
			'sex @',
			'septem @',
			'octo @',
			'novem @',
			'decem @',
			'undecim @',
			'duodecim @',
			'tredecim @',
			'quattuordecim @',
			'quindecim @',
			'sedecim @',
			'septendecim @',
			'duodeviginti @',
			'undeviginti @',
			'viginti @',
			'viginti et una @',
			'viginti et duae @',
			'viginti et tres @',
			'viginti et quattuor @',
			'viginti et quinque @',
			'viginti et sex @',
			'viginti et septem @',
			'viginti et octo @',
			'viginti et novem @',
			'triginta @',
		],
	}

	if (typeof window === 'undefined' && typeof WorkerGlobalScope === 'undefined') {
		Object.assign(module.exports, latin)
	} else {
		auto.languages = auto.languages || {}
		Object.assign(auto.languages, {
			latin,
		})
	}
})()

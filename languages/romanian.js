(() => {
	'use strict'

	const romanian = {
		alphabet: 'aăâbcdefghiîjklmnopqrsștțuvwxyz',
		intros: [
			'Următoarea frază conține',
			'Următoarea frază are',
			'Următoarea frază include',
			'Următoarea frază cuprinde',
			'Următoarea frază înglobează',
			'Următoarea frază este alcătuită din',
			'Următoarea frază este formată din',

			'Fraza următoare conține',
			'Fraza următoare are',
			'Fraza următoare include',
			'Fraza următoare cuprinde',
			'Fraza următoare înglobează',
			'Fraza următoare este alcătuită din',
			'Fraza următoare este formată din',

			'Această frază conține',
			'Această frază are',
			'Această frază include',
			'Această frază cuprinde',
			'Această frază înglobează',
			'Această frază este alcătuită din',
			'Această frază este formată din',

			'Fraza aceasta conține',
			'Fraza aceasta are',
			'Fraza aceasta include',
			'Fraza aceasta cuprinde',
			'Fraza aceasta înglobează',
			'Fraza aceasta este alcătuită din',
			'Fraza aceasta este formată din',

			'În alcătuirea aceastei fraze intră',
			'În alcătuirea aceastei fraze se află',
			'În alcătuirea aceastei fraze se găsesc',
			'În alcătuirea aceastei fraze se pot număra',
			'În alcătuirea aceastei fraze se numără',
			'În alcătuirea aceastei fraze se pot observa',
			'În alcătuirea aceastei fraze se observă',
			'În alcătuirea aceastei fraze apar',

			'În alcătuirea frazei aceasteia intră',
			'În alcătuirea frazei aceasteia se află',
			'În alcătuirea frazei aceasteia se găsesc',
			'În alcătuirea frazei aceasteia se pot număra',
			'În alcătuirea frazei aceasteia se numără',
			'În alcătuirea frazei aceasteia se pot observa',
			'În alcătuirea frazei aceasteia se observă',
			'În alcătuirea frazei aceasteia apar',

			'În componența acestei fraze intră',
			'În componența acestei fraze se află',
			'În componența acestei fraze se găsesc',
			'În componența acestei fraze se pot număra',
			'În componența acestei fraze se numără',
			'În componența acestei fraze se pot observa',
			'În componența acestei fraze se observă',
			'În componența acestei fraze apar',

			'În componența frazei acesteia intră',
			'În componența frazei acesteia se află',
			'În componența frazei acesteia se găsesc',
			'În componența frazei acesteia se pot număra',
			'În componența frazei acesteia se numără',
			'În componența frazei acesteia se pot observa',
			'În componența frazei acesteia se observă',
			'În componența frazei acesteia apar',

			'În această frază se află',
			'În această frază se găsesc',
			'În această frază se pot număra',
			'În această frază se numără',
			'În această frază se pot observa',
			'În această frază se observă',
			'În această frază apar',

			'În fraza aceasta se află',
			'În fraza aceasta se găsesc',
			'În fraza aceasta se pot număra',
			'În fraza aceasta se numără',
			'În fraza aceasta se pot observa',
			'În fraza aceasta se observă',
			'În fraza aceasta apar',
		],
		lastSeparators: [
			'și',
		],
		numerals: [
			'',
			'un @',
			'două @-uri',
			'trei @-uri',
			'patru @-uri',
			'cinci @-uri',
			'șase @-uri',
			'șapte @-uri',
			'opt @-uri',
			'nouă @-uri',
			'zece @-uri',
			'unsprezece @-uri',
			'douăsprezece @-uri',
			'treisprezece @-uri',
			'paisprezece @-uri',
			'cincisprezece @-uri',
			'șaisprezece @-uri',
			'șaptesprezece @-uri',
			'optsprezece @-uri',
			'nouăsprezece @-uri',
			'douăzeci @-uri',
			'douăzecișiunu @-uri',
			'douăzecișidouă @-uri',
			'douăzecișitrei @-uri',
			'douăzecișipatru @-uri',
			'douăzecișicinci @-uri',
			'douăzecișișase @-uri',
			'douăzecișișapte @-uri',
			'douăzecișiopt @-uri',
			'douăzecișinouă @-uri',
			'treizeci @-uri',
			'treizecișiunu @-uri',
			'treizecișidouă @-uri',
			'treizecișitrei @-uri',
			'treizecișipatru @-uri',
			'treizecișicinci @-uri',
			'treizecișișase @-uri',
			'treizecișișapte @-uri',
			'treizecișiopt @-uri',
			'treizecișinouă @-uri',
			'patruzeci @-uri',
			'patruzecișiunu @-uri',
			'patruzecișidouă @-uri',
			'patruzecișitrei @-uri',
			'patruzecișipatru @-uri',
			'patruzecișicinci @-uri',
			'patruzecișișase @-uri',
			'patruzecișișapte @-uri',
			'patruzecișiopt @-uri',
			'patruzecișinouă @-uri',
			'cincizeci @-uri',
			'cincizecișiunu @-uri',
			'cincizecișidouă @-uri',
			'cincizecișitrei @-uri',
			'cincizecișipatru @-uri',
			'cincizecișicinci @-uri',
			'cincizecișișase @-uri',
			'cincizecișișapte @-uri',
			'cincizecișiopt @-uri',
			'cincizecișinouă @-uri',
			'șaizeci @-uri',
			'șaizecișiunu @-uri',
			'șaizecișidouă @-uri',
			'șaizecișitrei @-uri',
			'șaizecișipatru @-uri',
			'șaizecișicinci @-uri',
			'șaizecișișase @-uri',
			'șaizecișișapte @-uri',
			'șaizecișiopt @-uri',
			'șaizecișinouă @-uri',
			'șaptezeci @-uri',
			'șaptezecișiunu @-uri',
			'șaptezecișidouă @-uri',
			'șaptezecișitrei @-uri',
			'șaptezecișipatru @-uri',
			'șaptezecișicinci @-uri',
			'șaptezecișișase @-uri',
			'șaptezecișișapte @-uri',
			'șaptezecișiopt @-uri',
			'șaptezecișinouă @-uri',
			'optzeci @-uri',
			'optzecișiunu @-uri',
			'optzecișidouă @-uri',
			'optzecișitrei @-uri',
			'optzecișipatru @-uri',
			'optzecișicinci @-uri',
			'optzecișișase @-uri',
			'optzecișișapte @-uri',
			'optzecișiopt @-uri',
			'optzecișinouă @-uri',
			'nouăzeci @-uri',
			'nouăzecișiunu @-uri',
			'nouăzecișidouă @-uri',
			'nouăzecișitrei @-uri',
			'nouăzecișipatru @-uri',
			'nouăzecișicinci @-uri',
			'nouăzecișișase @-uri',
			'nouăzecișișapte @-uri',
			'nouăzecișiopt @-uri',
			'nouăzecișinouă @-uri',
		],
	}

	auto.languages = auto.languages || {}
	Object.assign(auto.languages, {
		romanian,
	})
})()
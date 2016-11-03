"use strict"

var crypto = require('crypto'),
	R = require('ramda'),
	querystring = require('query-string')

const 
	URLBASE = 'https://apps.ticketmatic.com/widgets/',
	PARAMETERS = {
		all: ["l", "contactid", "skinid", "orderid", "returnurl"],
		addtickets: ["event", "product", "flow", "reservemoretickets", "saleschannelid", "ticketinfo", "extraevents", "extraproducts", "edit", "panels", "oncompletion", "withauthentication"],
		basket: ["flow", "edit", "reservemoretickets", "panels", "oncompletion"],
		checkout: ["panels", "oncompletion"]
	},
	
	filterWithKeys = (pred, obj) => R.pipe(
  		R.toPairs,
  		R.filter(R.apply(pred)),
  		R.fromPairs
	),

	inPayload = R.pipe(R.equals("l"), R.not),

	hasValue = R.pipe(R.isNil, R.not),

	concatFields = R.pipe(R.filter(inPayload), R.filter(hasValue), R.toPairs, R.sortBy(R.head), R.flatten, R.join('')),

	generatePayload = (accesskey, accountname, properties) => R.join('', [accesskey, accountname, concatFields(properties)]),

	generateSignature = (accesskey, accountname, properties, secret) => {
		let payload = generatePayload(accesskey, accountname, properties)
		return crypto.createHmac('sha256', secret).update(payload).digest('hex')
	},

	validProperty = R.curry((type, key, value) => R.and(R.contains(key, R.union(PARAMETERS.all, PARAMETERS[type])), hasValue(value)) )


module.exports = {

	generateUrl: (client, widgettype, properties) => {
		let validproperties = filterWithKeys(validProperty(widgettype))(properties),
			signature = generateSignature(client.key, client.shortname, validproperties, client.secret),
        	_parameters = R.merge(validproperties, {accesskey: client.key, signature: signature}),
        	query = querystring.stringify(_parameters)

		return R.join('', [URLBASE, client.shortname, '/', widgettype, '?', query])		
	}
}
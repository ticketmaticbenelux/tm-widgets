"use strict"

var crypto = require('crypto'),
	R = require('ramda'),
	querystring = require('query-string')

const
	TRUE = R.always(true),
	URLBASE = 'https://apps.ticketmatic.com/widgets/',
	PARAMETERS = {
		all: ["l", "contactid", "skinid", "orderid", "returnurl"],
		addtickets: ["event", "product", "flow", "reservemoretickets", "saleschannelid", "ticketinfo", "extraevents", "extraproducts", "edit", "panels", "promocode", "oncompletion", "withauthentication", "subscribe", "requiredfields"],
		addoptionbundles: ["event", "product", "flow", "reservemoretickets", "saleschannelid", "ticketinfo", "edit", "panels", "oncompletion", "withauthentication"],
		basket: ["flow", "edit", "reservemoretickets", "panels", "oncompletion", "subscribe"],
		checkout: ["panels", "oncompletion"],
		subscribe: ["fields", "requiredfields", "customfields"]
	},
	VALUES = {
		addtickets: {
			requiredfields: R.ifElse(R.isNil, TRUE, R.all(R.contains(R.__, ["customertitle", "phone", "birthdate"])))
		},
		subscribe: {
			fields: R.ifElse(R.isNil, TRUE, R.all(R.contains(R.__, ["customertitle", "address", "phone", "birthdate"]))),
			requiredfields: R.ifElse(R.isNil, TRUE, R.all(R.contains(R.__, ["customertitle", "address", "phone", "birthdate"])))
		}
	},

	filterWithKeys = (pred, obj) => R.pipe(
  		R.toPairs,
  		R.filter(R.apply(pred)),
  		R.fromPairs
	),

	hasValue = R.pipe(R.isNil, R.not),

	concatFields = R.pipe(R.omit(["l", "referral"]), R.filter(hasValue), R.toPairs, R.sortBy(R.head), R.flatten, R.join('')),

	joinArrays = R.map(R.when(R.is(Array), R.join(',')), R.__),

	generatePayload = (accesskey, accountname, properties) => R.join('', [accesskey, accountname, concatFields(properties)]),

	generateSignature = (accesskey, accountname, properties, secret) => {
		let payload = generatePayload(accesskey, accountname, properties)
		return crypto.createHmac('sha256', secret).update(payload).digest('hex')
	},

	validProperty = R.curry((type, key, value) => R.and(R.contains(key, R.union(PARAMETERS.all, PARAMETERS[type])), hasValue(value)) ),

	validateValues = R.curry((type, properties) => R.where(VALUES[type], properties))


module.exports = {

	generateUrl: (client, widgettype, properties) => {
		if(!validateValues(widgettype, properties)) {
			throw new Error("Some values are incorrect, cannot generate URL");
		}

		let validproperties = joinArrays(filterWithKeys(validProperty(widgettype))(properties)),
			signature = generateSignature(client.key, client.shortname, validproperties, client.secret),
        	_parameters = R.merge(validproperties, {accesskey: client.key, signature: signature}),
        	query = querystring.stringify(_parameters)

		return R.join('', [URLBASE, client.shortname, '/', widgettype, '?', query])
	}
}

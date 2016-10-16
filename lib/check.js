const path = require('path')

const checkFile = nomsg => (c, _) => {
	if (!c) throw new Error(nomsg)
	if (_) console.warn(`Only ${c} will be used`)
}

const checkType = type => ({
    css: _ => _ == '.css',
    requirable: _ => _ == '.js' || _ == '.json'
}[type] || (_ => {
    throw new TypeError(`Unknown type ${type}`)
}))

const checkSrcType = type => _ => checkType(type)(path.extname(_))

module.exports = {
    checkFile,
    checkType,
    checkSrcType
}
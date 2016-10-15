const css = require('css')
const ast = require('./ast.js')
const merge = require('lodash.defaultsdeep')
const reduceRight = require('lodash.reduceright')
const camelize = require('camelize')

// TODO: implement this function
const checkMedia = (cond, real) => true
const checkRule = (cond, real) => cond.some(v => v == real || v == '*')

const search = function (Class, Media) {
	return camelize(reduceRight(this, (prev, curr) => {
		if (curr instanceof ast.Rule)
			checkRule(curr.selector, Class) && merge(prev, curr.rules)
		else if (curr instanceof ast.Media)
			checkMedia(curr.media, Media) && merge(curr.rules, search(curr.rules, Class, Media))
		return prev
	}, {}))
}

module.exports = (...args) => search
	.bind(
		ast.parse(
			css.parse(...args)
		)
	)